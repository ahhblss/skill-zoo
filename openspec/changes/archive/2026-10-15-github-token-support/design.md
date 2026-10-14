# Design

## Context

See proposal.md for motivation. Three Rust functions currently issue all API reads, using the static reqwest client. Settings is an arbitrary string KV map saved atomically; startup loads it before AppState registration. The update manager is only mounted within SettingsView. React Query owns backend data. Existing mockito dev dependency is available but no desktop mockito tests currently use it.

## Goals / Non-Goals

**Goals:** Per-request current authentication without rebuilding the shared client; verify a candidate without publishing it; preserve saved/runtime consistency on failure; repository-local handling of proxy 403s.

**Non-Goals:** CLI authentication, gh credential import, keyring/encryption, ETag caching, OAuth/account management, automatic retries or new routing.

## Decisions

1. **Keep the agreed settings KV storage.** Store `github_token` in settings.json and remove its key on empty saves. No schema/path/version/lock semantics change: this uses the existing arbitrary desktop settings contract and needs no protocol fixture change. Public-only fine-grained tokens need no permissions; plaintext is accepted for this explicit use case. Unlike gh's general-purpose credentials, these instructions request no private repository access. Do not claim the app can enforce that a pasted token has no other permissions.
2. **Publish after durable save.** Use a global RwLock token slot initialized at startup, normalize at the backend as well as UI, and refresh only after settings save succeeds. Restore in-memory settings on a failed token write. Snapshot a token per request, never hold a lock across await. Test scopes follow the existing thread-local home isolation pattern rather than mutating process-global credentials across parallel tests.
3. **One small request builder.** Extend the existing GitHub service with `github_get`, retaining call-site timeout/Accept/fallback behavior. Candidate verification shares the header builder with an explicit token, never temporarily mutates the global slot. reqwest-middleware would require a client wrapper and new dependencies for three consumers; the small builder provides the same relevant benefit with fewer side effects. Non-GitHub archive/raw/image requests retain their client behavior.
4. **Verification on save, not every keystroke or mount.** Call `/rate_limit` with a 10-second timeout. HTTP 401 returns unauthenticated; HTTP 200 parses resources.core.limit, treating >=5000 as authenticated (also accepts legitimate higher quotas), and rejecting anonymous quota. Unexpected HTTP/JSON/transport failures produce errors without persistence. Existing saved values show a configured/reverify status until a successful save verifies them; no extra network traffic on settings mount. A blank save removes locally with no verify. Server state lives in query hooks; the input draft and feedback are UI state.
5. **403 classification remains explicit.** 403 plus remaining=0 and all 429s are RateLimited. Other 403s become DownloadUnavailable so the existing batch Err branch continues, preserving diagnostic accuracy instead of pretending the repository is missing. Secondary 403 limits without zero remaining are not newly detected in this scoped fix.
6. **Use existing settings placement.** Add a nearby always-visible section. The manager's close-autofocus handler scrolls/focuses the token input; ordinary closes still restore trigger focus. No new routes or navigation events. Use shared Input/Button, labels, described help/status, polite live feedback and IME-safe native form submission within Safari 16.4.

## Research and alternatives

