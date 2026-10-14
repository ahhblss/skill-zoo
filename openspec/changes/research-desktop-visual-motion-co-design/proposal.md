# Proposal

## Why

评估 Genesis 的视觉／动效技巧是否值得用于 Skill Zoo，避免把风格偏好或“与现状相似”当成确定收益。

## What Changes

- 研究文字层级、导航底板、卡片 hover、自定义浮层和主操作按压。
- 增量方案检查 co-design；替代 hover 直接 evaluate，再按收益与复杂度做 worth-fix 取舍。
- 保留当前裁决、两张统一 hover 关键对照及紧凑实测记录；原始页面、脚本、逐帧数据和旧报告移到仓库外，位置见 verification.md。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。本 change 是研究交付，`skip_specs: true`；未将卡片候选写入产品契约。

## Impact

研究依据为本机 Genesis 源码与 Skill Zoo 的真实组件。结果见 [design.md](design.md) 和 [verification.md](verification.md)。此研究本身不修改产品；用户后来选择的浮层、按压和减少动态效果由 `polish-desktop-motion-feedback` 实施。
