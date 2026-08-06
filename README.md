# AgentPath｜Agent 通识课

一个由浅入深的 Agent 交互式教程。重点不是堆文章，而是让学习者直接操作流程图、运行日志、状态变化与控制边界。

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
- 第一课直达地址：`/#/lesson/agent-or-not`。

## 当前内容

- 9 阶段课程地图：Agent 心智、行为与工具、Context、协议、Harness、Loop、Graph、可靠性、Capstone。
- 第一课《一次模型调用不等于 Agent》已完成。
- 交互包括 8 个场景分类器、11 步 Agent 循环图、联动运行日志与本地学习进度。

教学界面只展示决策摘要、行动、观察与状态变化，不展示隐藏思维链。
课程默认用可操作的流程图、状态变化和故障演示讲清工程概念，不用伪代码承担核心解释。

## 添加下一课

1. 在 `src/content/course-manifest.ts` 登记课程元数据。
2. 在 `src/content/lessons/` 新建课程组件。
3. 在 `src/pages/LessonPage.tsx` 的 `lessonRegistry` 注册组件。
4. 将该课的交互实验放入 `src/labs/<lesson-slug>/`。

## 检查

```bash
pnpm typecheck
pnpm build
```

## 发布

推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。工作流位于 `.github/workflows/deploy-pages.yml`。
