import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  id: "context-budget",
  slug: "context-budget",
  domainId: "context",
  order: 1,
  title: "上下文不是越多越好",
  summary:
    "在固定预算下选择证据，亲眼看到相关性、可信度、时效与冲突怎样改变 Agent 的决策边界。",
  durationMinutes: 22,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["context-engineering", "evidence-selection", "context-budget"],
  objectives: [
    {
      id: "allocate-context-budget",
      text: "在固定预算下优先选择当前决策真正需要的信息",
    },
    {
      id: "assess-context-quality",
      text: "从相关性、可信度、时效与覆盖度评估上下文质量",
    },
    {
      id: "handle-context-conflict",
      text: "识别过时或冲突证据，并说明系统仍能与不能得出的结论",
    },
  ],
  interactions: [
    {
      id: "context-budget-allocation",
      kind: "prediction",
      title: "12 格上下文预算实验",
      objectiveIds: [
        "allocate-context-budget",
        "assess-context-quality",
        "handle-context-conflict",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["agent-or-not"],
  thesis: {
    statement: "上下文工程不是把窗口装满，而是",
    emphasis: "让此刻决策所需的高信号证据进入视野。",
  },
  output: {
    revision: 1,
    title: "交付一份上下文预算单",
    description:
      "把一次 Agent 决策需要看见、暂时不看见和需要刷新什么，整理成别人可以审查的方案。",
    prompt:
      "选择一个真实 Agent 决策，先写明固定预算与完成判断；再列出进入上下文的证据、每项证据的进入理由、被排除的信息及排除理由；最后标注过时或冲突证据、当前可解释边界和下一次刷新触发器。",
    transferPrompt:
      "不要复用本课的订阅退款案例。请选择故障排查、销售报价、代码修改、研究核验或你自己的业务场景。",
    objectiveIds: [
      "allocate-context-budget",
      "assess-context-quality",
      "handle-context-conflict",
    ],
    criteria: [
      {
        id: "define-decision-and-budget",
        text: "明确写出当前要做的决策、完成判断和固定预算",
      },
      {
        id: "prioritize-evidence",
        text: "每项入选证据都有相关性、可信度或时效方面的具体理由",
      },
      {
        id: "justify-exclusions",
        text: "至少说明一项信息为何暂不进入，而不是默认全部塞入",
      },
      {
        id: "resolve-freshness-and-conflict",
        text: "标出过时或冲突证据，并写清采用、降权或继续核验的处理",
      },
      {
        id: "state-boundary-and-refresh",
        text: "说明当前能与不能得出的结论，并定义下一次刷新上下文的触发器",
      },
    ],
    placeholder:
      "当前决策：……\n固定预算：……\n进入上下文：证据 A（因为……）\n暂不进入：信息 B（因为……）\n过时 / 冲突处理：……\n当前能说明：……\n当前不能说明：……\n刷新触发器：当……时，重新检索……",
  },
  claims: [
    {
      id: "context-engineering-curates-tokens",
      statement:
        "上下文工程关注推理期间进入模型的全部信息，并通过筛选与维护寻找支持目标结果的高信号信息集合。",
    },
    {
      id: "long-context-use-is-not-uniform",
      statement:
        "更长的输入不保证信息被稳定利用；长上下文任务的表现会随相关信息所在位置而显著变化。",
    },
    {
      id: "compaction-has-selection-risk",
      statement:
        "压缩可以维护长任务的上下文，但保留与丢弃的选择需要评估，过度压缩可能损失后来才显出价值的关键细节。",
    },
  ],
  lastVerified: "2026-08-07",
  sources: [
    {
      id: "anthropic-effective-context-engineering",
      title: "Effective context engineering for AI agents",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
      verifiedAt: "2026-08-07",
      supportsClaimIds: [
        "context-engineering-curates-tokens",
        "compaction-has-selection-risk",
      ],
    },
    {
      id: "tacl-lost-in-the-middle",
      title: "Lost in the Middle: How Language Models Use Long Contexts",
      publisher: "TACL · ACL Anthology",
      url: "https://aclanthology.org/2024.tacl-1.9/",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["long-context-use-is-not-uniform"],
    },
  ],
});
