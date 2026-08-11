import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "capability-passports",
  slug: "capability-passports",
  domainId: "protocols",
  order: 1,
  title: "Tool、Skill、MCP、A2A 不在同一层",
  summary:
    "用四张能力护照追踪发现方式、请求封套、信任边界与真实执行者，不再把工具、技能和协议混成一类。",
  durationMinutes: 18,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["tools", "agent-skills", "mcp", "a2a", "trust-boundary"],
  objectives: [
    {
      id: "separate-capability-layers",
      text: "区分 Tool、Skill、MCP 与 A2A 各自解决的问题",
    },
    {
      id: "trace-discovery-and-call",
      text: "识别四类能力如何被发现，以及请求以什么形式发出",
    },
    {
      id: "locate-boundary-and-executor",
      text: "沿一次能力请求指出数据跨越的信任边界与真实执行者",
    },
  ],
  interactions: [
    {
      id: "capability-passport-trace",
      kind: "trace",
      title: "能力护照与消息封套追踪",
      objectiveIds: [
        "separate-capability-layers",
        "trace-discovery-and-call",
        "locate-boundary-and-executor",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["tool-contract"],
  thesis: {
    statement: "判断一种 Agent 能力，不要先问它叫什么；先追踪",
    emphasis: "如何发现、怎样请求、数据越过哪里，以及谁真正执行。",
  },
  claims: [
    {
      id: "tool-call-is-host-request",
      statement:
        "Function tool 由名称、描述与参数 Schema 暴露给模型；模型返回调用请求，应用侧代码负责实际执行并把结果送回模型。",
    },
    {
      id: "agent-skill-is-package",
      statement:
        "Agent Skills 规范把 Skill 定义为至少包含 SKILL.md 的目录；SKILL.md 包含用于发现的元数据与激活后加载的指令，目录还可包含脚本、参考资料和资源。",
    },
    {
      id: "mcp-is-client-server-protocol",
      statement:
        "MCP 采用 Host、Client、Server 架构；Server 可在本地或远程运行，并通过协议暴露工具、资源和提示等能力。",
    },
    {
      id: "mcp-tool-list-and-call",
      statement:
        "MCP Client 可通过 tools/list 发现 Server 暴露的工具，并通过 tools/call 把结构化参数交给 Server 执行。",
    },
    {
      id: "a2a-delegates-to-remote-agent",
      statement:
        "A2A Client 向独立的 Remote Agent 发送消息；远端 Agent 对调用方保持内部实现不透明，并可用 Message、Task 状态与 Artifact 返回进展或结果。",
    },
    {
      id: "mcp-a2a-are-complementary",
      statement:
        "MCP 重点连接 Agent 与工具或资源，A2A 重点支持 Agent 之间协作；同一系统可以在 Agent 间使用 A2A，并在各 Agent 内部使用 MCP。",
    },
    {
      id: "skill-term-has-two-contracts",
      statement:
        "Agent Skills 的 Skill 是带 SKILL.md 的可加载能力包；A2A Agent Card 中的 AgentSkill 是远端 Agent 能力的自描述字段，两者共享名称但不是同一种交付契约。",
    },
  ],
  lastVerified: "2026-08-11",
  sources: [
    {
      id: "openai-function-calling",
      title: "Function calling",
      publisher: "OpenAI",
      url: "https://developers.openai.com/api/docs/guides/function-calling",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["tool-call-is-host-request"],
    },
    {
      id: "agent-skills-specification",
      title: "Agent Skills Specification",
      publisher: "Agent Skills",
      url: "https://agentskills.io/specification",
      verifiedAt: "2026-08-11",
      supportsClaimIds: [
        "agent-skill-is-package",
        "skill-term-has-two-contracts",
      ],
    },
    {
      id: "mcp-architecture",
      title: "Architecture overview",
      publisher: "Model Context Protocol",
      url: "https://modelcontextprotocol.io/docs/learn/architecture",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["mcp-is-client-server-protocol"],
    },
    {
      id: "mcp-tools-specification",
      title: "MCP Specification: Tools",
      publisher: "Model Context Protocol",
      url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["mcp-tool-list-and-call"],
    },
    {
      id: "a2a-key-concepts",
      title: "A2A Protocol: Key Concepts",
      publisher: "A2A Protocol",
      url: "https://a2a-protocol.org/latest/topics/key-concepts/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["a2a-delegates-to-remote-agent"],
    },
    {
      id: "a2a-and-mcp",
      title: "A2A and MCP: Detailed Comparison",
      publisher: "A2A Protocol",
      url: "https://a2a-protocol.org/latest/topics/a2a-and-mcp/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["mcp-a2a-are-complementary"],
    },
    {
      id: "a2a-agent-discovery",
      title: "Agent Discovery in A2A",
      publisher: "A2A Protocol",
      url: "https://a2a-protocol.org/latest/topics/agent-discovery/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["skill-term-has-two-contracts"],
    },
  ],
});
