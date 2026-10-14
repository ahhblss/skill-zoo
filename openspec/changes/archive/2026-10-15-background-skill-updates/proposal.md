# Proposal

## Why

更新管理弹窗阻止用户在更新期间返回其他页面，尽管更新本身不依赖弹窗存活。关闭与导航后仍需收到结果，并对并发写入和真实退出提供清晰反馈。

## What Changes

- 更新管理弹窗在更新、检查及历史操作期间均允许 X、Esc、外部点击关闭。
- App 级订阅批量更新结果，成功、部分失败、全部失败及无更新均只通知一次；保留历史及缓存失效。
- 安装、更新、删除遇到 lease 冲突时返回稳定错误码并显示中英文友好消息。
- 为框架支持的真实退出入口添加原生确认；记录 macOS Cmd+Q/Dock 退出的框架限制。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `desktop-ui`: 后台更新、完成通知、写入冲突反馈和退出确认。

## Impact

涉及更新弹窗、设置页、App 常驻监听、错误映射、Rust lease 和退出事件处理。复用已有 Query、Radix、sonner 和原生 dialog 插件，不添加依赖，不修改持久化协议、事务语义或 CLI。
