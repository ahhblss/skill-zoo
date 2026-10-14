# GitHub Connection Delta

## Purpose

Defines desktop authentication for public GitHub API reads, verified token settings, and actionable recovery from rate-limited skill update checks.

## ADDED Requirements

### Requirement: GitHub connection status row

The GitHub connection settings row SHALL derive its status line from persisted settings and the latest verification: the anonymous hourly quota when no token is saved, a configured state for a saved token that has not been freshly verified, and the effective hourly quota and recorded expiry after a successful save-time verification. The status line SHALL use the warning color once the recorded expiry has passed or falls within seven days.

#### Scenario: Settings still loading
- **WHEN** the settings section mounts and settings have not loaded yet
- **THEN** the row shows a loading state

#### Scenario: Settings cannot be loaded
- **WHEN** loading settings fails
- **THEN** the row shows a load-failure state instead of an empty or stale status

#### Scenario: No token saved
- **WHEN** the settings section loads without a saved token
- **THEN** the row shows the anonymous hourly quota instead of a configured state

#### Scenario: Saved token without fresh verification
- **WHEN** a token is saved and has not been verified in this session
- **THEN** the row shows the configured state and does not claim a verified quota

#### Scenario: Freshly verified token
- **WHEN** verification succeeds while saving a token
- **THEN** the row shows the effective hourly quota and the recorded expiry

#### Scenario: Expiry approaching or passed
- **WHEN** the recorded expiry falls within seven days or has passed
- **THEN** the status line uses the warning color, and an expired token additionally shows the expired state while requests fall back to the anonymous quota
