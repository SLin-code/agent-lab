import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  id: "tool-contract",
  slug: "tool-contract",
  domainId: "behavior-tools",
  order: 1,
  title: "工具调用不等于动作完成",
  summary:
    "让同一个工具请求依次经过输入、权限、审批、执行核验与重复保护，理解 Host 如何把模型建议变成可靠动作。",
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
      id: "tool-contract-gates",
      kind: "prediction",
      title: "同一请求的 Host 路径实验",
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
  output: {
    revision: 1,
    title: "交付一份可审查的工具契约",
    description:
      "把一个有副作用的工具写成别人能够检查边界、执行证据与重放行为的动作契约。",
    prompt:
      "选择一个会改变外部状态的工具，完成两部分：先定义输入约束、调用者权限与审批点、成功后的可观察证据、相同请求的重复执行语义；再给出一条可能不安全的工具调用，逐门写出 Host 应该拒绝、等待审批、执行还是返回既有结果，并标注改变判断的证据。",
    transferPrompt:
      "不要复用本课的优惠金案例。可以选择退款、发送通知、删除文件、创建工单或你实际系统中的其他副作用动作。",
    objectiveIds: [
      "separate-call-from-action",
      "trace-contract-gates",
      "design-reviewable-contract",
    ],
    criteria: [
      {
        id: "define-input-boundary",
        text: "输入约束同时说明字段形状和至少一个业务取值边界",
      },
      {
        id: "define-authority-approval",
        text: "明确谁可提议、谁可直接执行，以及何时必须审批",
      },
      {
        id: "define-verifiable-outcome",
        text: "成功标准引用工具或环境返回的可观察证据，而不是模型自述",
      },
      {
        id: "define-replay-semantics",
        text: "定义识别同一意图的键，并说明重复请求是否会再次产生副作用",
      },
      {
        id: "trace-host-path",
        text: "不安全调用的路径包含具体证据、Host 决定和最终状态",
      },
    ],
    placeholder:
      "工具与副作用：……\n输入约束：……\n权限与审批：……\n成功证据：……\n重复执行语义：……\n\n待分析调用：……\n输入门证据 → Host 决定：……\n权限门证据 → Host 决定：……\n重复门证据 → Host 决定：……\n最终状态与可核验证据：……",
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
