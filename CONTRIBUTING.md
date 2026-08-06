# 参与贡献

AgentPath 欢迎人和 Agent 围绕不同知识方向并行贡献，包括 Agent 基础、Behavior & Tools、Context、Protocols、Harness、Loop、Graph、Reliability 与 Capstone。

开始前，请依次阅读：

1. [内容与协作架构](docs/architecture.md)
2. [学习契约：输出即学习](docs/learning-contract.md)
3. [课程编写指南](docs/authoring-guide.md)

## 新建课程

```bash
pnpm new:lesson <domain-id> <lesson-slug> "中文标题"
```

每个课程包是一个独立交付单元。通常只修改所属知识方向和课程目录；如果需要调整课程类型、共享 Lab、设计 Token 或页面外壳，请把平台改动单独说明，并邀请跨方向审查。

## Pull Request 应说明

- 所属知识方向和本课要解决的问题；
- 学习者将完成什么可检查的输出；
- 主要事实来源及其支持的主张；
- 已体验的交互分支、桌面与移动端状态；
- 是否包含跨方向或共享层改动。

提交前运行：

```bash
pnpm typecheck
pnpm build
```

课程只有满足学习契约，并经过另一位贡献者端到端体验后，才能从 `review` 改为 `ready`。