- [GitHub conditional requests](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api#use-conditional-requests): exempt 304s require a correctly authorized Authorization header. The proposed anonymous ETag exemption is not an official guarantee. Caching also needs representations/invalidation and cannot fix first-request quota exhaustion, so it stays excluded.
- [GitHub quota endpoint](https://docs.github.com/en/rest/rate-limit/rate-limit): `/rate_limit` is exempt from the primary quota; it can still count toward secondary limits, supporting save-time verification rather than repeated background probes.
- [GitHub PAT guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens): fine-grained creation permits public-only access; no `/user` or private access check is needed for this goal.
- [gh auth login](https://cli.github.com/manual/gh_auth_login): browser/device auth and credential store are the defaults, with plaintext fallback and environment token support. Importing gh credentials introduces an external executable and potentially broader permissions; keyring/OAuth setup would exceed the agreed scope.
- [vercel-labs/skills issue #1574](https://github.com/vercel-labs/skills/issues/1574) records upstream 1.5.14's 403 + remaining=0 classification and token fallback via GITHUB_TOKEN/GH_TOKEN/gh. Current upstream src inventory was checked using GitHub contents API, but raw source retrieval failed; do not infer current implementation from that issue. We attach the explicitly configured token proactively rather than adding CLI fallback sources.
- [reqwest-middleware](https://docs.rs/reqwest-middleware/latest/reqwest_middleware/): generic middleware benefits larger policies, but adds no necessary capability to the existing three-function boundary.
- Other desktop PAT setup UX was considered, but the fetched JetBrains page only supplied a content stub and is not evidence for a product-specific claim. The explicit create/paste/save-time-check flow remains the scoped UX.

No material deviation from the default plan. Small clarifications: preserve 429; accept authenticated quotas above 5000; show configured status before fresh verification; refresh after durable save. No anonymous fallback for invalid saved credentials (would silently conceal revoked credentials).

## Risks / Trade-offs

- [Plaintext credential visible to local readers] → explicit accepted public-only threat model, masked UI, no token in query keys/errors/logging, no new credential sources. Arbitrary broad tokens are not restricted by verification.
- [Token revoked after save] → configured status is distinct from fresh verification; user can save again to verify or clear offline.
- [Request already in flight when token changes] → it keeps its captured header; subsequent requests use the new value.
- [Primary/secondary/proxy ambiguity for 403] → narrowly follow the confirmed zero-header rule, retain 429 semantics, document secondary 403 limitation.

## Migration Plan

No migration. Older settings files have no key and remain anonymous; removing the key restores previous behavior. Existing CLI files stay unchanged.

## Verification Evidence

- `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml`: **244 passed, 0 failed, 2 existing ignored tests** across unit/integration suites; doc tests passed. Output captured during this session in `/tmp/skill-zoo-pat-cargo.log`.
- `bun run test`: **31 files, 185 tests passed**. Final run output in `/tmp/skill-zoo-pat-frontend-final.log`.
- `bun run lint`, `bun run format`, `bun run format:check`, `bun run typecheck`: passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` and `bun run lint:rs` (Clippy with `-D warnings`): passed.
- `bun run build`: passed; existing theme-init non-module script and large-chunk advisory warnings remain outside scope.
- `openspec validate --all --strict`: passed before sync (11 items), after main-spec sync (12 items), and after archive (11 main specs; 0 failures). `openspec list --json` confirms no active changes. The five ADDED requirements and their Purpose/scenarios were compared against the new main spec before archiving. Archive used `--skip-specs` because the agent-driven spec sync had already completed and been verified; no behavior was omitted.
- Request-builder tests cover Authorization present/absent for tree, metadata, default README and branch README URL shapes, current-token capture and no client-wide archive header. Mockito exercises candidate Authorization, HTTP 401, authenticated 5000/15000, anonymous 60, unexpected status and malformed JSON; tree response tests cover 403 remaining=0/nonzero/missing and 429. The existing update-check loop was reviewed: only RateLimited stops it; DownloadUnavailable follows the continuing Err branch.
- Settings tests cover trimming, immediate runtime refresh, unrelated key preservation, blank key removal and failed write rollback for replacement/removal. UI tests cover verify-before-save, pending-submit protection, rejection/transport failure without persistence, persistence failure without active status, clearing without verification, configured versus verified status, actual quota display, opener URL, Chinese guidance, IME safety and rate-limit dialog close/scroll/focus (no entry for ordinary issues).
- Final diff reviewed: only desktop code/tests/i18n and OpenSpec artifacts; no CLI, dependencies, protocol schema/fixtures, cache or encryption changes. GitHub reads retain their prior timeouts and fallbacks. No tokens in query keys or error text. No commit or staging performed.
- Limits: no real PAT used, no live GitHub authenticated request or native three-engine visual smoke test performed. HTTP behavior is verified using constructed requests and local mock responses, with frontend interaction tests under jsdom.
