# Local Protocol

## Purpose

定义桌面应用与配套 CLI 共享本地状态时的兼容性契约。文件路径、字段、版本及写入语义以 docs/local-protocol.md 为详细定义，以 fixtures/local-protocol/ 为共同验证样例，本规范不另建一套字段 schema。

## Requirements

### Requirement: CLI 遵循桌面拥有的本地协议

桌面与 CLI 对共享状态的读写 MUST 遵循 [本地协议文档](../../../docs/local-protocol.md) 的文件、版本与语义定义。CLI MUST NOT 为适配自身实现而独立改变共享状态格式或桌面协议 fixtures。

#### Scenario: 两端读取共同 fixtures
- **WHEN** 桌面和 CLI 读取 fixtures/local-protocol/ 中的当前版本完整与最小样例
- **THEN** 两端均按协议解释字段并为缺失的可选字段使用兼容默认值

### Requirement: 不覆盖不支持的新版本状态

桌面与 CLI 写入版本化的 lock、archive manifest 或 external imports 文件前 MUST 拒绝不支持的更高版本，并提示升级。被拒绝的写入 MUST NOT 覆盖原文件。

#### Scenario: 共享状态版本高于支持上限
- **WHEN** 工具尝试写入 schema 版本高于自身支持上限的版本化文件
- **THEN** 操作失败并提示升级，原文件保持不变

### Requirement: 外部导入的源文件保持用户所有权

外部导入 MUST 以注册引用和 agent 链接接入。应用与 CLI MUST NOT 复制、移动、删除或归档导入源文件；移除导入 MUST 仅移除登记与指向该源的应用管理链接。

#### Scenario: 移除外部导入
- **WHEN** 用户移除一条外部导入
- **THEN** 登记及该导入的应用管理链接被移除，源目录及其文件保持不变

### Requirement: Desktop-owned custom agent registry

Desktop and CLI MUST interpret custom-agent registrations using docs/local-protocol.md and shared fixtures/local-protocol/ samples. Missing registry data MUST preserve built-in-only behavior. Malformed or unsupported registry versions MUST be reported rather than silently treated as an empty registry or overwritten: desktop startup degrades to built-in agents while logging the parse failure, subsequent registry mutations surface the parse error, and writers preserve the original bytes.

#### Scenario: Same registration on both surfaces
- **WHEN** desktop and CLI read the complete custom-agent fixture
- **THEN** they resolve identical stable IDs, names and absolute Skills directories

#### Scenario: Shipped support follows custom registration
- **WHEN** desktop and CLI read the shared built-in-collision fixture with its paths mapped to the same temporary home
- **THEN** both preserve custom IDs and bytes, allow disjoint same-name entries, suppress overlapping built-in targets and report the same conflicting custom ID

#### Scenario: Registry absent
- **WHEN** no custom-agent registry exists
- **THEN** built-in agent resolution and existing local-state compatibility remain unchanged

#### Scenario: Unsupported or malformed registry
- **WHEN** a registry has an unsupported schema version or invalid content
- **THEN** readers report the problem, writers preserve its bytes and operations requiring complete agent enumeration do not silently skip its agents

### Requirement: Recoverable lifecycle persistence

Lifecycle writes spanning registrations and retained external references MUST be recoverable as one logical change. Readers MUST NOT observe a committed removal without its required retained-source references. Failed persistence MUST preserve the prior committed state; registry and ownership metadata MUST NOT be reconstructed from the derived skill cache alone.

#### Scenario: Removal persistence interruption
- **WHEN** unregistering is interrupted between recording retained real skills and updating registrations
- **THEN** recovery restores or completes a coherent committed state before subsequent desktop or CLI mutations

#### Scenario: External preservation survives cache rebuild
- **WHEN** the derived skill cache is deleted after unregistering an agent
- **THEN** its retained real skills remain discoverable as external imports with their ownership protection

### Requirement: Removed agent references remain safe

Archived records and other persisted references to absent custom agents MUST remain readable. Restore MUST preserve the recorded entity destination, skip missing agent link targets with a clear status, and MUST NOT reuse a removed registration's identity or silently target its replacement directory.

#### Scenario: Restore after unregistering
- **WHEN** an archive mentions an unregistered custom agent
- **THEN** restore preserves its original destination and reports skipped links without losing the archive or writing to an unrelated agent

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
