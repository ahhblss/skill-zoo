# Spec Delta

## ADDED Requirements

### Requirement: 用户元数据身份锚定安装目录

用户元数据（stars、isMine）的键 MUST 由技能的安装位置派生，而不得把安装来源（provenance）编入键。SSOT 技能的身份键 MUST 恒为 `ssot:{relative_dir}`，其中 `relative_dir` 是相对 SSOT 根（`~/.agents/skills/`）的规范化目录；同一安装目录在来源漂移（lock 丢失、损坏、来源字段变更）前后 MUST 解析为同一身份键。agent 来源技能的身份键保持 `agent:{agent_id}:{dir}`，外部导入保持其注册表 ID。

#### Scenario: lock 丢失后星标存活

- **WHEN** 一个 `repo:{owner}/{repo}:{dir}` 键下存有星标的 metadata.json，对应的 SSOT 技能目录仍在，而 lock 文件不存在或不含该条目
- **THEN** 重新扫描后该技能的 ID 为 `ssot:{dir}`，且读取到 `starred == true`

#### Scenario: 旧键读取时确定性重键

- **WHEN** metadata.json 中存在 `repo:{owner}/{repo}:{dir}` 形式的键
- **THEN** 读取端（桌面与 CLI）将其重键为 `ssot:{dir}`；若已存在同目录的 `ssot:{dir}` 条目，两个条目的 starred 与 isMine 分别按 OR 合并，且合并后持久化，旧键不再残留

#### Scenario: 安装目录含冒号

- **WHEN** 遗留元数据键为 `repo:owner/repo:foo:bar`，安装目录为 `foo:bar`
- **THEN** 两端迁移后的键为 `ssot:foo:bar`，重新扫描仍读取到原有用户标记

#### Scenario: 迁移写回失败

- **WHEN** 遗留元数据可读取，但迁移结果无法持久化
- **THEN** 两端 MUST 告警并使用已迁移的内存状态继续读取技能及其用户标记，磁盘旧内容保留供后续读取重试

#### Scenario: 非遗留键不受迁移影响

- **WHEN** metadata.json 中仅含 `ssot:`、`agent:`、`external:` 前缀的键
- **THEN** 读取与保存不改变任何键，迁移不产生写入

### Requirement: 归档恢复经身份映射写回元数据

归档恢复在把 manifest 快照的用户标记写回 metadata 时，MUST 将 manifest 中的历史 `original_skill_id` 映射为当前身份规则下的规范键后再写入，使恢复后同会话内扫描即可关联到这些标记。归档 manifest 中的历史 ID 本身 MUST 保持原样，不做改写。

#### Scenario: 遗留 ID 的恢复写回规范键

- **WHEN** manifest 的 `original_skill_id` 为 `repo:{owner}/{repo}:{dir}` 且快照了 `starred == true`，恢复到 SSOT 目录 `{dir}`
- **THEN** metadata 中新增/合并的键为 `ssot:{dir}`，恢复后无需重启即可读到星标；manifest 中记录的历史 ID 不被改写（条目本身按既有行为随恢复移除）

### Requirement: 双端身份规则一致

桌面与 CLI MUST 使用相同的身份键规则与迁移规则：两端对同一文件系统状态构造的身份键一致，对同一份 metadata.json 的重键结果一致。协议 fixtures MUST 覆盖含遗留 `repo:` 键的 metadata 样本及合并结果。

#### Scenario: 两端读取同一份遗留 metadata

- **WHEN** 桌面与 CLI 分别读取同一个含 `repo:{owner}/{repo}:{dir}` 键的 metadata.json
- **THEN** 两端为位于 SSOT `{dir}` 的同一技能报告相同的星标与 isMine 状态，且键收敛为 `ssot:{dir}`
