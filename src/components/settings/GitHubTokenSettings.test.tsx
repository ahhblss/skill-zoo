import "@/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { GitHubTokenSettings } from "./GitHubTokenSettings";

vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl: vi.fn().mockResolvedValue(undefined) }));

function renderSettings() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GitHubTokenSettings />
    </QueryClientProvider>,
  );
}

async function getInput() {
  const input = await screen.findByLabelText("Personal access token");
  await waitFor(() => expect(input).toBeEnabled());
  return input;
}

describe("GitHubTokenSettings", () => {
  let saved: string;

  beforeEach(async () => {
    await i18n.changeLanguage("en");
    saved = "";
    vi.mocked(invoke).mockReset();
    vi.mocked(openUrl).mockClear();
    vi.mocked(invoke).mockImplementation((command, args) => {
      if (command === "get_settings") return Promise.resolve({ github_token: saved });
      if (command === "verify_github_token") {
        return Promise.resolve({ authenticated: true, limit: 5000 });
      }
      if (command === "update_setting") {
        saved = (args as { value: string }).value;
        return Promise.resolve();
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
  });

  it("verifies the trimmed candidate before saving and reports the actual quota", async () => {
    const user = userEvent.setup();
    renderSettings();
    const input = await getInput();
    expect(input).toHaveAttribute("type", "password");
    await user.type(input, "  candidate-token  ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText("Active · quota: 5000 requests/hour");
    expect(invoke).toHaveBeenCalledWith("verify_github_token", { token: "candidate-token" });
    expect(invoke).toHaveBeenCalledWith("update_setting", {
      key: "github_token",
      value: "candidate-token",
    });
    const commands = vi.mocked(invoke).mock.calls.map(([command]) => command);
    expect(commands.indexOf("verify_github_token")).toBeLessThan(
      commands.indexOf("update_setting"),
    );
    expect(input).toHaveValue("candidate-token");
    await user.type(input, "-edited");
    expect(screen.queryByText("Active · quota: 5000 requests/hour")).not.toBeInTheDocument();
  });

  it.each([0, 60])(
    "rejects unauthenticated quota %s without replacing a saved token",
    async (limit) => {
      saved = "previous-token";
      vi.mocked(invoke).mockImplementation((command) => {
        if (command === "get_settings") return Promise.resolve({ github_token: saved });
        return Promise.resolve({ authenticated: false, limit });
      });
      const user = userEvent.setup();
      renderSettings();
      const input = await getInput();
      await user.clear(input);
      await user.type(input, "invalid-token");
      await user.click(screen.getByRole("button", { name: /^save$/i }));
      await screen.findByText(/Verification failed/);
      expect(vi.mocked(invoke).mock.calls.some(([command]) => command === "update_setting")).toBe(
        false,
      );
      expect(saved).toBe("previous-token");
      expect(input).toHaveValue("invalid-token");
    },
  );

  it("keeps saving disabled while verification is pending", async () => {
    let finish!: (result: { authenticated: boolean; limit: number }) => void;
    const verification = new Promise((resolve) => {
      finish = resolve;
    });
    vi.mocked(invoke).mockImplementation((command) => {
      if (command === "get_settings") return Promise.resolve({});
      return verification;
    });
    const user = userEvent.setup();
    renderSettings();
    await user.type(await getInput(), "candidate-token");
    const button = screen.getByRole("button", { name: /^save$/i });
    await user.click(button);
    await screen.findByText("Verifying and saving…");
    expect(button).toBeDisabled();
    expect(vi.mocked(invoke).mock.calls.some(([command]) => command === "update_setting")).toBe(
      false,
    );
    await act(async () => finish({ authenticated: false, limit: 0 }));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("shows verification network failures without persisting or exposing raw errors", async () => {
    vi.mocked(invoke).mockImplementation((command) => {
      if (command === "get_settings") return Promise.resolve({});
      return Promise.reject(new Error("raw candidate-token error"));
    });
    const user = userEvent.setup();
    renderSettings();
    await user.type(await getInput(), "candidate-token");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText(/Verification failed/);
    expect(screen.queryByText(/raw candidate-token error/)).not.toBeInTheDocument();
    expect(vi.mocked(invoke).mock.calls.some(([command]) => command === "update_setting")).toBe(
      false,
    );
  });

  it("does not report active when persistence fails after verification", async () => {
    vi.mocked(invoke).mockImplementation((command) => {
      if (command === "get_settings") return Promise.resolve({ github_token: "previous-token" });
      if (command === "verify_github_token")
        return Promise.resolve({ authenticated: true, limit: 5000 });
      return Promise.reject(new Error("disk write failed"));
    });
    const user = userEvent.setup();
    renderSettings();
    const input = await getInput();
    await user.clear(input);
    await user.type(input, "candidate-token");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText(
      "Could not save the token. Your previous configuration is still active.",
    );
    expect(screen.queryByText(/Active · quota/)).not.toBeInTheDocument();
  });

  it("removes a whitespace-only token without network verification", async () => {
    saved = "previous-token";
    const user = userEvent.setup();
    renderSettings();
    const input = await getInput();
    await user.clear(input);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText("Not configured · anonymous quota: 60 requests/hour");
    expect(invoke).toHaveBeenCalledWith("update_setting", { key: "github_token", value: "" });
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
    expect(input).toHaveValue("");
  });

  it("distinguishes a saved token from a fresh verification and opens the creation page", async () => {
    saved = "previous-token";
    const user = userEvent.setup();
    renderSettings();
    expect(await getInput()).toHaveValue("previous-token");
    await screen.findByText("Token configured · save to verify its current quota");
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
    await user.click(screen.getByRole("button", { name: "Open GitHub token creation page" }));
    expect(openUrl).toHaveBeenCalledWith("https://github.com/settings/personal-access-tokens/new");
  });

  it("does not submit Enter during IME composition", async () => {
    renderSettings();
    const input = await getInput();
    fireEvent.change(input, { target: { value: "token" } });
    expect(fireEvent.keyDown(input, { key: "Enter", isComposing: true })).toBe(false);
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
  });

  it("provides Chinese public-only instructions and anonymous status", async () => {
    await i18n.changeLanguage("zh");
    renderSettings();
    await screen.findByText("未配置 · 匿名配额 60 次/小时");
    expect(
      screen.getByText("此 Token 不需要任何仓库权限，无法访问你的私有仓库。"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Repository access 选择 Public Repositories/)).toBeInTheDocument();
    expect(screen.getByLabelText("个人访问令牌")).toHaveAttribute("type", "password");
  });
});
