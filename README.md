# AgentPath｜Agent 通识课

一个由浅入深的 Agent 交互式教程。重点不是堆文章，而是让学习者直接看见目标、证据、决策、动作与反馈怎样组成一次 Run。

项目坚持**输出即学习**，但这里的“输出”属于内容建设过程：贡献者通过研究概念、制作课程、接受审查和持续发布来完成自己的学习。它不意味着每一课都要求学习者写长文本作业。学习者应通过选择、切换、逐步运行和观察反馈，低负担地建立心智模型。

在线体验：[https://slin-code.github.io/agent-lab/](https://slin-code.github.io/agent-lab/)

## 本地运行

需要 Node.js 22.13+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

打开终端显示的本地地址。页面切换方式：

- 首页点击「开始第一课」进入课程。
- 课程页点击「返回学习路径」回到首页。
- 首页点击「查看完整路径」滚动到 9 阶段课程地图。
- 课程可通过 `/#/lesson/<lesson-slug>` 直达，例如 `/#/lesson/context-budget`。

## 当前内容

- 9 阶段课程地图：Agent 心智、行为与工具、Context、协议、Harness、Loop、Graph、可靠性、Capstone。
- 已开放 4 门课：《一次模型调用不等于 Agent》《工具调用不等于动作完成》《上下文不是越多越好》《模型给建议，Harness 决定动作能否发生》。
- 四课复用同一条 Run：`目标 → 看见 → 决定 → 行动 → 观察 → 继续 / 停止`。
- 每课只改变一个变量并揭示一个分叉，不要求学习者输入大段文字。

教学界面只展示决策摘要、行动、观察与状态变化，不展示隐藏思维链。课程默认用可操作的流程图、状态变化和故障演示讲清工程概念，不用伪代码承担核心解释。

## 添加下一课

```bash
pnpm new:lesson <domain-id> <lesson-slug> "中文标题"
```

课程按知识方向放在 `src/content/domains/<domain-id>/`。每课把元数据、正文、数据和专属实验放在同一目录；目录创建后会自动注册，不需要修改中央 manifest 或路由表。

开始贡献前请阅读：

- [项目架构](docs/architecture.md)
- [学习契约](docs/learning-contract.md)
- [课程创作指南](docs/authoring-guide.md)
- [贡献说明](CONTRIBUTING.md)

## 检查

```bash
pnpm typecheck
pnpm build
```

## 发布

推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。工作流位于 `.github/workflows/deploy-pages.yml`。
