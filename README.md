# AgentPath｜Agent 通识课

一个由浅入深的 Agent 交互式教程。重点不是堆文章，而是让学习者直接操作流程图、运行日志、状态变化与控制边界。

项目的核心思想是**输出即学习**：每一课都要求学习者留下一个可复查、可分享、可继续迭代的作品，而不只是在页面上点完交互。

在线体验：[https://slin-code.github.io/agent-lab/](https://slin-code.github.io/agent-lab/)

## 本地运行

需要 Node.js 22.13+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

打开终端显示的本地地址。当前页面切换方式：

- 首页点击「开始第一课」进入课程。
- 课程页点击左侧或顶部的「返回学习路径」回到首页。
- 首页点击「查看完整路径」滚动到 9 阶段课程地图。
- 课程也可以通过 `/#/lesson/<lesson-slug>` 直达，例如 `/#/lesson/context-budget`。

## 当前内容

- 9 阶段课程地图：Agent 心智、行为与工具、Context、协议、Harness、Loop、Graph、可靠性、Capstone。
- 已开放 4 门课：《一次模型调用不等于 Agent》《工具调用不等于动作完成》《上下文不是越多越好》《模型给建议，Harness 决定动作能否发生》。
- 交互包括系统分类、Agent Loop Trace、工具契约路径、上下文预算和 Harness 边界路由；每课都带可本地保存的学习输出。

教学界面只展示决策摘要、行动、观察与状态变化，不展示隐藏思维链。
课程默认用可操作的流程图、状态变化和故障演示讲清工程概念，不用伪代码承担核心解释。

## 添加下一课

```bash
pnpm new:lesson <domain-id> <lesson-slug> "中文标题"
```

课程按知识方向放在 `src/content/domains/<domain-id>/`。每课把元数据、正文、数据和专属实验放在同一目录；目录创建后会自动注册，不需要再修改中央 manifest 或路由表。

开始贡献前请阅读：

- [项目架构](docs/architecture.md)
- [“输出即学习”契约](docs/learning-contract.md)
- [课程创作指南](docs/authoring-guide.md)
- [贡献说明](CONTRIBUTING.md)

面向 Agent 的仓库级约束位于 `AGENTS.md`，可确保新页面复用相同骨架、视觉 token、交互边界与来源规则。

## 检查

```bash
pnpm typecheck
pnpm build
```

## 发布

推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。工作流位于 `.github/workflows/deploy-pages.yml`。
