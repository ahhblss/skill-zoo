# Tasks

## 1. Backend authentication

- [x] 1.1 Add runtime token initialization and durable settings refresh/removal; verify isolated settings tests cover normalization, unrelated settings and failed saves.
- [x] 1.2 Centralize GitHub API request construction and candidate verification; verify mock requests carry/omit Authorization and verification handles 401, 5000, anonymous quota and invalid responses.
- [x] 1.3 Migrate all tree/metadata/README consumers without changing timeouts; verify 403 zero/nonzero/missing and 429 response tests distinguish RateLimited from repository-local failures.

## 2. Desktop settings and guidance

- [x] 2.1 Add typed IPC/query hooks and bilingual token form; verify component tests cover verified save, rejection, failed persistence, offline clearing and creation link.
- [x] 2.2 Add rate-limited issue entry and settings input focus on dialog close; verify UI tests cover the entry and ordinary issue behavior.

## 3. Integration and closeout

- [x] 3.1 Run backend/frontend tests, lint, formatting, typecheck and strict OpenSpec validation; record actual evidence and research trade-offs in design.md.
- [x] 3.2 Review final diff for scope, secret handling and affected specs; verify packages/cli stays unchanged and all acceptance scenarios are covered.

## Workflow follow-up

- Sync github-connection into main specs, archive the completed change, and run strict validation again.
- Leave code and artifacts uncommitted for user review.
