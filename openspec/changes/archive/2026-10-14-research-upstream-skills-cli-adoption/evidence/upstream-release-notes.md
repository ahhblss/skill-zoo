# 上游 Release Notes 原始记录（抓取于 2026-10-14）

抓取方式：`gh api repos/vercel-labs/skills/releases --paginate`。仓库元数据：34,806 stars / 2,968 forks / MIT / pushed 2026-10-09 / latest v1.7.2。

版本结构：本仓库基线 v1.5.3（AGENTS.md 记载；npm 有发版但 GitHub 无对应 tag/release，tags 从 v1.5.1 直接跳到 v1.5.7）。之后 GitHub release 共 25 个：v1.5.7→v1.5.26、v1.6.0、v1.7.0、v1.7.1、v1.7.2。

## v1.7.2（2026-10-09）

- feat(sync): add --recursive for workspace packages (#2446)
- feat(sync): read optional and peer dependencies (#2445)
- feat(factory): focus triage on bugs and suggest related issues (#2422)
- fix: recognize BOM-prefixed skill frontmatter (#2421)
- fix(factory): keep triage comments short and readable (#2420)
- fix(factory): triage new bug-fix pull requests (#2418)
- feat(sync): remember the last agent selection (#2405)
- feat(sync): install git sources from package.json skills fields (#2403)
- refactor(sync): trim skills field handling (#2402)
- refactor(add): extract programmatic install primitives (#2401)
- feat(sync): read npm: entries from package.json skills fields (#2400)
- feat(sync): add --include and --exclude filters (#2399)
- feat(sync): remove skills that dependencies no longer ship (#2398)
- feat: preselect Grok Build with the default install agents (#2365)
- feat(sync): link skills into node_modules instead of copying (#2353)
- feat(sync): read skills from direct dependencies only (#2349)
- fix(update): honor locked paths with mirrored skills (#2231)
- fix: use `~/.agents/skills` for Codex global skills (#2067)
- feat: remove skills by source (#1779)

## v1.7.1（2026-10-06）

- Use skills.sh telemetry endpoints directly (#2391)
- Onboard skills CLI to Agent Factory (#2363)
- test: restore private repo CI coverage (#2328)
- fix: treat Pi as a universal (.agents/skills) agent (#2316)
- fix: skip unchanged project skills in `skills update` (#2315)
- Record global installs from a local path in the skill lock (#2301)

## v1.7.0（2026-09-17）

changelog 为空；与 v1.6.0 的 diff 仅 2 个 commit（download-source.ts、add.ts、cli.ts、notion-test），minor 号跳变不对应大功能。

## v1.6.0（2026-09-16）

- Split Labs badge into label and value (#2243)
- Add Labs status badges to README (#2242)
- fix: parse Azure Repos /_git/ URLs as git sources (#1962)

## v1.5.26（2026-09-11）

- fix(add): honor explicit project agent selection (#2216)
- Enable blob fast path for Remotion Skills (#2204)
- fix: preserve name/version/metadata in eve skill frontmatter (#1864)
- feat(add): add --json flag for machine-readable output (#1686)

## v1.5.25（2026-09-08）

- fix: fall back when skill snapshots omit files (#2069)
- fix(remove): only offer directories that hold a SKILL.md (#2055)
- fix: treat Droid as a universal agent to stop duplicate skill definitions (#2012)
- fix: point Kilo Code at .agents/skills and ~/.kilo/skills (#2011)
- feat: add fx agent support (#2006)
- feat: add Sarvam Code agent support (#2004)
- fix(add): exit non-zero when install prompts cannot run without a TTY (#1991)

## v1.5.24（2026-09-06）

- fix(update): migrate relocated skill paths (#2124)
- feat: support installing skills pinned to a commit SHA (#1439)

## v1.5.23（2026-08-18）

- Add Select All control to skill picker (#1999)
- fix: fail scoped well-known installs instead of falling back to the root index (#1990)
- fix: refuse remove --all when specific skills are named (#1964)
- fix: don't delete a skill from the same repo pinned to a different ref (#1953)
- fix: bypass blob snapshots for explicit refs (#1934)
- Fix internal skill filtering for well-known sources (#1921)
- fix: exclude internal skills from --skill '*' wildcard (#1909)
- feat: add Posit Assistant agent support (#1885)
- fix: secure private repository authentication (#1857)

## v1.5.22（2026-08-05）

- fix: discover skills nested under two categories (#1866)
- fix(update): normalize GitHub shorthand for project deletion checks (#1865)
- fix: preserve locked GitHub host during updates (#1837)
- Surface skills added upstream to well-known sources during update (#1824)
- Make skills update work for well-known installs (incl. skills.sh packs) (#1821)
- Preselect all skills when installing a skills.sh pack (#1820)
- Add MiniMax Code agent support (#1814)
- fix(remove): keep the lock entry while another agent still uses the skill (#1786)
- fix(find): show all registry results in non-interactive search (#1748)
- fix: store local path sources in lockfile using portable source (#1743)

## v1.5.21（2026-07-30）

- fix preserve well-known install urls (#1811)
- refactor: share zip extraction without yauzl (#1809)
- feat: support installing from direct archive URLs (#1671)

## v1.5.20（2026-07-22）

- fix: honor GH_HOST for GitHub Enterprise shorthand (#1752)
- Add Grok Build agent support (#1708)
- feat: add Kimchi agent support (#1707)
- fix(update): support full-depth skill updates (#1705)
- fix: apply claude-code symlink exemption to blob install path (#1608)
- fix: clean up upstream-deleted skills whose lock key differs from folder name (#1570)
- feat: show skill origin in list output (#1450)
- fix: remove missing skills from lock files during update/uninstall (#1357)
- fix: warn instead of silently skipping malformed SKILL.md files (#1058) (#1059)
- fix(cli): exit 1 on unknown command and honour subcommand --help (#1040)

## v1.5.19（2026-07-16）

- fix: avoid flicker when redrawing prompts (#1713)
- feat: improve grouped skill selection (#1706)
- fix: allow list git protocols (#1702)
- chore: require Node.js 22.20 or newer (#1701)

## v1.5.18（2026-07-16）

- test: isolate CLI helpers from agent environment (#1700)
- Fix existing type errors and enforce strict type checking (#1696)
- test: isolate CLI home directories (#1695)
- fix: install full skill directory for root-level SKILL.md repos (#1609)

## v1.5.17（2026-07-13）

- fix(add): duplicate copied install paths in add output (#1675)

## v1.5.16（2026-07-10）

- test: restore CI and cover LFS-less clones (#1627)
- Update modules + simplegit fix (#1626)
- feat: add install telemetry metadata (#1625)
- fix(update): preserve non-GitHub lock source URLs (#1614)
- fix(git): block ext transport (#1611)
- fix(installer): preserve copy modes and Claude symlinks (#1598)
- fix: never spawn skill updates through a shell (#1592)
- fix(detect-agent): ignore Cursor integrated terminal false positives (#1549)
- Add ZCode agent support (#1527)
- fix(update): preserve failure exit code (#1522)

## v1.5.15（2026-07-07）

- Revert "fix: block unsafe git transports" (#1596)
- fix: authenticate private repo tree fetches during update (#1595)
- fix: block unsafe git transports (#1589)

## v1.5.14（2026-06-29）

- fix: remove obsolete OpenClaw install warning (#1280)

## v1.5.13（2026-06-23）

- Allow filtering skills by owner (#1505)
- Add Eve subagent support to skills add/list/remove/update (#1467)

## v1.5.12（2026-06-18）

- Improve eve flow (#1459)
- Support eve agent (#1458)
- Fix local skills overwrite during all-agent installs (#1422)
- Create manifest.json (#1409)

## v1.5.11（2026-06-11）

- Create manifest.json (#1409)
- feat: support per-repo self-hosted blob download URLs (#1403)

## v1.5.10（2026-06-03）

- fix: fall back to gh and ssh for github clone auth (#1350)
- feat: add batch of agent integrations (#1349)
- fix(list): attribute canonical global skills to universal agents (#1348)
- feat: add kimi-code-cli agent support (#1347)
- feat: add Antigravity CLI support (#1345)
- fix(update): drop subpath append for non-shorthand sources (#1344)
- Fix global update for git skill sources (#1343)
- fix(agents): respect HERMES_HOME env var for Hermes Agent skill paths (#1341)
- feat: Add `run` command for running a skill without installing (#1120)

## v1.5.9（2026-05-27）

- Ignore vendored skills in packages, to prevent duplicate installations (#1281)

## 未覆盖边界

v1.5.7、v1.5.8 的 release notes 未抓取（fetch 输出截断于 v1.5.9），从主题连续性看属同类补丁，不影响本研究的任何判定。
