import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "topology-vs-run",
  slug: "topology-vs-run",
  domainId: "graph",
  order: 1,
  title: "图不是一次运行",
  summary:
    "把固定拓扑与运行时激活轨迹叠在一起，读懂分支、并行、回边与停止。",
  durationMinutes: 20,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["graph-engineering", "runtime", "parallel", "graph-loop"],
  objectives: [
    {
      id: "separate-topology-from-run",
      text: "区分图中所有可能的边与一次运行真正激活的路径",
    },
    {
      id: "read-runtime-activation",
      text: "读懂条件分支、并行激活、汇合、回边与停止",
    },
    {
      id: "compare-traces-on-one-graph",
      text: "比较同一拓扑上的两条轨迹，并指出改变路径的运行时证据",
    },
  ],
  interactions: [
    {
      id: "graph-runtime-scrubber",
      kind: "trace",
      title: "固定拓扑与双 Run 激活轨迹",
      objectiveIds: [
        "separate-topology-from-run",
        "read-runtime-activation",
        "compare-traces-on-one-graph",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["signal-driven-loop"],
  thesis: {
    statement: "Graph 描述允许发生的结构；",
    emphasis: "Run Trace 才说明这一刻哪些节点被激活、哪条边真的被选择。",
  },
  claims: [
    {
      id: "graph-nodes-and-edges-define-structure",
      statement:
        "LangGraph 的 Graph API 用节点表示执行逻辑，用普通边或条件边描述节点完成后可能激活的下一节点。",
    },
    {
      id: "outgoing-edges-can-run-in-parallel",
      statement:
        "在 LangGraph Graph API 中，一个节点拥有多条出边时，目标节点会在下一 superstep 并行执行。",
    },
    {
      id: "conditional-edge-can-end-or-loop",
      statement:
        "条件边的路由函数可以选择一个或多个下一节点，也可以返回 END；有回边的图还需要递归步数等停止约束。",
    },
    {
      id: "runtime-activates-actors-by-step",
      statement:
        "LangGraph 的 Pregel runtime 按 Plan、Execution、Update 三阶段推进：选择本步 actors，并行执行，再更新 channels；直到没有 actor 可执行或达到最大步数。",
    },
  ],
  lastVerified: "2026-08-11",
  sources: [
    {
      id: "langgraph-graph-api",
      title: "Graph API overview",
      publisher: "LangChain",
      url: "https://docs.langchain.com/oss/python/langgraph/graph-api",
      verifiedAt: "2026-08-11",
      supportsClaimIds: [
        "graph-nodes-and-edges-define-structure",
        "outgoing-edges-can-run-in-parallel",
        "conditional-edge-can-end-or-loop",
      ],
    },
    {
      id: "langgraph-pregel-runtime",
      title: "Pregel runtime",
      publisher: "LangChain",
      url: "https://docs.langchain.com/oss/python/langgraph/pregel",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["runtime-activates-actors-by-step"],
    },
  ],
});
