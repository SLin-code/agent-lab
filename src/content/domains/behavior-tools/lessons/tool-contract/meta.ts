import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 2,
  id: "tool-contract",
  slug: "tool-contract",
  domainId: "behavior-tools",
  order: 1,
  title: "工具调用不等于动作完成",
  summary:
    "沿同一条六步 Run，只改变审批证据，理解 Host 如何把模型建议变成可拒绝、可执行、可核验的动作。",
  durationMinutes: 20,
  audience: "all",
  stability: "stable",
  status: "ready",
  tags: ["tool-calling", "tool-contract", "approval", "idempotency"],
  objectives: [
    {
      id: "separate-call-from-action",
      text: "区分模型提出工具调用与 Host 完成真实动作",
    },
    {
      id: "trace-contract-gates",
      text: "根据输入、权限、审批和重复执行条件判断 Host 路径",
    },
    {
      id: "design-reviewable-contract",
      text: "为有副作用的工具设计可核验、可重放的契约",
    },
  ],
  interactions: [
    {
      id: "tool-approval-run",
      kind: "prediction",
      title: "审批证据单变量实验",
      objectiveIds: [
        "separate-call-from-action",
        "trace-contract-gates",
        "design-reviewable-contract",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["agent-or-not"],
  thesis: {
    statement: "模型可以提出一次工具调用，但可靠动作取决于",
    emphasis: "Host 是否按契约检查、执行、核验并处理重放。",
  },
  claims: [
    {
      id: "tool-call-is-application-request",
      statement:
        "Function tool 让模型把参数传给应用；实际访问数据或采取动作的是应用侧代码，而不是工具调用文本本身。",
    },
    {
      id: "strict-schema-adherence",
      statement:
        "OpenAI Function Calling 的参数由 JSON Schema 定义；启用 strict mode 可让函数调用可靠地遵循该 Schema。",
    },
    {
      id: "tool-output-linked-to-call",
      statement:
        "OpenAI Function Calling 的工具输出由工具产生，并通过 call_id 关联到具体的模型工具调用。",
    },
    {
      id: "remote-mcp-approval-control",
      statement:
        "OpenAI 的远程 MCP 工具调用可以自动放行或要求显式审批；默认会在向连接器或远程 MCP 服务器共享数据前请求审批。",
    },
    {
      id: "stripe-idempotent-retry",
      statement:
        "在 Stripe API 中，幂等键用于识别同一请求的重试；同一键的后续请求返回已保存的结果，避免重复创建对象或重复更新。",
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
      supportsClaimIds: [
        "tool-call-is-application-request",
        "strict-schema-adherence",
        "tool-output-linked-to-call",
      ],
    },
    {
      id: "openai-mcp-connectors",
      title: "MCP and Connectors",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/tools-connectors-mcp",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["remote-mcp-approval-control"],
    },
    {
      id: "stripe-idempotent-requests",
      title: "Idempotent requests",
      publisher: "Stripe",
      url: "https://docs.stripe.com/api/idempotent_requests",
      verifiedAt: "2026-08-07",
      supportsClaimIds: ["stripe-idempotent-retry"],
    },
  ],
});
