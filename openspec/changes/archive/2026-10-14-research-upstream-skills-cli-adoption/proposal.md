# Proposal

## Why

本项目的 `CliService` 是对 vercel-labs/skills（`npx skills`）v1.5.3 的 Rust 重实现，AGENTS.md 要求「watch for upstream changes and mirror them」。上游半年内发布了 v1.5.7→v1.7.2（约 35 个 release），其中 v1.7.2 的 Codex 路径变更跟随了 OpenAI 官方标准化，可能使我方为 Codex 建立的 symlink 失效。需要逐条实证上游更新、判定哪些值得借鉴，并对与现有架构互为替代的方案论证优劣，而不是按 release notes 照单全收。

## What Changes

- 逐条对照上游 v1.5.3→v1.7.2 的 11 类更新，给出「坐实 / 部分属实 / 证伪」判定与四维评估（触发概率、影响面、修复成本、不修的后果）。
- 对三个互为替代的方案完成优劣评估：Codex 路径（上游 native-SSOT vs 我方 `.codex` symlink）、解压上限（上游 per-skill 阈值 vs 我方整仓 zip 场景）、`sync` 项目锁（上游 `skills-lock.json` vs 桌面自有协议）。
- 实证中发现一个我方现存缺陷：`extract_frontmatter` 不剥离 BOM，与上游 v1.7.2 #2421 同款（已用 rustc 编译实证）。
- 产出后续 change 队列：Codex 路径协议级跟进（最高优先）、BOM 修复（卫生级）、SHA 钉定、lock 边界核查清单等。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。本 change 是研究交付，`skip_specs: true`；不修改任何产品行为与主 specs。研究中发现的产品级缺陷与跟进项由后续独立 change 承接。

## Impact

研究依据为上游仓库（releases、PR、源码，经 `gh api` 实抓）与本仓库真实代码（file:line 引用）。实证方法与边界见 [verification.md](verification.md)，原始证据见 [evidence/](evidence/)，逐条判定与替代方案评估见 [design.md](design.md)。此 change 本身不修改产品代码；Codex 路径跟进属协议级变更（涉及 `fixtures/local-protocol/` 与 CLI 联动），需独立 change 立项。
