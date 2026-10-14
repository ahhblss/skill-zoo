## ADDED Requirements

### Requirement: 自定义技能浮层轻入场

技能信息与审计详情的自定义浮层 MUST 在普通运动偏好下使用短暂淡入和微小位移出现。动画 MUST NOT 增加打开延迟或改变定位、关闭规则。

#### Scenario: 打开小浮层
- **WHEN** 用户打开技能信息或审计详情浮层
- **THEN** 浮层以 140ms、3px 位移的轻入场显示，既有打开／关闭规则保持

### Requirement: 主操作按压反馈

安装入口、确认安装与编辑器保存按钮 MUST 在指针按住时提供 .98 缩放反馈，松开恢复。disabled 按钮 MUST NOT 触发按压缩放。反馈 MUST NOT 改变业务动作或影响拖拽宿主。

#### Scenario: 按住安装或保存
- **WHEN** 用户按住可用的安装或保存按钮
- **THEN** 按钮轻微缩小，松开恢复，业务仍按既有点击规则执行

#### Scenario: disabled 按钮
- **WHEN** 安装或保存按钮不可用
- **THEN** 按住不触发缩放或业务动作

### Requirement: 系统减少动态效果

当系统 `prefers-reduced-motion` 为 reduce 时，页面与仓库预览侧面板 MUST 直接显示最终状态，轮播 MUST 停止自动播放且手动切换 MUST 不播放过渡；自定义浮层、主操作按压、折叠布局与共享菜单／对话框 MUST 静态降级。偏好运行中改变时 MUST 清理轮播旧 timer，静态加载标识与操作入口 MUST 保留。

#### Scenario: 减少动态效果下浏览
- **WHEN** 系统偏好为 reduce，用户切换页面、打开侧面板或小浮层
- **THEN** 内容直接显示，不播放入场／位移过渡；按钮不缩放

#### Scenario: 偏好改变清理自动播放
- **WHEN** 轮播正在自动播放，系统偏好变为 reduce
- **THEN** 旧 timer 被清理，当前条目保持；手动切换仍可用且无过渡

#### Scenario: 恢复普通运动偏好
- **WHEN** 系统偏好恢复普通，轮播未悬停且有多个条目
- **THEN** 按既有 8 秒周期恢复自动播放，不留下重复 timer
