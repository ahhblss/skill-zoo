# Tasks

## 1. Rust 端身份与迁移

- [x] 1.1 先写红测试：`src-tauri/tests/skill_service_test.rs`（或 persistence_test）构造含 `repo:owner/repo:demo` 星标的 metadata.json + SSOT 目录 `demo`、无 lock 条目，断言扫描后 `ssot:demo` 读到 `starred == true`；在当前代码上确认失败（cargo test --features test-helpers）
- [x] 1.2 `make_skill_id` 删除 provenance 分支（恒 `ssot:{dir}`），移除两处调用点（skill.rs:1466、:1661）随之不再需要的参数；`cargo test` 确认红测试转绿且既有测试不回归
- [x] 1.3 `MetadataStore::load_from` 实现 rekey：`repo:{owner}/{repo}:{dir}` → `ssot:{dir}`（`split_once(':')`），与既有 `ssot:` 条目 OR 合并，有变化即 `atomic_write` 落盘；单元测试覆盖：合并、无遗留键时零写入（幂等）、写回失败降级不阻塞加载（metadata.rs tests）
- [x] 1.4 恢复写回（commands/skill.rs:1985 区域）将 `original_skill_id` 经同一映射函数转规范键再写 metadata；测试：遗留 ID manifest 恢复后无需重启即读到星标，且 manifest 文件内容不变

## 2. CLI 镜像同步

- [x] 2.1 `packages/cli/src/protocol/scan.ts` 移除 repo 分支（恒 `ssot:${directory}`）；`store.ts` 的 metadata 读取应用与 Rust 相同的 rekey + OR 合并 + 持久化；`archive.ts` 恢复写回经同一映射
- [x] 2.2 更新/新增 CLI 测试：`scan.test.ts` 与 `archive.test.ts` 中断言 `repo:` ID 的用例改为新形态并补「来源漂移后星标存活」用例（bun test）

## 3. 协议文档与 fixtures

- [x] 3.1 新增 `fixtures/local-protocol/metadata-legacy-repo-keys.json`（含 `repo:`/`ssot:`/`agent:`/`external:` 键样本）及期望 rekey 结果的断言，接入双端协议 fixture 测试（`protocol_fixtures_test.rs` + `protocol-fixtures.test.ts`）
- [x] 3.2 `docs/local-protocol.md` 补充身份键规则、一次性 rekey 行为与恢复写回映射；维持「非 first-class 版本化协议文件」表述

## 4. 验证与门禁

- [x] 4.1 `openspec validate --all --strict` 与 `adrkit validate --all` 通过
- [x] 4.2 `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml`、`bun run test`、`bun run lint` 全绿
- [x] 4.3 用临时家目录手工演练一次「lock 丢失 → 重扫 → 星标存活」并记录证据（命令与输出）留档于本 change

## 5. 审查修复

- [x] 5.1 两端保留含冒号目录的完整身份，补回归测试
- [x] 5.2 CLI 迁移写回失败时告警并返回内存态，双端补失败测试
- [x] 5.3 恢复遗留 fixture，测试只迁移临时副本并验证落盘及源样本不变
- [x] 5.4 更新设计与证据，完成验证并同步主规格
