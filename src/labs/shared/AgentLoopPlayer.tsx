import { useId, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

export type AgentPhase =
  | "goal"
  | "decide"
  | "act"
  | "observe"
  | "revise"
  | "complete";

export interface AgentTraceEvent {
  id: string;
  phase: AgentPhase;
  round: number;
  actor: "User" | "Model" | "Host" | "Tool" | "Verifier";
  summary: string;
  detail: string;
}

export interface AgentLoopScenario {
  eyebrow: string;
  title: string;
  objective: string;
  events: readonly AgentTraceEvent[];
}

const phaseMeta: Record<
  AgentPhase,
  { icon: string; label: string; caption: string }
> = {
  goal: { icon: "◎", label: "目标", caption: "任务与完成标准" },
  decide: { icon: "◇", label: "决策摘要", caption: "下一步做什么？" },
  act: { icon: "↗", label: "行动 / 工具", caption: "由 Host 真正执行" },
  observe: { icon: "••", label: "观察结果", caption: "环境返回了什么？" },
  revise: { icon: "↻", label: "校正策略", caption: "证据够不够？" },
  complete: { icon: "✓", label: "完成", caption: "交付可核验结论" },
};

const phases: AgentPhase[] = [
  "goal",
  "decide",
  "complete",
  "act",
  "observe",
  "revise",
];

const edges: ReadonlyArray<{
  from: AgentPhase;
  to: AgentPhase;
  path: string;
  exit?: boolean;
}> = [
  {
    from: "goal",
    to: "decide",
    path: "M 176 82 C 255 82, 320 82, 366 82",
  },
  {
    from: "decide",
    to: "act",
    path: "M 500 106 C 600 126, 670 168, 704 214",
  },
  {
    from: "act",
    to: "observe",
    path: "M 690 276 C 622 326, 554 347, 510 352",
  },
  {
    from: "observe",
    to: "revise",
    path: "M 370 352 C 297 344, 224 316, 188 278",
  },
  {
    from: "revise",
    to: "decide",
    path: "M 174 214 C 184 148, 270 102, 366 86",
  },
  {
    from: "decide",
    to: "complete",
    path: "M 514 82 C 596 82, 660 82, 704 82",
    exit: true,
  },
];

export function AgentLoopPlayer({
  scenario,
}: {
  scenario: AgentLoopScenario;
}) {
  const markerId = `loop-arrow-${useId().replaceAll(":", "")}`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const logRef = useRef<HTMLOListElement>(null);
  const current = scenario.events[activeIndex];
  const previous =
    activeIndex > 0 ? scenario.events[activeIndex - 1] : undefined;
  const isComplete = furthestIndex === scenario.events.length - 1;

  const visitedPhases = new Set(
    scenario.events
      .slice(0, furthestIndex + 1)
      .map((event) => event.phase),
  );

  function revealNext() {
    if (activeIndex < furthestIndex) {
      setActiveIndex(furthestIndex);
      return;
    }

    if (furthestIndex >= scenario.events.length - 1) return;
    const nextIndex = furthestIndex + 1;
    setFurthestIndex(nextIndex);
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    });
  }

  function reset() {
    setActiveIndex(0);
    setFurthestIndex(0);
  }

  return (
    <LabFrame
      className="agent-loop-player"
      eyebrow={scenario.eyebrow}
      meta={
        <span className="trace-status">
          {isComplete ? "COMPLETED" : "RUNNING"}
        </span>
      }
      title={scenario.title}
    >

      <div className="agent-loop-objective">
        <span>任务目标</span>
        <strong>{scenario.objective}</strong>
      </div>

      <div
        className="agent-loop-map"
        role="group"
        aria-label="目标进入决策，经过行动、观察与校正后返回决策；达到完成标准后退出循环"
      >
        <svg
          aria-hidden="true"
          className="agent-loop-edges"
          viewBox="0 0 880 430"
        >
          <defs>
            <marker
              id={markerId}
              markerHeight="8"
              markerWidth="8"
              orient="auto"
              refX="7"
              refY="4"
              viewBox="0 0 8 8"
            >
              <path d="M 0 0 L 8 4 L 0 8 Z" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const isActive =
              previous?.phase === edge.from && current.phase === edge.to;
            return (
              <path
                className={[
                  "agent-loop-edge",
                  edge.exit ? "is-exit" : "",
                  isActive ? "is-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                d={edge.path}
                key={`${edge.from}-${edge.to}`}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
        </svg>

        {phases.map((phase) => {
          const meta = phaseMeta[phase];
          return (
            <div
              className={[
                "agent-loop-node",
                `agent-loop-node-${phase}`,
                visitedPhases.has(phase) ? "is-visited" : "",
                current.phase === phase ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={phase}
            >
              <span aria-hidden="true">{meta.icon}</span>
              <strong>{meta.label}</strong>
              <small>{meta.caption}</small>
            </div>
          );
        })}

        <div
          aria-atomic="true"
          aria-live="polite"
          className="agent-loop-current"
        >
          <span>
            {current.round === 0 ? "准备" : `第 ${current.round} 轮`}
          </span>
          <strong>
            步骤 {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(scenario.events.length).padStart(2, "0")}
          </strong>
          <small>{current.summary}</small>
        </div>
      </div>

      <div className="agent-loop-now">
        <span>此刻发生</span>
        <p>{current.detail}</p>
      </div>

      <div className="agent-loop-controls">
        <button
          className="button button-ghost-dark"
          disabled={furthestIndex === 0}
          onClick={reset}
          type="button"
        >
          ↺ 重置
        </button>
        <div className="agent-loop-progress">
          <span
            style={{
              width: `${((furthestIndex + 1) / scenario.events.length) * 100}%`,
            }}
          />
        </div>
        <span className="agent-loop-step-count">
          {furthestIndex + 1} / {scenario.events.length} 步
        </span>
        <button
          className="button button-light"
          disabled={isComplete && activeIndex === furthestIndex}
          onClick={revealNext}
          type="button"
        >
          {activeIndex < furthestIndex
            ? "回到最新一步 →"
            : isComplete
              ? "运行完成"
              : "运行下一步 →"}
        </button>
      </div>

      <div className="agent-loop-log-wrap">
        <div className="agent-loop-log-heading">
          <strong>运行日志</strong>
          <span>点击已出现的记录，可以回看这一刻</span>
        </div>
        <ol className="agent-loop-log" ref={logRef}>
          {scenario.events.slice(0, furthestIndex + 1).map((event, index) => (
            <li key={event.id}>
              <button
                aria-current={index === activeIndex ? "step" : undefined}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span className={`agent-loop-log-phase is-${event.phase}`}>
                  {phaseMeta[event.phase].label}
                </span>
                <span className="agent-loop-log-copy">
                  <strong>{event.summary}</strong>
                  <small>{event.detail}</small>
                </span>
                <span className="agent-loop-log-meta">
                  {event.round === 0 ? "GOAL" : `R${event.round}`} ·{" "}
                  {event.actor}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </LabFrame>
  );
}
