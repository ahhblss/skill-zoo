# Design

## Context

co-design 用于判断增量表达的协同；卡片 hover 是替代方案，直接比较优劣。已阅读 desktop-ui 和相关归档。基线与测量边界见 [verification.md](verification.md)。

## Goals / Non-Goals

目标：可复核地评估收益、代价并记录取舍。非目标：全站改版、增加主题／动画框架、改变搜索／返回／文件管理语义，或将审美判断冒充用户偏好事实。

## Decisions

| 候选 | 当前裁决 |
|---|---|
| 卡片文字层级 | 有可读性依据，独立候选；尚未实施 |
| 导航滑动底板 | 暂缓；现有选中态有效，收益不足以承担额外动画管理 |
| 卡片 hover | 用户否决深色 B／浅色 A 两套表达。统一描边 C 是低成本候选，现状 A 为零成本备选；卡片未实施 |
| 自定义浮层 entry | 仅技能信息／审计 popup 值得补齐，已有 Tooltip／Dropdown／Dialog 不叠动画；由 polish change 实施 |
| 主操作按压 | 仅安装／保存 opt-in，不全局缩放或侵入拖拽；由 polish change 实施 |

### hover 的直接评价

A 为现有 -2px 上浮＋shadow-md；B 为静止卡片＋表面提亮／描边；C 为静止卡片＋foreground/.2 描边，背景与静态阴影不变。保持文字、尺寸、数据和非 hover 材质相同。

- A/B：设计评审偏向深色 B；浅色 A 的浮起感与 B 的文字稳定各有优势。按主题采用的建议被用户明确否决，已撤回。B 的深色描述对比度由 4.19 降至 3.95，是采用代价。
- A/C：明暗共用一条规则，不新增 token／JS／状态。C 文字稳定、轮廓可辨，代价是少了浮起感且描边较硬；不是审美全面胜出。背景、阴影与文字对比度保持不变。
- 1px 轻上浮 D 是另一个统一方向，未制作／实测，不判胜负。

[浅色 A/C](evidence/hover-light.png) 和 [深色 A/C](evidence/hover-dark.png)：左 X=A，右 Y=C。这些是关键终态对照，不是实时录像或盲评。

### 实施选择

用户最终只授权三项高把握改进：自定义浮层轻入场、安装／保存按压、系统减少动态效果；实现记录在 [polish change](../polish-desktop-motion-feedback/proposal.md)。卡片材质、文字明度和导航底板均未实施。

## Risks / Trade-offs

局部机制可运行不等于用户偏好或效率提升。视觉候选应保留现状为有效对照；低复杂度优先，不以“顺手做”替代收益判断。实际生产集成必须核查目标 WebView、拖拽、定位和 focus；研究的 Chromium 检查不承担这些完整验收。
