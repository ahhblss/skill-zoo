# Design

## Context

沿用现有 CSS／Framer Motion，不新增动画状态或框架。完整 desktop-ui 契约和研究结论已阅读。此次实施与有争议的卡片改版独立。

## Goals / Non-Goals

目标：补齐两处浮层的入场语言、明确主操作触感、响应系统减少动态效果。非目标：卡片材质、导航滑动、返回恢复、弹层退出状态机和新增设置。

## Decisions

- 两个小浮层共用 CSS entry，仅 opacity 与 translate，140ms、-3px，不加 delay；条件卸载维持现状。
- opt-in press-feedback 只加到安装与保存，不加在图标／拖拽宿主；:not(:disabled):active 缩放 .98，reduce 时无缩放。
- App／RepoDetail／BannerCarousel 使用一个 useSyncExternalStore 媒体查询订阅，显式关闭 opacity／spring／3D 切换的过渡；carousel effect 的 interval 随偏好变化清理，手动按钮仍有效。
- CSS 布局过渡使用局部 motion-reduce:transition-none，已有 Radix 入场使用 motion-reduce:animate-none；不全局改所有 transform，避免干扰拖拽。
- 不运行 Rust／CLI 全套测试：没有修改其代码；运行前端全套、lint、typecheck、format 和 build。轮播 interval／偏好切换是容易出错的状态路径，新增组件测试；低风险 CSS 用真实浏览器验证，不写仅复述 class 的测试。

## Risks / Trade-offs

系统 reduce 切换期间必须清理旧 interval；静态降级仍保留所有内容和加载说明。测试／浏览器记录采用 mock 数据，桌面 app 启动读取真实本地文件但不主动执行写操作。后续用户验收期间保留 dev 进程。

核验已安装 Framer Motion 13.4.0 的 use-reduced-motion.mjs：仅 useState 初值，不订阅组件更新。为满足运行中改变偏好的契约，增加局部 useReducedMotion hook，直接订阅 matchMedia change；不增加依赖。轮播测试使用真实媒体查询订阅，不 mock hook 返回值。
