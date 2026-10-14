# Verification

## 实测摘要

Skill Zoo 研究基线 `c0b0263df21a1c08dd35aed5728cb2aaf40eb0e7`；Genesis 基线 `6997c9a4fcb76048ce3458af39a8e4b0b913583c`。Chrome 154.0.8037.99。紧凑记录见 [results.json](evidence/results.json)。

| 轮次 | 条件 | 通过 | 关键事实 |
|---|---|---|---|
| 初版组件对照 | 800／1280 × 明暗 × 中英，8 组 | 64/64 | 描述对比度浅色 3.76 → 5.14、深色 4.19 → 5.85；来源未改变，不能称整卡通过可读性验收 |
| hover A/B | 800／1280 × 明暗，4 组 | 44/44 | 静态六卡等价；B 文字位移为 0；深色表面提亮使描述对比度 4.19 → 3.95 |
| hover A/C | 同上，4 组 | 44/44 | C 明暗一条描边规则；背景／阴影不变；描述对比度浅色维持 3.76、深色维持 4.19 |

三轮 browser exceptions 均为 0。源码组件、布局和文字固定；CDP 指针触发真实 CSS hover。中间姿态冻结到 100ms，终态 finish；扫过使用固定卡片顺序、目标停留 100ms，实际调度不同，不用于 FPS／响应速度比较。GIF 为等时画面回放，非实时录像。

人工审阅与主观裁决见 design.md。没有用户偏好实验、完整 Tauri 自动逐帧测量、200% 文本放大或三端验证；真实拖拽仍是实施候选的验证门槛。失败的 selector、过渡末帧和冷启动运行未计作通过结果。

## 原始资料归档

本机外部位置：`/Users/alex/Documents/skill-zoo-review-artifacts/20261014-161438`。

该目录保存两份 change 的完整原始文档和 evidence，另有 README.md 说明临时恢复脚本的方法，manifest.json 记录原路径、大小与 SHA-256。复制后逐文件与原件比对通过，才从仓库移走。外部归档仅本机可用，仓库保留关键结论、两张终态图、实测摘要及原始 JSON 哈希；不再依赖仓库中已移走的页面或脚本。

原脚本依赖仓库相对路径；需要重跑时按外部 README 暂时恢复所需 evidence/，不要覆盖精简 planning 文档。这次迁移不是 OpenSpec archive，两份 change 仍供评审。

## 收尾边界

代码／主 specs：已校验内容不变。运行态：dev app 不停服。文档：精简并验证链接。规则／记忆／其他项目：out-of-scope。未新增依赖或改 .gitignore，未暂存或提交。
