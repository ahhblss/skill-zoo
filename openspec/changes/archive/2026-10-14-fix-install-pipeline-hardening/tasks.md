# Tasks

## 1. BOM frontmatter 修复

- [x] 1.1 `services/skill.rs` `extract_frontmatter` 剥离前导 BOM；新增回归测试：BOM 场景翻转断言（修复前 None、修复后 Some），无 BOM 行为不变。
- [x] 1.2 `cargo test --features test-helpers` 全绿。

## 2. 解压上限

- [x] 2.1 `config.rs` 新增 `MAX_EXTRACT_RATIO`/`MIN_EXTRACT_BYTES`/`MAX_EXTRACT_FILES` 常量，注释说明依据（研究 change 的威胁建模）。
- [x] 2.2 `services/cli.rs` 解压前预扫描：纯函数校验（注入阈值）+ `download_repo_zip` 接线；超限报错不写盘。
- [x] 2.3 单元测试：纯函数覆盖炸弹/海量条目/正常仓库三场景；真实 zip（zip crate writer）以注入小阈值验证超限即失败且解压目录为空。
- [x] 2.4 `cargo test --features test-helpers` 全绿。

## 3. 收尾

- [x] 3.1 lock 核查四项结论回填研究 change tasks §2（勾选并注记判定）。
- [x] 3.2 `bun run lint`、`bun run format:check`、`cargo clippy`、`cargo fmt --check` 通过；`openspec validate --all --strict` 通过（16/16）。前端 `bun run test` 因本机 vitest worker 环境故障无法执行（worker 启动即崩溃，与本次 Rust-only 改动无关），已在交付说明中标注。
- [ ] 3.3 archive 本 change（delta 同步主 specs）。
