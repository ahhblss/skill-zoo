import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import { useEditorState } from "./useEditorState";
import { createQueryWrapper } from "@/test/utils";
import type { InstalledSkill } from "@/types/skills";

vi.mock("@tauri-apps/api/core");
vi.mock("@tauri-apps/api/event", () => ({ listen: vi.fn() }));

const mockSkill: InstalledSkill = {
  id: "skill-1",
  name: "Test Skill",
  directory: "/path/to/skill-1",
  apps: { "claude-code": true },
  origin: "ssot",
  starred: false,
  isMine: false,
  installedAt: 1000,
  updatedAt: 2000,
};

describe("useEditorState save revision", () => {
  beforeEach(() => {
    vi.mocked(invoke).mockReset();
  });

  it("keeps input typed during a save instead of resetting to the saved revision", async () => {
    let resolveSave!: () => void;
    vi.mocked(invoke).mockImplementation((_cmd) => {
      const cmd = _cmd as string;
      if (cmd === "get_installed_skills") return Promise.resolve([mockSkill]);
      if (cmd === "read_skill_text") return Promise.resolve("# v1");
      if (cmd === "write_skill_text") {
        return new Promise<void>((resolve) => {
          resolveSave = resolve;
        });
      }
      return Promise.resolve(null);
    });
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEditorState(), { wrapper });

    act(() => result.current.openEditor("skill-1", "/path/to/skill-1", "Test Skill"));
    await waitFor(() => expect(result.current.localContent).toBe("# v1"));

    act(() => result.current.updateContent("# submitted"));
    act(() => result.current.save());
    await waitFor(() => expect(result.current.savePending).toBe(true));

    // The user keeps typing while the save request is in flight.
    act(() => result.current.updateContent("# submitted and extended"));

    await act(async () => {
      resolveSave();
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.savePending).toBe(false));

    expect(result.current.dirty).toBe(true);
    expect(result.current.localContent).toBe("# submitted and extended");
  });

  it("clears dirty when nothing was typed during the save", async () => {
    vi.mocked(invoke).mockImplementation((cmd) => {
      if (cmd === "get_installed_skills") return Promise.resolve([mockSkill]);
      if (cmd === "read_skill_text") return Promise.resolve("# v1");
      return Promise.resolve(null);
    });
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEditorState(), { wrapper });

    act(() => result.current.openEditor("skill-1", "/path/to/skill-1", "Test Skill"));
    await waitFor(() => expect(result.current.localContent).toBe("# v1"));

    act(() => result.current.updateContent("# submitted"));
    await act(async () => {
      result.current.save();
    });
    await waitFor(() => expect(result.current.savePending).toBe(false));

    expect(result.current.dirty).toBe(false);
  });

  it("confirms a skill switch when auxiliary drafts are unsaved", () => {
    const externalUnsaved = { current: false };
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEditorState(externalUnsaved), { wrapper });

    act(() => result.current.openEditor("skill-1", "/path/to/skill-1", "Test Skill"));
    expect(result.current.open).toBe(true);
    expect(result.current.pendingOpen).toBeNull();

    // SkillContentPane reports unsaved auxiliary drafts after the editor opened.
    externalUnsaved.current = true;
    act(() => result.current.openEditor("skill-2", "/path/to/skill-2", "Another Skill"));

    expect(result.current.pendingOpen).toEqual({
      id: "skill-2",
      dir: "/path/to/skill-2",
      name: "Another Skill",
    });
    expect(result.current.open).toBe(true);
  });
});
