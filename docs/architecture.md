# 内容与协作架构

AgentPath 不是彼此无关的文章集合，而是一套可持续扩展的知识生产系统。它分为三层：

1. **知识方向**：负责概念、案例、来源和课程专属实验。
2. **学习原语**：统一页面节奏、交互外框和可访问性。
3. **课程运行时**：自动发现课程、处理路由并保存学习者的进度与输出。

## 目录与职责边界

```text
src/
  app/                         providers 与应用行为
  pages/                       只负责路由入口
  components/
    layout/                    站点与课程外壳
    lesson/                    Hero、Section、Takeaway、Sources、Output
    lab/                       共享 Lab 外框与展示结构
  content/
    curriculum/
      types.ts                 内容契约
      catalog.ts               自动发现与校验
    domains/
      <domain>/
        domain.ts              知识方向元数据与职责边界
        lessons/
          <lesson-slug>/
            meta.ts            课程元数据；启动时 eager 发现
            index.tsx          页面组件默认导出；进入路由时 lazy 加载
            Lesson.tsx         内容编排
            labs/              本课专属的数据与交互
  labs/
    shared/                    至少被两门真实课程使用的语义交互
  styles/
    tokens.css                 稳定的视觉决策
    global.css                 逐步迁移的历史共享样式
    <primitive>.css            可复用原语自有的样式
scripts/
  create-lesson.mjs            安全创建课程骨架
  validate-content.mjs         在 Node 中执行 Catalog 内容校验
docs/                          学习与贡献契约
```

每个 `domain` 目录都是一个协作边界。Context 方向的贡献者通常只修改 `domains/context`，Harness 方向的贡献者只修改 `domains/harness`。一门课的文案、元数据、数据和一次性交互都放在自己的课程目录中，使不同的人或 Agent 可以并行工作而不争用中心文件。

修改课程类型、共享 Lab、设计 Token 或页面外壳属于跨方向的平台改动，需要更广泛的审查。知识内容与平台重构应尽量拆成独立提交，避免扩大审查范围。

## 依赖方向

```text
pages/app → curriculum catalog + layout
catalog → eager domain/meta + lazy lesson component loader
lesson page → lesson primitives + its own labs
lesson lab → lab primitives + proven shared labs
shared primitive → tokens/base only
```

共享代码不能反向依赖具体课程。否则，一个课程案例的假设会被带进所有课程。

## 课程包自动注册

`catalog.ts` 使用 Vite glob 自动发现：

- eager：`domains/*/domain.ts`
- eager：`domains/*/lessons/*/meta.ts`
- lazy loader：`domains/*/lessons/*/index.tsx`

`meta.ts` 默认导出 `defineLessonMeta(...)` 的纯数据。首页、学习路径和课程侧栏只读取这些 eager 元数据，因此不会为了展示目录而把所有课程正文与 Lab 打进首屏包。`meta.ts` 不得导入 React 页面、课程 Lab 或依赖浏览器环境的模块。

`index.tsx` 是对应课程的懒加载边界，必须默认导出符合 `LessonComponent` 契约的页面组件。Catalog 根据 `meta.ts` 的文件路径找到同目录的 `index.tsx` loader，并用 `React.lazy` 包装；缺少配对入口时直接报错。`Lesson.tsx` 只是推荐的内容编排文件名，Catalog 不直接发现它，通常由薄的 `index.tsx` 转为默认导出。

元数据和页面入口各自只有一个职责，不需要维护路由表或中央 manifest。Catalog 还会检查重复的 ID、slug、顺序、未知知识方向、元数据引用关系，以及 `ready` 课程的最低契约。`pnpm validate:content` 通过 Vite SSR 在 Node 中真正执行这些检查，并逐个加载课程入口来验证默认导出；这不会改变客户端的懒加载边界。该命令已包含在 `pnpm typecheck` 与 `pnpm build` 中，避免错误只在浏览器启动时暴露。生产环境只公开 `ready` 课程；开发环境可以通过直接路由预览 `draft` 与 `review`。

`lesson.id` 是长期保存学习输出的键，`lesson.id + lesson.output.revision` 共同标识完成记录，`lesson.slug` 是公开 URL。课程发布后不要修改 ID 或 slug；当输出任务的含义或自检标准变化时递增 revision，让旧草稿保留、旧完成标记失效。

## 什么应该共享

原则是：**先共享页面结构，再共享交互语义。**

- `LessonHero`、`LessonSection`、`LessonTakeaway`、`LessonSources` 和 `LearningOutput` 适用于所有课程。
- `LabFrame` 统一 Lab 的环境、标题关系和状态位置，但不接管具体实验的状态机。
- 本课专属交互先放在 `<lesson>/labs/`。只有同一教学行为、可访问性契约和状态语义被两门不同课程实际使用后，才在第二个消费者落地的同一次改动中提取到 `labs/shared`。
- 两个页面实例、同一课的两个章节或“未来可能复用”都不算两个真实消费者。第二门课也不能直接导入第一门课的 `labs/`；应先比较两边需求，再提取最小公共契约。
- 不要提前构建“万能 Graph 引擎”。共享组件提供稳定语义，不接受为了容纳单个案例而不断增加的通用配置。

这样既能避免每门课发明一套视觉语言，也不会让过度抽象增加课程编写成本。

## 样式迁移

现有全局样式按需渐进拆分。新原语拥有自己的 CSS 文件并使用语义 Token。修改旧组件时，应同时迁移其完整的桌面与响应式规则，不要让同一选择器长期分散在多个文件中。
