# 演练证据（Task 4.3）

日期：2026-10-21。场景：lock 已丢失、metadata.json 仍按历史 provenance 键记录星标。

## 初始状态

```
$DEMO_HOME/.agents/skills/code-audit/SKILL.md   # 技能目录仍在（文件系统是事实源）
$DEMO_HOME/.skill-zoo/metadata.json:
{"entries": {"repo:owner/repo:code-audit": {"starred": true, "isMine": false}}}
```

## 第一次扫描（CLI 真实命令 `list --json`，tsx 入口）

```
scanned id: ssot:code-audit | starred: True | isMine: False
```

ID 不再含 provenance；星标经读取期 rekey 挂回。

## 迁移收敛落盘

```
$DEMO_HOME/.skill-zoo/metadata.json:
{
  "entries": {
    "ssot:code-audit": { "starred": true, "isMine": false }
  }
}
```

旧键 `repo:owner/repo:code-audit` 消失，一次性迁移已持久化。

## 幂等复扫

```
re-scan id: ssot:code-audit | starred: True
（文件内容不变，键稳定）
```

## 对照（修复前）

同一场景在改动前的代码上，集成测试 `metadata_survives_lost_provenance`
实测失败：`star must survive provenance loss (lock gone)`（红→绿的「红」半程）。

## 2026-10-21 审查修复证据

- 修复前执行 `bun run cli:test -- scan.test.ts`：新增两个测试失败，分别显示 `ssot:foo:bar` 的 `starred/isMine` 为 false，以及迁移重命名失败向外抛出 `permission denied`。
- 修复前执行 `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml persistence::metadata::tests -- --nocapture`：冒号回归断言失败（实际 `ssot:bar`，预期 `ssot:foo:bar`）。写回失败测试使用临时目录阻断原子临时文件，确认 Rust 返回已迁移状态且旧文件字节不变。
- 双端按 `repo:` 后第一个冒号拆分，保留完整目录。CLI 仅在读取期迁移写回失败时告警降级；显式写入仍返回错误。
- 恢复含 `repo:` 键及 OR 合并冲突的 fixture，增加冒号目录样本。Rust 先复制到临时目录再加载；双端断言输入确有旧键、落盘与内存一致、仓库源样本字节不变。
- 修复后 CLI 全套 113 项通过，CLI 类型检查、lint、前端格式检查、Rust 格式检查、OpenSpec strict 与 ADR 校验通过。
- 验证边界：冒号目录的真实文件系统扫描回归在 Windows 跳过（该平台不允许此目录名），共享 fixture 的字符串迁移断言仍跨平台执行；CLI 写失败通过 rename 注入 EACCES，Rust 写失败通过真实临时文件冲突触发。

## 最终验证

- `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml`：267 passed，2 ignored，0 failed。
- `bun run cli:test`：113 passed；`bun run cli:typecheck` 通过。
- 首次全套前端并行验证遇到未改动用例 `keeps an update running after close and refreshes history when reopened` 的 5 秒超时（207 passed，1 timeout）；该文件单独复跑 9 项通过，随后 `bun run test -- --maxWorkers 2` 全套 208 项通过，未调整测试超时或产品代码。
- `bun run lint`、`bun run format:check`、`cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`、`git diff --check` 通过。
- `openspec validate --specs --strict`、`openspec validate --all --strict`、`adrkit validate --all` 通过。
- `local-protocol` 主规格同步了全部 3 条新增要求及场景；既有标题、Purpose 和所有原有要求逐字保留。fixture 测试后仍含原始 repo 键，未被改写。
