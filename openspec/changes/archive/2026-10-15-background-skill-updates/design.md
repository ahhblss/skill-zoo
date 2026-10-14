# Design

## Context

动机见 proposal.md。现有 mutation 存活于全局 Query cache，设置页的 per-call onSuccess 只在组件挂载时触发。所有更新写入已有 lease 和回滚；历史由 Rust 写入，hook 负责失效。src-tauri/src/lib.rs 没有 CloseRequested/ExitRequested 处理；tray.rs 的退出为 app.exit(0)。不存在窗口关闭隐藏到托盘策略。

## Goals / Non-Goals

复用 mutation、事务和历史，关闭仅是 UI 动作。退出保护只增加命令存活计数与确认状态，不引入任务队列。不会添加选中持久化、取消、百分比或本地页禁用。

## Decisions

### 关闭沿用 Radix，完成反馈移至 App

移除全部 busy 关闭拦截，保留操作按钮各自禁用和焦点恢复。App 常驻 hook 订阅 MutationCache updated action 的 success 事件，仅匹配精确 updateAllSkills key，使用弱引用集合按 mutation 实例去重，不重播历史成功。错误继续使用 main.tsx 全局 mutation onError，避免双 toast。设置页只保留成功后的检查结果 reset。无需额外后台任务服务。

调研：[TanStack MutationCache](https://tanstack.com/query/v4/docs/reference/MutationCache) 与 [mutation callbacks](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation)。modern-web-guidance 的 platform-controls-dismiss-dialog / light-dismiss-a-dialog 推荐原生 closedby，但明确 Safari 不支持；这里保留现有 Radix 行为，不迁移控件或增加浏览器门槛。Rust 进度事件、任务注册表和持久化队列会引入第二套状态和生命周期，收益不足，放弃。

### 精确分类 lease 冲突

新增 AppError::OperationInProgress，仅 AddrInUse 映射此类；权限等 bind 失败保持 IO。安装与单个更新已返回 CommandError；批量/所选更新和删除仍保持 String 错误签名，但 lease 错误用现有序列化 CommandError 模式传出（前端已解析 JSON 字符串），不批量重构命令错误类型。中英提示表述为“有更新或其他写入任务正在进行”，因为 CLI/其他写操作也可能持锁，避免误报一定是更新。不改变锁端口、获取时机、恢复或磁盘协议。

### 退出使用 Rust 存活 guard，而不是同步前端 pending

偏离默认方案：更新全部/所选命令进入时创建 RAII guard，所有返回路径/取消时 Drop 结束计数。RunEvent::ExitRequested 统一判断；CloseRequested 在更新期间先 prevent_close 再请求 app.exit(0)，确保取消后 WebView 和 mutation 仍存活。原生 dialog 使用现有插件，异步回调确认后一次性批准重新发出的退出事件；重复请求合并，取消后可再次确认。用中英 JSON 文案（由已同步托盘语言选择）避免两份文案。

相较“前端 MutationCache pending → IPC 设置退出状态”，Rust guard 避免异步同步与退出的竞态、组件卸载/页面冻结影响，且无需暴露任意前端可写退出状态命令。取舍是 mutation 在进入/离开 Rust 命令前后的短暂 pending（如缓存失效阶段）不要求退出确认，此时尚无/已无文件更新，保护目标已满足。

### 退出路径调查与明确降级

当前锁定 Tauri 2.11.5 / runtime-wry 2.11.4 / Tao 0.35.3。runtime-wry 在最后一个窗口 Destroyed 时请求退出：当前窗口关闭是真实退出，不是托盘隐藏。app.exit(0) 明确发出 ExitRequested，托盘可覆盖。

macOS Cmd+Q / 默认应用菜单 Quit / Dock Quit 经 NSApplication terminate:，锁定 Tao 的 app_delegate.rs 仅注册 applicationWillTerminate:，没有 applicationShouldTerminate:；普通 ExitRequested 无法阻止这一路径。[上游 #13778](https://github.com/tauri-apps/tauri/issues/13778) 指向 [#12978](https://github.com/tauri-apps/tauri/issues/12978) 和 [#9198](https://github.com/tauri-apps/tauri/issues/9198)。依用户明确降级授权，保留这些系统路径的限制，不宣称全平台所有退出入口已保护。放弃替换 NSApplication delegate、ObjC swizzling / fork Tao 和改造系统菜单：前者影响框架所有原生生命周期并增加 unsafe 平台代码，后者只能覆盖 Cmd+Q 仍不能覆盖 Dock，成本明显失衡。Windows/Linux 的窗口关闭和托盘退出采用相同保护；强制终止不属于可拦截用户退出。

## Risks / Trade-offs

- 确认退出仍会中断更新 → 明确用户选择，保留已有事务回滚方案，不添加取消协议。
- 原生确认期间任务可能完成 → 用户仍可退出或取消；随后新请求按实际存活状态判断。
- Tauri RESTART_EXIT_CODE 明确忽略 prevent_exit → 不为不能取消的应用升级重启显示虚假确认，升级重启保持既有行为，本改动只保护用户普通退出。
- macOS 系统退出绕过事件 → 上述明确降级，常用窗口/托盘入口仍保护。
- 不重播旧结果 → App 常驻订阅；卸载后重新挂载只处理新结算事件。

## Migration Plan

没有数据迁移或新依赖。撤销代码即可回退 UI 和退出行为，锁/历史格式不变。
