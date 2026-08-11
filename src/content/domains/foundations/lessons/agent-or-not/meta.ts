import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 3,
  id: "agent-or-not",
  slug: "agent-or-not",
  domainId: "foundations",
  order: 1,
  title: "一次模型调用不等于 Agent",
  summary: "沿同一条六步 Run，只改变下一步的控制者，判断 Workflow 与 Agent 的真正边界。",
  durationMinutes: 18,
  audience: "all",
  stability: "stable",
  status: "ready",
  tags: ["agent-system", "control-flow", "feedback-loop"],
  objectives: [
    {
      id: "classify-system",
      text: "区分模型调用、模型增强工作流与 Agent",
    },
    {
      id: "locate-control",
      text: "识别谁拥有下一步决策权",
    },
    {
      id: "read-feedback-loop",
      text: "读懂一次最小 Agent Run 的反馈回路",
    },
  ],
  interactions: [
    {
      id: "agent-control-run",
      kind: "prediction",
      title: "下一步控制权单变量实验",
      objectiveIds: [
        "classify-system",
        "locate-control",
        "read-feedback-loop",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: [],
  thesis: {
    statement: "真正的区别，不是模型有多聪明，而是",
    emphasis: "谁在决定下一步。",
  },
  claims: [
    {
      id: "workflow-agent-control",
      statement:
        "Workflow 的路径由预设代码决定，而 Agent 会依据环境反馈动态选择后续行动。",
    },
    {
      id: "bounded-agent",
      statement:
        "可靠 Agent 通常需要明确的工具边界、人工检查点和停止条件。",
    },
    {
      id: "evaluated-completion",
      statement:
        "完成标准应当对应明确的评估目标与指标，并在系统变更后持续验证。",
    },
    {
      id: "multi-agent-complexity",
      statement:
        "增加 Agent 或多步自治会增加系统复杂度，并可能带来额外延迟、成本与错误传播，因此应由评估证明其必要性。",
    },
  ],
  lastVerified: "2026-08-07",
  sources: [
    {
      id: "anthropic-building-effective-agents",
      title: "Building effective agents",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      verifiedAt: "2026-08-07",
      supportsClaimIds: [
        "workflow-agent-control",
        "bounded-agent",
        "multi-agent-complexity",
      ],
    },
    {
      id: "openai-evaluation-best-practices",
      title: "Evaluation best practices",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
      verifiedAt: "2026-08-07",
      supportsClaimIds: [
        "evaluated-completion",
        "multi-agent-complexity",
      ],
    },
  ],
});
