import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 2,
  id: "context-budget",
  slug: "context-budget",
  domainId: "context",
  order: 1,
  title: "上下文不是越多越好",
  summary:
    "沿同一条六步 Run，只替换最后一项证据，观察相关信息与噪声怎样改变继续或停止。",
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
      id: "handle-context-gap",
      text: "识别决定性证据缺口，并让 Run 继续检索而不是猜测",
    },
  ],
  interactions: [
    {
      id: "context-evidence-run",
      kind: "prediction",
      title: "最后一项证据单变量实验",
      objectiveIds: [
        "allocate-context-budget",
        "assess-context-quality",
        "handle-context-gap",
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
