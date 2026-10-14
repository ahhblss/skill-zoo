# github-connection Specification

## Purpose

Defines desktop authentication for public GitHub API reads, verified token settings, and actionable recovery from rate-limited skill update checks.

## Requirements

### Requirement: Verified token settings

The desktop SHALL accept a trimmed personal access token, verify it against GitHub's rate-limit endpoint before saving, and display the authenticated hourly core quota. Invalid credentials, network errors, unexpected responses, and persistence failures SHALL NOT replace an existing saved token or its runtime authentication.

#### Scenario: Valid token saved
- **WHEN** the rate-limit endpoint returns HTTP 200 with core limit 5000 for the submitted token
- **THEN** saving persists the trimmed token and displays its effective quota
- **AND** subsequent requests use it immediately without restarting

#### Scenario: Invalid token rejected
- **WHEN** verification returns HTTP 401 or an anonymous core limit of 60
- **THEN** verification fails and the existing saved token remains unchanged

#### Scenario: Verification or save unavailable
- **WHEN** verification fails due to transport, unexpected HTTP status or malformed data, or settings cannot be persisted
- **THEN** an actionable failure is shown and saved/runtime authentication remains unchanged

### Requirement: Token removal and startup

A saved token SHALL supply desktop GitHub authentication at startup. Saving an empty or whitespace-only input SHALL remove the token without network verification and restore anonymous requests. A saved token SHALL NOT be presented as freshly verified merely because it exists on disk.

#### Scenario: Remove token offline
- **WHEN** the user clears the input and saves while offline
- **THEN** the token is removed from settings and new requests omit Authorization

#### Scenario: Restart with configured token
- **WHEN** the desktop starts with a saved token
- **THEN** GitHub API reads use it and the settings section distinguishes configured from freshly verified status

### Requirement: Authentication covers public API reads

Desktop tree, repository metadata, and README API reads (including explicit branch reads) SHALL attach `Authorization: Bearer <token>` when configured and omit it otherwise. Authentication SHALL NOT be added to unrelated downloads or external URLs. Existing request timeouts and consumer fallback behavior SHALL be preserved.

#### Scenario: Configured token used across consumers
- **WHEN** update checks, discovery metadata or README requests are built with a saved token
- **THEN** each GitHub API request carries the token

#### Scenario: Anonymous operation
- **WHEN** no token is configured
- **THEN** the same API reads omit Authorization

### Requirement: Forbidden responses do not poison update batches

For tree API responses the desktop SHALL classify HTTP 403 as rate limiting only when `X-RateLimit-Remaining` is exactly `0`. HTTP 429 SHALL remain rate limiting. Other HTTP 403 responses SHALL fail only the affected repository as temporarily unavailable and SHALL NOT stop checking the remaining repositories.

#### Scenario: Primary quota exhausted
- **WHEN** a tree response is HTTP 403 with remaining quota zero
- **THEN** checking stops with rate-limited diagnostics

#### Scenario: Proxy forbidden response
- **WHEN** a tree response is HTTP 403 with missing or nonzero remaining quota
- **THEN** the repository receives a temporary failure and the batch continues

#### Scenario: Too many requests
- **WHEN** a tree response is HTTP 429
- **THEN** checking stops with rate-limited diagnostics

### Requirement: Public-only setup and recovery guidance

The English and Chinese settings UI SHALL provide a masked, labeled token input, save action and GitHub fine-grained token creation link through the desktop opener. Instructions SHALL specify Public Repositories access and no repository permissions, explaining that this token cannot access private repositories. Rate-limited update items SHALL offer an entry that closes the dialog and reaches token settings.

#### Scenario: Create a public-only token
- **WHEN** the user follows the GitHub connection instructions
- **THEN** they can open GitHub's creation page, select Public Repositories with no permissions, and paste the generated token

#### Scenario: Recover from update rate limiting
- **WHEN** the user selects Configure GitHub Token beside a rate-limited update item
- **THEN** the update manager closes and the token settings input becomes reachable and focused
