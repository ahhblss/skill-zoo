# Verification

## Completeness / Correctness / Coherence

4 个新增行为要求均有实现；实现与 design 一致，没有扩大到任务队列、取消或持久化协议。所有测试为现有工具链运行，改动留在工作区，未提交。

| 要求 | 实现证据 | 验证证据 |
| --- | --- | --- |
| 弹窗关闭且任务继续 | SkillUpdateManagerDialog 去除三路拦截；全局 mutation 状态不迁移 | Dialog 组件测试覆盖 X / Esc / 外部点击与重开、历史操作 pending 关闭；Maintenance 集成测试关闭后任务继续、结算后历史刷新 |
| App 完成通知 | App 调用 useBackgroundSkillUpdates，订阅 success action，WeakSet 去重；设置页移除 toast | 监听测试覆盖 StrictMode、成功、部分/全部失败、noop、重复事件、重挂载、无关 mutation、拒绝仅全局错误一次、发起 hook 卸载与历史/列表失效、结算时中文语言 |
| 写入冲突消息 | AddrInUse → OperationInProgress → CommandError；install/update_skill 已返回结构化错误，update_all/remove 序列化传输；前端错误表映射 | 真实 lease 排他与释放测试断言稳定码、权限错误保留；序列化命令码测试；前端结构化/JSON 错误和中英文匹配 |
| 退出确认 | UpdateGuard 存活计数，CloseRequested 保留 WebView，ExitRequested 原生确认 | Rust 测试覆盖空闲、更新结束、存活、多 guard、取消、重复请求、单次批准、确认期间完成仍保留窗口、本地化资源完整性 |

## Gates

- `bun run test`: 33 files，197 tests passed。
- `cargo test --features test-helpers --manifest-path src-tauri/Cargo.toml`: 250 tests passed；2 个原有性能测试按仓库标记 ignored，0 failed。最终重跑退出重启排除修改后仍全部成功。
- `bun run lint`: exit 0。
- `bun run format` 和 `bun run format:check`: exit 0。
- `bun run lint:rs`: clippy `-D warnings`，exit 0。
- `openspec validate --all --strict`: 归档前及同步后 12 items passed；归档后 11 main specs passed，0 failed。
- 额外：`bun run typecheck`、`bun run format:rs:check` 和 `git diff --check` 均通过。

## Limits and trade-offs

退出状态由 Rust 实际更新命令判断，放弃前端 pending 的异步状态镜像；检查失效阶段不再保护退出，因为文件更新已结束。冲突消息承认其他写操作/CLI 也可能持锁。

macOS Cmd+Q、默认应用菜单 Quit、Dock Quit 的限制已由锁定 Tao 源码和上游问题核实，按授权降级；窗口关闭和托盘退出已添加保护。Tauri 的应用升级重启明确忽略 prevent_exit，因此不显示虚假的可取消确认。未改造原生 delegate、fork 框架或增加任务队列。

没有对真实已安装 skills 发起更新/删除，没有人工点击原生确认窗口，也没有 Windows/Linux 实机检查；原生事件连线经编译、状态测试和锁定框架源码核对，不能把它表述为全平台人工端到端验证。

## Archive

主规格 desktop-ui 已精确同步 4 条新增要求，原有 Purpose 和要求保持。任务 5/5 完成。使用 openspec archive background-skill-updates --yes --skip-specs 归档；skip-specs 仅跳过已完成的重复合并，归档后再次比对主规格与 delta 并通过全量严格校验。
