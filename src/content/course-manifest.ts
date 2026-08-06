export type Stability = "stable" | "converging" | "frontier";

export interface Source {
  title: string;
  publisher: string;
  url: string;
  verifiedAt: string;
  supports?: string;
}

export interface Stage {
  id: string;
  order: number;
  shortTitle: string;
  title: string;
  summary: string;
}

export interface Lesson {
  id: string;
  slug: string;
  stageId: string;
  order: number;
  title: string;
  summary: string;
  duration: number;
  audience: "all" | "beginner" | "developer";
  stability: Stability;
  objectives: string[];
  prerequisites: string[];
  sources: Source[];
  lastVerified: string;
  status: "ready" | "planned";
}

export const stages: Stage[] = [
  {
    id: "foundations",
    order: 1,
    shortTitle: "Agent 心智",
    title: "从模型调用到 Agent System",
    summary: "先建立正确边界，再讨论自治与工程。",
  },
  {
    id: "behavior-tools",
    order: 2,
    shortTitle: "行为与工具",
    title: "行为契约、工具与最小 Loop",
    summary: "让模型从回答问题走向可靠行动。",
  },
  {
    id: "context",
    order: 3,
    shortTitle: "Context",
    title: "Context 与知识工程",
    summary: "管理每一步真正进入模型视野的信息。",
  },
  {
    id: "protocols",
    order: 4,
    shortTitle: "能力与协议",
    title: "Tools、Skills 与协议生态",
    summary: "理解 MCP、Skills、A2A 与能力边界。",
  },
  {
    id: "harness",
    order: 5,
    shortTitle: "Harness",
    title: "Harness Engineering",
    summary: "设计模型周围完整、可信的运行系统。",
  },
  {
    id: "loop",
    order: 6,
    shortTitle: "Loop",
    title: "Loop Engineering",
    summary: "定义触发、验证、恢复与终止。",
  },
  {
    id: "graph",
    order: 7,
    shortTitle: "Graph",
    title: "Graph Engineering",
    summary: "分清状态编排图与 Prompt Graph，再表达分支、并行与循环。",
  },
  {
    id: "reliability",
    order: 8,
    shortTitle: "可靠性",
    title: "Evals、安全与持续改进",
    summary: "让一次成功变成可重复的系统能力。",
  },
  {
    id: "capstone",
    order: 9,
    shortTitle: "Capstone",
    title: "构建完整 Agent System",
    summary: "把知识、代码与运行证据组合成毕业项目。",
  },
];

export const lessons: Lesson[] = [
  {
    id: "agent-or-not",
    slug: "agent-or-not",
    stageId: "foundations",
    order: 1,
    title: "一次模型调用不等于 Agent",
    summary: "从八个真实场景出发，判断模型调用、工作流与 Agent 的真正边界。",
    duration: 18,
    audience: "all",
    stability: "stable",
    objectives: [
      "区分模型调用、模型增强工作流与 Agent",
      "识别谁拥有下一步决策权",
      "读懂一次最小 Agent Run 的反馈回路",
    ],
    prerequisites: [],
    lastVerified: "2026-08-06",
    status: "ready",
    sources: [
      {
        title: "Building effective agents",
        publisher: "Anthropic",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        verifiedAt: "2026-08-06",
        supports: "Workflow 与 Agent 的控制流区分",
      },
      {
        title: "Evaluation best practices",
        publisher: "OpenAI",
        url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
        verifiedAt: "2026-08-06",
        supports: "完成标准与可复现评估",
      },
    ],
  },
];

export const lessonBySlug = new Map(
  lessons.map((lesson) => [lesson.slug, lesson]),
);
export const stageById = new Map(
  stages.map((stage) => [stage.id, stage]),
);
