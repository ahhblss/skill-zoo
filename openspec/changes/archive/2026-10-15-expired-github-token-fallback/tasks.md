# Tasks

## 1. Runtime credentials carry expiry

- [x] 1.1 Extend the runtime credential slot to token + parsed expiry; skip expired tokens when building API requests and keep tokens with absent/unreadable expiry attached. Verify unit tests cover expired, future, absent and unparseable values.
- [x] 1.2 Load both settings keys into the slot at startup.

## 2. Atomic credential saves

- [x] 2.1 Add the `save_github_credentials` command owning trim/removal semantics and one settings write; refresh the runtime slot only after a durable save and restore in-memory settings on failure.
- [x] 2.2 Remove the `update_setting` token special case and switch the frontend save hook to the single command; verify component tests cover verified save, clearing, expiry persistence and failed save.

## 3. Integration and closeout

- [x] 3.1 Run backend/frontend tests, lint, format, typecheck, build and strict OpenSpec validation; record evidence in verification.md.
- [x] 3.2 Confirm the CLI package, local-protocol fixtures and i18n resources are untouched; review the final diff for scope.

## Workflow follow-up

- Sync the github-connection delta into the main spec and archive the change.
- Leave code and artifacts uncommitted for user review.
