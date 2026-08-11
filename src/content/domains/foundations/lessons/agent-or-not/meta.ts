import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
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
      id: "system-classifier",
      kind: "prediction",
      title: "八个场景分类挑战",
      objectiveIds: ["classify-system", "locate-control"],
      resettable: true,
      deterministic: true,
    },
    {
      id: "agent-loop-trace",
      kind: "trace",
      title: "最小 Agent Run 播放器",
      objectiveIds: ["read-feedback-loop"],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: [],
  thesis: {
    statement: "真正的区别，不是模型有多聪明，而是",
    emphasis: "谁在决定下一步。",
  },
  output: {
    revision: 2,
    title: "写下你的 Agent 判定",
    description: "把直觉变成一段别人可以检查、质疑和复用的判断。",
    prompt:
      "完成两部分：先判断一个 AI 系统属于模型调用、Workflow 还是 Agent；再写出一组“观察 → 新行动”的 Trace，说明反馈怎样改变下一步。",
    transferPrompt:
      "不要复述本课的退款案例。请选择你实际使用过的 AI 产品，或自己构造一个新的业务场景。",
    objectiveIds: [
      "classify-system",
      "locate-control",
      "read-feedback-loop",
    ],
    criteria: [
      {
        id: "classify-system",
        text: "明确给出系统类型，而不是只描述功能",
        legacyIndex: 0,
      },
      {
        id: "identify-controller",
        text: "说明谁持续决定下一步",
        legacyIndex: 1,
      },
      {
        id: "trace-observation-action",
        text: "写出一次具体观察，以及它触发的新行动",
      },
      {
        id: "explain-feedback-change",
        text: "说明环境反馈是否真的改变了后续路径",
        legacyIndex: 2,
      },
      {
        id: "name-uncertainty",
        text: "指出至少一个仍需观察 Trace 才能确认的不确定项",
        legacyIndex: 3,
      },
    ],
    placeholder:
      "我选择的系统是……\n我的判断是……\n控制权证据是……\n观察到……之后，系统改为……\n还需要从运行 Trace 确认……",
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
