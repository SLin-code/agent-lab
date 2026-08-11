import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  id: "harness-boundaries",
  slug: "harness-boundaries",
  domainId: "harness",
  order: 1,
  title: "模型给建议，Harness 决定动作能否发生",
  summary:
    "用同一个批量停用动作，观察权限、审批、超时、检查点与恢复怎样改变真实执行路径。",
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
      id: "boundary-route-simulator",
      kind: "prediction",
      title: "高风险动作边界路由实验",
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
  output: {
    revision: 1,
    title: "交付一张 Harness 边界卡",
    description:
      "把一个高风险动作从模型建议拆成可审批、可停止、可恢复、可核验的运行契约。",
    prompt:
      "选择一个高风险动作，画出“模型建议 → 权限判断 → 审批 → 执行 → 核验/恢复”的路径；为每个边界写出触发条件、状态与证据。最后分析一次缺少这些边界的调用：它最可能在哪一步失控，事后又缺少什么证据？",
    transferPrompt:
      "不要复用本课的批量停用账号案例。请选择付款、发布、删除数据、修改权限或联系外部用户中的一个新情境。",
    objectiveIds: [
      "separate-proposal-action",
      "predict-boundary-path",
      "design-recovery-state",
    ],
    criteria: [
      {
        id: "separate-proposal-execution",
        text: "明确区分模型提出什么，以及哪个 Host 组件真正执行",
      },
      {
        id: "define-permission-scope",
        text: "写清允许的资源、动作范围与越界时的阻止状态",
      },
      {
        id: "define-approval-trigger",
        text: "写清何时需要谁审批，以及拒绝后系统停在哪里",
      },
      {
        id: "define-stop-condition",
        text: "给出可测量的超时或步数上限，并定义中断状态",
      },
      {
        id: "define-recovery-evidence",
        text: "说明检查点保存什么、从哪里恢复，以及恢复前如何核验外部副作用",
      },
      {
        id: "analyze-unsafe-call",
        text: "用一条具体失败路径说明缺少边界会造成什么风险和证据缺口",
      },
    ],
    placeholder:
      "高风险动作：……\n模型建议：……\n实际执行者：……\n权限范围与越界状态：……\n审批触发条件与拒绝状态：……\n超时/步数上限：……\n检查点内容：……\n恢复前的核验证据：……\n缺少边界时的失败路径：……",
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
