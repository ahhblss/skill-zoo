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

async function openDialog(label = "Personal access token") {
  await userEvent.setup().click(screen.getByRole("button", { name: /set up|manage|配置|管理/i }));
  const input = await screen.findByLabelText(label);
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
        const { key, value } = (args ?? {}) as { key?: string; value?: string };
        if (key === "github_token") saved = value ?? "";
        return Promise.resolve();
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
  });

  it("reflects the connection state on the row before any dialog is opened", async () => {
    saved = "previous-token";
    renderSettings();
    expect(await screen.findByText("Token configured")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("verifies the trimmed candidate before saving and reports the actual quota", async () => {
    const user = userEvent.setup();
    renderSettings();
    const input = await openDialog();
    expect(input).toHaveAttribute("type", "password");
    await user.type(input, "  candidate-token  ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findAllByText("Active · quota: 5000 requests/hour");
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
      const input = await openDialog();
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
    const input = await openDialog();
    await user.type(input, "candidate-token");
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
    const input = await openDialog();
    await user.type(input, "candidate-token");
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
    const input = await openDialog();
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
    const input = await openDialog();
    await user.clear(input);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findAllByText("Not configured · anonymous quota: 60 requests/hour");
    expect(invoke).toHaveBeenCalledWith("update_setting", { key: "github_token", value: "" });
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
    expect(input).toHaveValue("");
  });

  it("shows the verified token's expiry on the row and persists it", async () => {
    const user = userEvent.setup();
    vi.mocked(invoke).mockImplementation((command, args) => {
      if (command === "get_settings") return Promise.resolve({});
      if (command === "verify_github_token") {
        return Promise.resolve({
          authenticated: true,
          limit: 5000,
          expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        });
      }
      if (command === "update_setting") {
        const { key, value } = (args ?? {}) as { key?: string; value?: string };
        if (key === "github_token") saved = value ?? "";
        return Promise.resolve();
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
    renderSettings();
    await openDialog();
    await user.type(screen.getByLabelText("Personal access token"), "candidate-token");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findAllByText(/Active · quota: 5000 requests\/hour · expires /);
    expect(invoke).toHaveBeenCalledWith("update_setting", {
      key: "github_token_expires_at",
      value: expect.any(String),
    });
  });

  it("warns when the verified token expires within seven days", async () => {
    const user = userEvent.setup();
    vi.mocked(invoke).mockImplementation((command) => {
      if (command === "get_settings") return Promise.resolve({});
      if (command === "verify_github_token") {
        return Promise.resolve({
          authenticated: true,
          limit: 5000,
          expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        });
      }
      if (command === "update_setting") return Promise.resolve();
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
    renderSettings();
    await openDialog();
    await user.type(screen.getByLabelText("Personal access token"), "candidate-token");
    await user.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findAllByText(/expires soon/);
  });

  it("flags an expired saved token on the row without a fresh verification", async () => {
    saved = "previous-token";
    vi.mocked(invoke).mockImplementation((command) => {
      if (command === "get_settings") {
        return Promise.resolve({
          github_token: saved,
          github_token_expires_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        });
      }
      return Promise.reject(new Error(`Unexpected command: ${command}`));
    });
    renderSettings();
    await screen.findByText(/Token expired/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
  });

  it("distinguishes a saved token from a fresh verification and opens the creation page", async () => {
    saved = "previous-token";
    const user = userEvent.setup();
    renderSettings();
    expect(await screen.findByText("Token configured")).toBeInTheDocument();
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
    await openDialog();
    await user.click(screen.getByRole("button", { name: "Open GitHub token creation page" }));
    expect(openUrl).toHaveBeenCalledWith("https://github.com/settings/personal-access-tokens/new");
  });

  it("does not submit Enter during IME composition", async () => {
    renderSettings();
    const input = await openDialog();
    fireEvent.change(input, { target: { value: "token" } });
    expect(fireEvent.keyDown(input, { key: "Enter", isComposing: true })).toBe(false);
    expect(
      vi.mocked(invoke).mock.calls.some(([command]) => command === "verify_github_token"),
    ).toBe(false);
  });

  it("provides Chinese public-only instructions inside the dialog and anonymous status on the row", async () => {
    await i18n.changeLanguage("zh");
    renderSettings();
    await screen.findByText("未配置 · 匿名配额 60 次/小时");
    await openDialog("个人访问令牌");
    expect(
      screen.getByText("此 Token 不需要任何仓库权限，无法访问你的私有仓库。"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Repository access 选择 Public Repositories/)).toBeInTheDocument();
    expect(screen.getByLabelText("个人访问令牌")).toHaveAttribute("type", "password");
  });
});
