import "@/i18n";
import { StrictMode, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { formatApiError } from "@/lib/api/errors";
import { useUpdateAllSkills } from "./useSkills";
import { useBackgroundSkillUpdates } from "./useBackgroundSkillUpdates";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }));

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false, onError: (e) => toast.error(formatApiError(e)) } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StrictMode>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </StrictMode>
  );
  const listener = renderHook(useBackgroundSkillUpdates, { wrapper });
  return { client, wrapper, listener };
}

describe("background skill update notifications", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("en");
  });

  it.each([
    [5, 0, [], "success", "5 skill(s) updated successfully"],
    [
      5,
      1,
      ["Rate limited: owner/repo"],
      "warning",
      "5 skill(s) updated, 1 failed: GitHub requests are temporarily rate limited. Please try again later.",
    ],
    [0, 1, [], "error", "Update failed: 0 updated, 1 failed"],
    [0, 0, [], "success", "All skills are up to date"],
  ] as const)(
    "notifies once for %s successes and %s failures",
    async (successCount, failCount, errors, kind, message) => {
      const { client, listener, wrapper } = setup();
      const result = { skills: [], successCount, failCount, errors };
      const mutation = client.getMutationCache().build(client, {
        mutationKey: ["updateAllSkills"],
        mutationFn: async () => result,
      });
      await act(() => mutation.execute(undefined));
      expect(toast[kind]).toHaveBeenCalledExactlyOnceWith(message);
      act(() =>
        client
          .getMutationCache()
          .notify({ type: "updated", mutation, action: { type: "success", data: result } }),
      );
      listener.unmount();
      renderHook(useBackgroundSkillUpdates, { wrapper });
      act(() =>
        client
          .getMutationCache()
          .notify({ type: "updated", mutation, action: { type: "continue" } }),
      );
      expect(toast[kind]).toHaveBeenCalledTimes(1);
    },
  );

  it("continues after the initiating hook unmounts and invalidates history", async () => {
    const { client, wrapper } = setup();
    client.setQueryData(["skills", "updateHistory"], []);
    client.setQueryData(["skills", "installed"], []);
    let finish!: (result: unknown) => void;
    vi.mocked(invoke).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const updater = renderHook(useUpdateAllSkills, { wrapper });
    act(() => updater.result.current.mutate(undefined));
    await waitFor(() => expect(invoke).toHaveBeenCalled());
    updater.unmount();
    expect(client.isMutating({ mutationKey: ["updateAllSkills"] })).toBe(1);
    await i18n.changeLanguage("zh");
    act(() => finish({ skills: [], successCount: 1, failCount: 0, errors: [] }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledExactlyOnceWith("1 个技能更新成功"));
    expect(client.getQueryState(["skills", "updateHistory"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["skills", "installed"])?.isInvalidated).toBe(true);
    expect(client.isMutating()).toBe(0);
  });

  it("ignores unrelated mutations and gives rejected commands only the global error toast", async () => {
    const { client } = setup();
    const cache = client.getMutationCache();
    await act(() =>
      cache
        .build(client, { mutationKey: ["installSkills"], mutationFn: async () => ({}) })
        .execute(undefined),
    );
    expect(toast.success).not.toHaveBeenCalled();
    const mutation = cache.build(client, {
      mutationKey: ["updateAllSkills"],
      mutationFn: async () => {
        throw { code: "operationInProgress", message: "raw lease" };
      },
    });
    await act(async () => {
      await expect(mutation.execute(undefined)).rejects.toMatchObject({
        code: "operationInProgress",
      });
    });
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(
      "An update or another write operation is in progress. Please try again later.",
    );
    expect(toast.warning).not.toHaveBeenCalled();
  });
});
