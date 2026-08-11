import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "auditable-run",
  slug: "auditable-run",
  domainId: "capstone",
  order: 1,
  title: "审查一次端到端 Agent Run",
  summary:
    "把 Context、Tool Contract、Harness、Loop、Graph 与 Eval 接到同一份证据账本，观察一个回执故障如何改变跨层状态。",
  durationMinutes: 26,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["agent-system", "end-to-end", "observability", "fault-recovery"],
  objectives: [
    {
      id: "connect-system-layers",
      text: "说明 Context、工具契约、Harness、Loop、Graph 与 Eval 在同一次 Run 中分别负责什么",
    },
    {
      id: "trace-cross-layer-failure",
      text: "追踪一个工具回执故障如何改变跨层状态与下一条运行边",
    },
    {
      id: "verify-recovery-evidence",
      text: "用环境结果、检查点与回归判据判断恢复是否安全完成",
    },
  ],
  interactions: [
    {
      id: "control-room-fault-injection",
      kind: "simulation",
      title: "系统控制室与证据账本",
      objectiveIds: [
        "connect-system-layers",
        "trace-cross-layer-failure",
        "verify-recovery-evidence",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["context-budget", "topology-vs-run", "eval-regression"],
  thesis: {
    statement: "Agent System 不是六个概念的拼盘；",
    emphasis: "每一层必须在同一次 Run 中留下互相一致、可继续或可停止的证据。",
  },
  claims: [
    {
      id: "agent-loop-until-final-output",
      statement:
        "OpenAI Agents SDK 的运行循环会处理模型输出、工具调用与交接，并持续运行，直到产生最终输出或达到运行限制。",
    },
    {
      id: "application-executes-tool",
      statement:
        "Function Calling 将模型返回工具调用与应用侧执行代码分成不同步骤；工具调用文本本身不会改变外部状态。",
    },
    {
      id: "tracing-records-workflow",
      statement:
        "OpenAI Agents SDK 的 tracing 将一次端到端工作流记录为 trace，并用 spans 表示模型生成、函数调用、护栏和交接等事件。",
    },
    {
      id: "checkpoints-persist-thread-state",
      statement:
        "LangGraph checkpointer 将线程的图状态保存为检查点，可用于中断后继续和故障恢复。",
    },
    {
      id: "idempotent-retry-returns-result",
      statement:
        "Stripe API 使用幂等键识别同一请求的重试；相同键的后续请求会返回已保存结果，避免重复创建或更新。",
    },
    {
      id: "continuous-eval-after-change",
      statement:
        "OpenAI 建议在每次变更时运行持续评估，并随着新案例出现持续扩充 Eval 集。",
    },
  ],
  lastVerified: "2026-08-11",
  sources: [
    {
      id: "openai-agents-running",
      title: "Running agents",
      publisher: "OpenAI Agents SDK",
      url: "https://openai.github.io/openai-agents-python/running_agents/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["agent-loop-until-final-output"],
    },
    {
      id: "openai-function-calling",
      title: "Function calling",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/function-calling",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["application-executes-tool"],
    },
    {
      id: "openai-agents-tracing",
      title: "Tracing",
      publisher: "OpenAI Agents SDK",
      url: "https://openai.github.io/openai-agents-python/tracing/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["tracing-records-workflow"],
    },
    {
      id: "langgraph-persistence",
      title: "Persistence",
      publisher: "LangChain",
      url: "https://docs.langchain.com/oss/python/langgraph/persistence",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["checkpoints-persist-thread-state"],
    },
    {
      id: "stripe-idempotent-requests",
      title: "Idempotent requests",
      publisher: "Stripe",
      url: "https://docs.stripe.com/api/idempotent_requests",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["idempotent-retry-returns-result"],
    },
    {
      id: "openai-evaluation-best-practices",
      title: "Evaluation best practices",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["continuous-eval-after-change"],
    },
  ],
});
