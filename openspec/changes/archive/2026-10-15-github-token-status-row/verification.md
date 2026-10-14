# Verification

## Completeness / Correctness / Coherence

Doc-only change: the requirement was written from the shipped component behavior (`GitHubTokenSettings.tsx` status derivation, `EXPIRY_SOON_MS`) and its passing component tests, then synced into the main spec.

- Delta and main spec compare verbatim for the added requirement.
- `openspec validate --all --strict` passes with the change active and after archive.
- `git status` during the change: only OpenSpec files modified; no Rust, frontend, i18n, CLI or fixture edits.

## Limits

No runtime behavior changed, so the existing component tests remain the behavioral evidence; this change only closes the spec gap left by commit 2623992.
