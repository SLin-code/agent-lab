import { useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type NodeId =
  | "start"
  | "inspect"
  | "facts"
  | "risk"
  | "compose"
  | "evaluate"
  | "publish"
  | "end";

interface TraceMoment {
  nodes: readonly NodeId[];
  label: string;
  evidence: string;
  edge: string;
  settled?: boolean;
}

const runA: readonly TraceMoment[] = [
  { nodes: ["start"], label: "输入到达", evidence: "brief=v7", edge: "START → 检查" },
  { nodes: ["inspect"], label: "检查任务", evidence: "needs_evidence=true", edge: "扇出两项检查" },
  { nodes: ["facts", "risk"], label: "并行检查", evidence: "facts=ok · risk=low", edge: "两项完成后汇合" },
  { nodes: ["compose"], label: "生成草稿", evidence: "draft=a1", edge: "草稿 → 评估" },
  { nodes: ["evaluate"], label: "评估草稿", evidence: "score=0.91 · threshold=0.80", edge: "选择通过边" },
  { nodes: ["publish"], label: "发布", evidence: "artifact=pub-204", edge: "发布 → END" },
  { nodes: ["end"], label: "已经停止", evidence: "completion=verified", edge: "无下一节点" },
  { nodes: [], label: "保持停止", evidence: "没有 actor 被激活", edge: "—", settled: true },
  { nodes: [], label: "保持停止", evidence: "没有 actor 被激活", edge: "—", settled: true },
];

const runB: readonly TraceMoment[] = [
  { nodes: ["start"], label: "输入到达", evidence: "brief=v7", edge: "START → 检查" },
  { nodes: ["inspect"], label: "检查任务", evidence: "needs_evidence=true", edge: "扇出两项检查" },
  { nodes: ["facts", "risk"], label: "并行检查", evidence: "facts=ok · risk=low", edge: "两项完成后汇合" },
  { nodes: ["compose"], label: "生成草稿", evidence: "draft=b1", edge: "草稿 → 评估" },
  { nodes: ["evaluate"], label: "评估草稿", evidence: "score=0.62 · threshold=0.80", edge: "选择回边" },
  { nodes: ["compose"], label: "沿回边修订", evidence: "feedback=补齐限制条件", edge: "修订 → 再评估" },
  { nodes: ["evaluate"], label: "再次评估", evidence: "score=0.88 · threshold=0.80", edge: "选择通过边" },
  { nodes: ["publish"], label: "发布", evidence: "artifact=pub-205", edge: "发布 → END" },
  { nodes: ["end"], label: "已经停止", evidence: "completion=verified", edge: "无下一节点" },
];

const nodeLabels: Record<NodeId, { eyebrow: string; title: string }> = {
  start: { eyebrow: "ENTRY", title: "START" },
  inspect: { eyebrow: "NODE", title: "检查任务" },
  facts: { eyebrow: "PARALLEL A", title: "事实核验" },
  risk: { eyebrow: "PARALLEL B", title: "风险检查" },
  compose: { eyebrow: "NODE", title: "草拟 / 修订" },
  evaluate: { eyebrow: "ROUTER", title: "质量评估" },
  publish: { eyebrow: "NODE", title: "发布" },
  end: { eyebrow: "EXIT", title: "END" },
};

function GraphNode({ node, phase }: { node: NodeId; phase: number }) {
  const activeA = runA[phase].nodes.includes(node);
  const activeB = runB[phase].nodes.includes(node);
  const activityClass = activeA && activeB
    ? "is-active-both"
    : activeA
      ? "is-active-a"
      : activeB
        ? "is-active-b"
        : "";

  return (
    <div className={["tvr-graph-node", activityClass].filter(Boolean).join(" ")}>
      <small>{nodeLabels[node].eyebrow}</small>
      <strong>{nodeLabels[node].title}</strong>
      {(activeA || activeB) ? (
        <span className="tvr-node-markers" aria-label={`${activeA ? "Run A 激活" : ""}${activeA && activeB ? "，" : ""}${activeB ? "Run B 激活" : ""}`}>
          {activeA ? <b>A</b> : null}
          {activeB ? <b>B</b> : null}
        </span>
      ) : null}
    </div>
  );
}

function TraceDots({ trace, phase, run }: { trace: readonly TraceMoment[]; phase: number; run: "A" | "B" }) {
  return (
    <div className={`tvr-trace-dots is-run-${run.toLowerCase()}`} aria-label={`Run ${run} 九个时间点`}>
      {trace.map((moment, index) => (
        <span
          aria-label={`T${index}: ${moment.label}`}
          className={[
            index === phase ? "is-current" : "",
            index < phase ? "is-past" : "",
            moment.settled ? "is-settled" : "",
          ].filter(Boolean).join(" ")}
          key={`${run}-${index}`}
          title={`T${index} · ${moment.label}`}
        >
          {index}
        </span>
      ))}
    </div>
  );
}

export function GraphRuntimeLab() {
  const [phase, setPhase] = useState(0);
  const rangeRef = useRef<HTMLInputElement>(null);
  const currentA = runA[phase];
  const currentB = runB[phase];

  function reset() {
    setPhase(0);
    requestAnimationFrame(() => rangeRef.current?.focus({ preventScroll: true }));
  }

  return (
    <LabFrame
      className="tvr-runtime-lab"
      eyebrow="GRAPH RUNTIME LENS"
      status={<span className="trace-status">SUPERSTEP {phase} / 8</span>}
      title="同一拓扑 · 两条激活轨迹"
    >
      <div className="tvr-runtime-legend" aria-label="运行轨迹图例">
        <span><i className="is-a" />Run A · 首次评估 0.91</span>
        <span><i className="is-b" />Run B · 首次评估 0.62</span>
        <small>节点上的 A / B 表示本拍被激活</small>
      </div>

      <div className="tvr-topology" aria-label="固定 Graph 拓扑：开始后检查任务，并行核验事实与风险，汇合后草拟并评估；通过则发布结束，不通过则回到草拟">
        <div className="tvr-topology-row is-entry">
          <GraphNode node="start" phase={phase} />
          <i aria-hidden="true">→</i>
          <GraphNode node="inspect" phase={phase} />
        </div>

        <div className="tvr-edge-caption"><span>FORK · 同一 superstep 激活</span><i aria-hidden="true">↓</i></div>

        <div className="tvr-parallel-pair">
          <GraphNode node="facts" phase={phase} />
          <GraphNode node="risk" phase={phase} />
        </div>

        <div className="tvr-edge-caption"><span>JOIN · 两项更新汇合</span><i aria-hidden="true">↓</i></div>

        <div className="tvr-topology-row is-evaluation">
          <GraphNode node="compose" phase={phase} />
          <i aria-hidden="true">→</i>
          <GraphNode node="evaluate" phase={phase} />
        </div>

        <div className="tvr-branch-pair">
          <div className="tvr-exit-edge">
            <span>score ≥ 0.80</span>
            <GraphNode node="publish" phase={phase} />
            <i aria-hidden="true">→</i>
            <GraphNode node="end" phase={phase} />
          </div>
          <div className="tvr-back-edge">
            <span>score &lt; 0.80</span>
            <strong>↩ 回到「草拟 / 修订」</strong>
          </div>
        </div>
      </div>

      <div className="tvr-scrubber">
        <div className="tvr-scrubber-heading">
          <label htmlFor="graph-runtime-phase">拖动时间游标，擦看这一拍</label>
          {phase > 0 ? <button onClick={reset} type="button">↺ 回到 T0</button> : null}
        </div>
        <input
          aria-valuetext={`Superstep ${phase}。Run A：${currentA.label}。Run B：${currentB.label}。`}
          id="graph-runtime-phase"
          max={8}
          min={0}
          onInput={(event) => setPhase(Number(event.currentTarget.value))}
          ref={rangeRef}
          step={1}
          type="range"
          value={phase}
        />
        <div className="tvr-trace-row">
          <strong>RUN A</strong>
          <TraceDots phase={phase} run="A" trace={runA} />
        </div>
        <div className="tvr-trace-row">
          <strong>RUN B</strong>
          <TraceDots phase={phase} run="B" trace={runB} />
        </div>
      </div>

      <div aria-atomic="true" aria-live="polite" className="tvr-runtime-readout">
        <article className="is-a">
          <span>RUN A · T{phase}</span>
          <strong>{currentA.label}</strong>
          <p>{currentA.evidence}</p>
          <small>激活边：{currentA.edge}</small>
        </article>
        <article className="is-b">
          <span>RUN B · T{phase}</span>
          <strong>{currentB.label}</strong>
          <p>{currentB.evidence}</p>
          <small>激活边：{currentB.edge}</small>
        </article>
      </div>
    </LabFrame>
  );
}
