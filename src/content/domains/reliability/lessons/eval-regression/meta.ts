import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "eval-regression",
  slug: "eval-regression",
  domainId: "reliability",
  order: 1,
  title: "一次 Demo 成功，不等于可靠",
  summary:
    "把一次成功扩展成故障样本簇，用可判定 Eval 定位问题，再用全量回归证明修复没有制造新的失败。",
  durationMinutes: 22,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["agent-evals", "regression", "failure-analysis", "reliability"],
  objectives: [
    {
      id: "separate-demo-from-reliability",
      text: "区分单个成功样本与覆盖真实分布的可靠性证据",
    },
    {
      id: "read-eval-evidence",
      text: "用可判定结果和运行记录定位失败发生在哪个样本簇",
    },
    {
      id: "protect-with-regression",
      text: "判断一次修复是否经过失败复测与全量回归",
    },
  ],
  interactions: [
    {
      id: "failure-matrix-regression",
      kind: "debugger",
      title: "故障样本矩阵与回归雷达",
      objectiveIds: [
        "separate-demo-from-reliability",
        "read-eval-evidence",
        "protect-with-regression",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["harness-boundaries"],
  thesis: {
    statement: "一次成功只说明这个样本走通了；",
    emphasis: "可靠性要由失败样本、明确判据、针对性修复和全量回归共同证明。",
  },
  claims: [
    {
      id: "eval-driven-development",
      statement:
        "OpenAI 建议尽早、频繁地做评估，设计贴近真实分布的任务特定 Eval，并持续从日志中扩充测试样本。",
    },
    {
      id: "continuous-evaluation",
      statement:
        "OpenAI 建议在每次变更时运行持续评估，并随着新的非确定性案例出现而扩充 Eval 集。",
    },
    {
      id: "agent-eval-outcome-trace",
      statement:
        "Anthropic 将 Agent Eval 的 transcript 或 trace 与环境中的最终 outcome 区分开；两者可以由不同 grader 检查。",
    },
    {
      id: "regression-protects-backsliding",
      statement:
        "Anthropic 将回归 Eval 定义为检查 Agent 是否仍能完成以前会完成的任务，用于发现行为倒退。",
    },
    {
      id: "reliability-testing-builds-confidence",
      statement:
        "Google SRE 将可靠性测试描述为量化系统信心、支持发布和变更决策的一组工程手段。",
    },
  ],
  lastVerified: "2026-08-11",
  sources: [
    {
      id: "openai-evaluation-best-practices",
      title: "Evaluation best practices",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["eval-driven-development", "continuous-evaluation"],
    },
    {
      id: "anthropic-agent-evals",
      title: "Demystifying evals for AI agents",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents",
      verifiedAt: "2026-08-11",
      supportsClaimIds: [
        "agent-eval-outcome-trace",
        "regression-protects-backsliding",
      ],
    },
    {
      id: "google-sre-testing-reliability",
      title: "Testing for Reliability",
      publisher: "Google SRE",
      url: "https://sre.google/sre-book/testing-reliability/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["reliability-testing-builds-confidence"],
    },
  ],
});
