import { defineLesson } from "@/content/curriculum/types";
import { AgentOrNotLesson } from "./Lesson";

export default defineLesson({
  meta: {
    schemaVersion: 1,
    id: "agent-or-not",
    slug: "agent-or-not",
    domainId: "foundations",
    order: 1,
    title: "一次模型调用不等于 Agent",
    summary: "从八个真实场景出发，判断模型调用、工作流与 Agent 的真正边界。",
    durationMinutes: 18,
    audience: "all",
    stability: "stable",
    status: "ready",
    tags: ["agent-system", "control-flow", "feedback-loop"],
    objectives: [
      "区分模型调用、模型增强工作流与 Agent",
      "识别谁拥有下一步决策权",
      "读懂一次最小 Agent Run 的反馈回路",
    ],
    prerequisites: [],
    thesis: {
      statement: "真正的区别，不是模型有多聪明，而是",
      emphasis: "谁在决定下一步。",
    },
    output: {
      title: "写下你的 Agent 判定",
      description: "把直觉变成一段别人可以检查、质疑和复用的判断。",
      prompt:
        "选择一个你熟悉的 AI 产品，用 3—5 句话判断它是模型调用、Workflow 还是 Agent，并写出控制权证据。",
      criteria: [
        "明确给出系统类型，而不是只描述功能",
        "说明谁持续决定下一步",
        "说明环境反馈是否会改变后续行动",
        "指出至少一个仍需观察 Trace 才能确认的不确定项",
      ],
      placeholder:
        "我选择的系统是……\n我的判断是……\n关键证据是……\n还需要从运行 Trace 确认……",
    },
    lastVerified: "2026-08-06",
    sources: [
      {
        id: "anthropic-building-effective-agents",
        title: "Building effective agents",
        publisher: "Anthropic",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        verifiedAt: "2026-08-06",
        supports: "Workflow 与 Agent 的控制流区分",
      },
      {
        id: "openai-evaluation-best-practices",
        title: "Evaluation best practices",
        publisher: "OpenAI",
        url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
        verifiedAt: "2026-08-06",
        supports: "完成标准与可复现评估",
      },
    ],
  },
  Component: AgentOrNotLesson,
});
