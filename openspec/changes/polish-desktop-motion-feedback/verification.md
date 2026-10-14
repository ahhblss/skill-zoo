# Verification

## 实施范围

- SkillHero 信息 popup 与 SkillAuditCard icon／compact popup 共用 140ms、3px 的 entry。保留 200ms hover 打开、150ms离开等原规则，不增加退出状态机。
- 安装入口、安装所选、确认安装与编辑器保存采用 opt-in press-feedback；不改卸载、图标按钮、Button 默认样式、卡片 hover 或主题。
- 系统 reduce 下页面／仓库预览切换 duration 0，轮播 interval 清理且手动切换 transition none；编辑面板／文件树／仓库折叠布局无过渡，Radix 菜单／对话框 animate-none 用 important 避免 data-state 动画优先级覆盖；加载图标静态保留。
- useReducedMotion 直接 useSyncExternalStore 订阅 matchMedia change。核验已安装 Framer Motion 13.4.0 的 hook 只读取初始 useState，所以未依赖它处理运行中偏好变化。

## 已执行检查

- `bun run test --maxWorkers=2`：30 文件、174 测试全部通过。新增 BannerCarousel 两个测试直接驱动真实媒体查询订阅，验证初始 reduce、手动切换、运行中停止／恢复 timer 与 unmount 清理。
- 初次默认并发测试在同时进行 Rust dev 编译时有四个 5 秒超时；未改 timeout 或断言。降低 worker 并完整重跑通过。其失败不算作通过证据。
- `bun run lint`、`bun run typecheck`、`bun run format:check`、`bun run build` 均通过。构建保留既有大 chunk／theme-init 警告；未顺手改打包策略。
- Radix reduced-motion 动画优先级补齐后，重新运行安装对话框、仓库详情、SkillHero、SkillContentPane 相关测试；4 个文件、10 项测试全部通过。
- 浏览器隔离页使用真实 Hero、Audit、SkillContentPane 和 SkillInstallDialog，IPC 只返回确定的无副作用样例；普通／reduce 两种状态验证实际 popup、按压、disabled 和运行中媒体查询更新。14/14 检查通过，0 browser exceptions。原始结果见 [evidence/measurements.json](evidence/measurements.json)。临时验证页面和脚本已移入下述外部归档。

按压采样使用 .0001 的 scale 容差，以免过渡末帧 .980014 被当成不是 .98；JSON 保留原始值。普通／reduce 的 Dialog entry 在打开 30ms 后采样，不以动画早已结束的截图冒充静态降级。没有用户偏好实验，也不把 Chromium 验证当三端实测。

## 本地 app

`bun run tauri dev` 编译完成并运行 `target/debug/skill-zoo`。本次开发 app PID 67594，CoreGraphics 只读窗口查询确认可见主窗口约 1100×700，AppKit activate 返回 true，已将开发窗口置前。保留 dev session 供用户验收。

开发过程中从 Framer hook 切到本地 hook 后，React 热更新缓存出现 hook-order 错误；通过 index.html 完整页面 reload 清除旧实例，后续 dev log 未新增运行错误。index.html 内容未修改。另一已有 skill-zoo 窗口未被关闭。

没有运行 Rust／CLI 全套测试，未修改其代码或本地协议。主 desktop-ui 已同步新增契约；最终 OpenSpec 全量严格校验结果见 tasks.md。

## 用户验收入口

1. 本地任意技能详情 → 标题右侧 `···` 悬停，看信息 popup；有仓库来源的技能旁盾牌按钮点击，看审计 popup。二者短暂淡入，不应改变位置或等待规则。
2. 发现 → 仓库 → 按住“安装／安装所选”；确认安装对话框内按钮也有按压。松开会沿用原点击动作，想只看触感可按住后移出按钮再松开。
3. 本地详情 → 编辑／分栏 → 改一个字符，保存出现后按住看反馈。验收只看触感时不要保存，离开按原未保存确认处理。
4. macOS 系统设置 → 辅助功能 → 显示 → 减弱动态效果。app 无需重启：浮层直接出现、按钮不缩放、页面／预览侧面板无过渡，发现页轮播不自动播放但箭头仍有效。恢复偏好后按既有周期恢复。

页面／RepoDetail 的 Framer duration 0 与 initial false 为结构复核，编辑布局降级沿用媒体查询 utility；未声称对完整 Tauri 页面切换做逐帧自动测量，最终原生体验由用户验收。OpenSpec 全量严格校验：12 passed、0 failed。

## 证据整理

完整原始页面、脚本与截图归档于 `/Users/alex/Documents/skill-zoo-review-artifacts/20261014-161438`，临时恢复方式见该目录 README.md；仓库只保留本文件和原始 14 项 [measurements.json](evidence/measurements.json)。manifest.json 已验证全部原件哈希。源码、测试、主 specs 和运行中的 app 未变；不再提供指向已移走脚本的仓库复现命令。
