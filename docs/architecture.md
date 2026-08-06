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
            index.tsx          课程元数据与组件导出
            Lesson.tsx         内容编排
            labs/              本课专属的数据与交互
  labs/
    shared/                    经真实课程验证后复用的语义交互
  styles/
    tokens.css                 稳定的视觉决策
    global.css                 逐步迁移的历史共享样式
    <primitive>.css            可复用原语自有的样式
scripts/
  create-lesson.mjs            安全创建课程骨架
docs/                          学习与贡献契约
```

每个 `domain` 目录都是一个协作边界。Context 方向的贡献者通常只修改 `domains/context`，Harness 方向的贡献者只修改 `domains/harness`。一门课的文案、元数据、数据和一次性交互都放在自己的课程目录中，使不同的人或 Agent 可以并行工作而不争用中心文件。

修改课程类型、共享 Lab、设计 Token 或页面外壳属于跨方向的平台改动，需要更广泛的审查。知识内容与平台重构应尽量拆成独立提交，避免扩大审查范围。

## 依赖方向

```text
pages/app → curriculum catalog + layout
lesson bundle → lesson primitives + its own labs
lesson lab → lab primitives + proven shared labs
shared primitive → tokens/base only
```

共享代码不能反向依赖具体课程。否则，一个课程案例的假设会被带进所有课程。

## 课程包自动注册

`catalog.ts` 使用 Vite glob 自动发现：

- `domains/*/domain.ts`
- `domains/*/lessons/*/index.tsx`

课程元数据和页面组件因此只有一个来源，不需要额外维护路由表或中央 manifest。Catalog 还会检查重复的 ID、slug、顺序、未知知识方向，以及 `ready` 课程的最低契约。

`lesson.id` 是长期保存学习进度和输出的键，`lesson.slug` 是公开 URL。课程发布后不要修改它们。

## 什么应该共享

原则是：**先共享页面结构，再共享交互语义。**

- `LessonHero`、`LessonSection`、`LessonTakeaway`、`LessonSources` 和 `LearningOutput` 适用于所有课程。
- `LabFrame` 统一 Lab 的环境、标题关系和状态位置，但不接管具体实验的状态机。
- Loop 播放器可以共享，因为拓扑和事件契约本身就是概念的一部分。
- 不要提前构建“万能 Graph 引擎”。只有同一教学行为被至少两门真实课程验证后，才提取到共享层。

这样既能避免每门课发明一套视觉语言，也不会让过度抽象增加课程编写成本。

## 样式迁移

现有全局样式按需渐进拆分。新原语拥有自己的 CSS 文件并使用语义 Token。修改旧组件时，应同时迁移其完整的桌面与响应式规则，不要让同一选择器长期分散在多个文件中。
