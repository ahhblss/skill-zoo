# Verification

## 方法

- **对象**:17 个研究对象 = 16 个竞品仓库 + GitHub 官方 `gh skill`(文档研究,不克隆 cli/cli)。vercel-labs/skills 不在本 change 范围(research-upstream-skills-cli-adoption 已覆盖)。
- **克隆**:全部 `git clone --depth 1` 至 `~/Documents/GitHub/competitor-research/`,快照日期 2026-10-14(星数/push 日期为当日 GitHub API 值)。
- **执行**:4 个并行子代理分组深读(GUI 直接竞品 / GUI+micro / CLI 包管理器 / TUI+生态+官方),每组独立产出档案至 [evidence/dossiers/](evidence/dossiers/)。
- **档案纪律**:README 声明必须在源码中坐实才采信,结论带 file:line(相对各克隆根);`gh skill` 档案以官方文档 URL 为引用。90 分门槛(原实现 great / 架构兼容 / 收益>成本)对档案作者与综合者双重生效。
- **综合复核**:主会话逐份复读 17 份档案后写 [design.md](design.md);两处档案间张力(adopt 语义:csm vs jiweiyeah;tree-SHA 更新:skillfish vs gh)由综合者显式裁定并写明理由(§2-B、§2-E)。

## 声明与代码不符的实证记录(抽样)

- paks 的「CI 向设计」定位在代码中无证据(无 `--yes`/非交互/锁文件),按纪律不采信。
- chops 的 README 声称 FSEvents,实现为 DispatchSource(`FileWatcher.swift:23-61`);其搜索为内存 substring 全表扫,与「可搜索」的表观不符。
- skill-man README 宣称「70+ layout conventions」,代码实为 55 个 agent 定义(`internal/domain/agent/agent.go`)。
- asm README 徽标显示 297 stars,API 实测 955(README 滞后,非失实)。

## 边界

- **静态阅读,未运行竞品**:全部结论基于源码与官方文档,未对任何竞品做运行时行为验证。
- **浅克隆**:depth=1,未考古提交历史;设计意图以代码注释与现行实现为准。
- **时效**:gh skill 处于 public preview(「subject to change without notice」),其语义对齐项(§2-E)落地前需复核当版文档。
- **待核查项**:§2-H 中两项(审计日志现状、React Query 持久化)与 `reads_ssot_natively` 逐 agent 坐实,均为落地前核查,不影响本 change 的研究结论。
- 本 change 不修改产品代码与主 specs(`skip_specs: true`);吸收项的落地与验证由 tasks.md §4 队列中各独立 change 承接。
