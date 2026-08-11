# 参与贡献

AgentPath 欢迎人和 Agent 围绕 Agent 基础、Behavior & Tools、Context、Protocols、Harness、Loop、Graph、Reliability 与 Capstone 并行贡献。

建设课程本身就是学习：贡献者通过研究、解释、实现、审查和发布来形成理解。这不应变成学习者每课必须提交的长文本作业。

开始前请依次阅读：

1. [内容与协作架构](docs/architecture.md)
2. [学习契约](docs/learning-contract.md)
3. [课程编写指南](docs/authoring-guide.md)

## 新建课程

```bash
pnpm new:lesson <domain-id> <lesson-slug> "中文标题"
```

每个课程包是独立交付单元。通常只修改所属方向和课程目录；平台改动请单独说明并邀请跨方向审查。

## Pull Request 应说明

- 所属知识方向和本课要解决的问题；
- 它映射到六步 Run 的哪一处；
- 唯一核心变量、唯一分叉及改变判断的证据；
- 主要事实来源及其支持的主张；
- 已体验的两条分支、桌面与 320px 状态；
- 页面不存在长文本输入或作品提交门槛；
- 贡献者在研究与制作过程中新增或修正了什么理解。

提交前运行：

```bash
pnpm typecheck
pnpm build
```

课程只有满足学习契约，并经过另一位贡献者端到端体验后，才能从 `review` 改为 `ready`。
