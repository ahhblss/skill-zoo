# Tasks

## 1. 浮层与主操作

- [x] 1.1 两处浮层增加轻入场、安装／保存 opt-in 按压；真实组件浏览器检查 normal/reduce、disabled 与既有定位规则，记录证据。

## 2. 减少动态效果

- [x] 2.1 页面／侧面板／CSS 布局静态降级；浏览器观察最终内容和无过渡，既有组件测试通过。
- [x] 2.2 轮播随偏好停止／恢复自动播放、手动切换静态；新增测试验证初始 reduce、运行中偏好变化和清理 timer。

## 3. 集成与用户验收

- [x] 3.1 前端 tests／lint／format／typecheck／build 与 OpenSpec 全量严格校验通过，主 desktop-ui 同步本次实际行为并记录验证边界。
- [x] 3.2 启动 Tauri dev app，确认进程／窗口可用，给用户说明浮层、安装／保存和系统偏好的验收入口。

## Workflow follow-up

- 保持 dev app 运行，供用户验收；本次不自动归档或提交。
