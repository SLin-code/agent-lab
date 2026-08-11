import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 3,
  id: "harness-boundaries",
  slug: "harness-boundaries",
  domainId: "harness",
  order: 1,
  title: "模型给建议，Harness 决定动作能否发生",
  summary:
    "沿中断时间线只改变检查点，看同一次超时为什么会走向恢复或人工对账。",
  durationMinutes: 22,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["harness-engineering", "permission", "human-in-the-loop", "recovery"],
  objectives: [
    {
      id: "separate-proposal-action",
      text: "区分模型提出的工具调用与 Host 真正执行的动作",
    },
    {
      id: "predict-boundary-path",
      text: "根据权限、审批与时间预算预测一次高风险动作的路径",
    },
    {
      id: "design-recovery-state",
      text: "设计检查点、停止状态与恢复所需证据",
    },
  ],
  interactions: [
    {
      id: "checkpoint-recovery-run",
      kind: "simulation",
      title: "检查点中断与恢复时间线",
      objectiveIds: [
        "separate-proposal-action",
        "predict-boundary-path",
        "design-recovery-state",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["tool-contract"],
  thesis: {
    statement: "模型可以提出行动；",
    emphasis: "Harness 决定它何时、以什么边界真正发生。",
  },
  claims: [
    {
      id: "model-tool-call-is-request",
      statement:
        "工具调用流程把模型返回工具调用与应用侧执行代码列为两个独立步骤；模型输出本身不等于动作已经发生。",
    },
    {
      id: "approval-pauses-and-resumes",
      statement:
        "OpenAI Agents SDK 的人工介入流程可以在敏感工具调用前暂停，并在批准或拒绝后通过可序列化的运行状态恢复。",
    },
    {
      id: "stop-conditions-bound-runs",
      statement:
        "Agent 运行可以使用最大迭代次数等停止条件维持控制，并在检查点请求人工反馈。",
    },
    {
      id: "checkpoints-support-recovery",
      statement:
        "LangGraph 的 checkpointer 将线程图状态保存为检查点，可用于中断后继续与故障恢复。",
    },
  ],
  lastVerified: "2026-08-07",
  sources: [
    {
      id: "openai-function-calling",
      title: "Function calling",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/function-calling",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["model-tool-call-is-request"],
    },
    {
      id: "openai-agents-human-in-the-loop",
      title: "Human-in-the-loop",
      publisher: "OpenAI Agents SDK",
      url: "https://openai.github.io/openai-agents-python/human_in_the_loop/",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["approval-pauses-and-resumes"],
    },
    {
      id: "anthropic-building-effective-agents",
      title: "Building effective agents",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["stop-conditions-bound-runs"],
    },
    {
      id: "langgraph-persistence",
      title: "Persistence",
      publisher: "LangChain",
      url: "https://docs.langchain.com/oss/python/langgraph/persistence",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["checkpoints-support-recovery"],
    },
  ],
});
