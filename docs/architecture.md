# 内容与协作架构

AgentPath 不是文章集合，而是一套围绕 Agent 的知识生产系统。建设者通过研究、制作、审查和发布课程来学习；学习者通过低负担的可视化实验理解系统。

系统分为三层：

1. **知识方向**：负责概念、案例、来源和课程专属实验。
2. **学习原语**：统一页面节奏、Run 语义、交互外框和可访问性，而不统一每课的可视模型。
3. **课程运行时**：自动发现课程、处理路由并保存学习进度。

## 目录与职责边界

```text
src/
  app/                         providers 与应用行为
  pages/                       路由入口
  components/
    layout/                    站点与课程外壳
    lesson/                    Hero、Section、Takeaway、Sources
    lab/                       LabFrame 与被真实课程验证的小型交互原语
  content/
    curriculum/
      types.ts                 内容契约
      catalog.ts               自动发现与校验
    domains/
      <domain>/
        domain.ts              知识方向元数据
        lessons/<slug>/
          meta.ts              课程元数据；eager 发现
          index.tsx            页面组件；lazy 加载
          Lesson.tsx           内容编排
          labs/                本课专属数据与交互
  labs/shared/                 被多门真实课程使用的其他语义交互
  styles/
    tokens.css                 稳定视觉决策
    global.css                 共享页面样式
scripts/
  create-lesson.mjs            创建课程骨架
  validate-content.mjs         执行内容契约校验
```

每个 `domain` 是协作边界。一门课的文案、元数据、数据和一次性交互放在同一目录，使不同的人或 Agent 可以并行工作。类型、共享 Lab、Token 与页面外壳属于跨方向平台改动。

## 依赖方向

```text
pages/app → curriculum catalog + layout
catalog → eager domain/meta + lazy lesson loader
lesson page → lesson primitives + its own labs
lesson lab → lab primitives + proven shared labs
shared primitive → tokens/base only
```

共享代码不能反向依赖具体课程。

## 课程包自动注册

`catalog.ts` 使用 Vite glob 自动发现：

- eager：`domains/*/domain.ts`
- eager：`domains/*/lessons/*/meta.ts`
- lazy loader：`domains/*/lessons/*/index.tsx`

`meta.ts` 是纯数据。`index.tsx` 是课程懒加载边界。Catalog 会检查重复 ID、slug、顺序、未知方向、元数据引用关系，以及 `ready` 课程的最低契约。`pnpm validate:content` 会在 Node 中真正执行 Catalog 并加载每个课程入口；它已包含在 `pnpm typecheck` 与 `pnpm build` 中。

生产环境只公开 `ready` 课程；开发环境可通过直接路由预览 `draft` 与 `review`。

`lesson.id` 是长期进度键，`lesson.id + lesson.revision` 标识完成记录，`lesson.slug` 是公开 URL。发布后不要修改 ID 或 slug；核心判断或交互语义变化时递增 revision。

## 共享 Run 语义，不共享万能流程图

过程型课程应让学习者能够辨认：

```text
目标 → 看见 → 决定 → 行动 → 观察 → 继续 / 停止
```

这是一份学习与审查语义，不是固定的屏幕布局。课程需要根据概念的真实结构选择模型：Tool 突出门控链，Context 突出证据覆盖，Protocols 追踪信任边界，Harness 展示检查点，Loop 读取诊断信号，Graph 叠加拓扑与实际轨迹，Reliability 比较样本簇与回归，Capstone 汇总跨层证据。若静态对比已经足够，就不增加状态机。

领域专属模型应先放在课程自己的 `labs/`；不要为了复用而抹平循环、分支、预算、门控或恢复等关键结构。若多个课程后来验证了相同的低层能力，再提取节点、连线或状态标签等原语，而不是提取一张固定拓扑。

## 什么应该共享

- `LessonHero`、`LessonSection`、`LessonTakeaway` 与 `LessonSources` 统一编辑结构。
- `LabFrame` 统一 Lab 外框；Run 语义、焦点管理、触控目标、状态标注与 reduced motion 构成共享基础规则。
- 可视模型服务于概念：优先复用低层节点、连接线、状态标签等能力，不要求课程复用同一张流程图。
- 本课专属交互先留在 `<lesson>/labs/`。
- 只有被两门不同课程实际使用的同一教学行为，才提取到 `labs/shared`。

平台不提供学习者长文本编辑器。课程完成只记录进度，不保存作业或作品。
