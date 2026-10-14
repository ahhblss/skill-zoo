# Proposal

## Why

Desktop GitHub requests share the anonymous 60 requests/hour IP quota, so checking updates across many repositories quickly fails. A public-only personal access token raises the quota without requiring repository permissions.

## What Changes

- Add a bilingual GitHub connection section that verifies a pasted token before saving and supports removing it.
- Persist `github_token` in existing desktop settings and immediately refresh runtime authentication after successful saves.
- Route tree, metadata and README API requests through one authenticated request builder.
- Treat 403 as rate limiting only when `X-RateLimit-Remaining` is zero; keep other 403 failures local to their repository and retain 429 rate limiting.
- Provide a token configuration entry beside rate-limited update items.

## Capabilities

### New Capabilities

- `github-connection`: Desktop public GitHub API authentication, token verification/settings, and rate-limit recovery guidance.

### Modified Capabilities

None. Existing desktop-ui accessibility requirements continue to apply; filesystem installation and local protocol contracts do not change.

## Impact

Desktop Rust config/settings/GitHub services and request consumers; React settings/query hooks and English/Chinese resources. No dependency, CLI, protocol schema, cache, encryption, or routing infrastructure changes.
