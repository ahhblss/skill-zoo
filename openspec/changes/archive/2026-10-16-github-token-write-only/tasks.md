# Tasks

## 1. Rust

- [x] 1.1 In `src-tauri/src/commands/settings.rs`: pure helper filtering credential keys from a settings map; wire it into `get_settings`.
- [x] 1.2 Pure helper returning `{ has_token, expires_at }` from a settings map; expose `get_github_credential_status` command; register in `src-tauri/src/lib.rs`.
- [x] 1.3 Tests: filtered map omits both credential keys and keeps others; status helper reflects present/absent/expiry states.
- [x] 1.4 `verify_saved_github_token` command: reads the saved token server-side (lock → clone → drop guard → await) and reuses the shared verification routine; register in `lib.rs`.

## 2. Frontend

- [x] 2.1 `src/lib/api/settings.ts`: `getGitHubCredentialStatus` typed invoke.
- [x] 2.2 `src/hooks/useSettings.ts`: `useGitHubCredentialStatus` replaces `useGitHubToken`/`useGitHubTokenExpiresAt`; save mutation invalidates the status query and no longer writes the token back into query data.
- [x] 2.3 `GitHubTokenSettings.tsx`: replace-only (no removal affordance), the saved credential stood in for by a real platform-glyph mask value with the unchanged-guard, standard text-editing behavior (no auto-selection).
- [x] 2.4 i18n zh/en: remove `clearHint`; replace-placeholder copy for the cleared-mask state.
- [x] 2.5 Component tests updated: no credential keys in `get_settings` mocks, new status command mocked, empty-input-on-open, replace flow, no removal affordance, no-removal-on-empty-save.
- [x] 2.6 Dialog-open live verification: `useGitHubTokenVerification` (enabled while the dialog is open with a saved token, staleTime 30s); save mutation seeds the verification cache; dialog status line shows verifying / live quota / no-longer-valid (amber) with saved-state fallback on transport failure; i18n `verifying` + `tokenInvalid`, `configured` copy folded into `configuredShort`; component tests for the three outcomes.

## 3. Specs

- [x] 3.1 Delta: RENAMED+MODIFIED "Token removal and startup" → "Token replacement and startup" (replacement-only), ADDED "Saved credential is never redisplayed" and "Dialog verifies the saved credential".
- [x] 3.2 Sync both into `openspec/specs/github-connection/spec.md`.

## 4. Gates

- [x] 4.1 `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml` green.
- [x] 4.2 `bun run test` green.
- [x] 4.3 `openspec validate --all --strict` passes.
