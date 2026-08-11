import { useState } from "react";
import { LabFrame } from "./LabFrame";
import {
  MinimalRun,
  type MinimalRunSteps,
} from "./MinimalRun";

export interface MinimalRunCopy {
  title: string;
  detail: string;
}

export interface MinimalRunOutcome<Value extends string> {
  value: Value;
  choice: {
    title: string;
    description: string;
  };
  decide: MinimalRunCopy;
  act: MinimalRunCopy;
  observe: MinimalRunCopy;
  control: MinimalRunCopy;
  evidence: string;
}

export interface MinimalRunExperimentSpec<Value extends string> {
  eyebrow: string;
  title: string;
  goal: MinimalRunCopy;
  see: MinimalRunCopy;
  decision: MinimalRunCopy & {
    groupLabel: string;
    actionLabel: string;
    alternateLabel: string;
  };
  outcomes: readonly [
    MinimalRunOutcome<Value>,
    MinimalRunOutcome<Value>,
  ];
}

function buildSteps<Value extends string>(
  spec: MinimalRunExperimentSpec<Value>,
  outcome: MinimalRunOutcome<Value> | undefined,
): MinimalRunSteps {
  return [
    {
      id: "goal",
      label: "目标",
      ...spec.goal,
    },
    {
      id: "see",
      label: "看见",
      ...spec.see,
    },
    {
      id: "decide",
      label: "决定",
      ...(outcome?.decide ?? spec.decision),
    },
    {
      id: "act",
      label: "行动",
      ...(outcome?.act ?? {
        title: "等待决定",
        detail: "选择一个条件后，Host 才会执行这一轮动作。",
      }),
    },
    {
      id: "observe",
      label: "观察",
      ...(outcome?.observe ?? {
        title: "等待环境反馈",
        detail: "动作发生后，新的环境证据才会写回本次 Run。",
      }),
    },
    {
      id: "control",
      label: "继续 / 停止",
      ...(outcome?.control ?? {
        title: "等待运行结果",
        detail: "系统根据完成标准与最新观察决定继续还是停止。",
      }),
    },
  ];
}

export function MinimalRunExperiment<Value extends string>({
  spec,
}: {
  spec: MinimalRunExperimentSpec<Value>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [choice, setChoice] = useState<Value | null>(null);
  const outcome = spec.outcomes.find((item) => item.value === choice);
  const steps = buildSteps(spec, outcome);
  const isDecision = activeIndex === 2;
  const isComplete = activeIndex === steps.length - 1;

  function reset(nextChoice: Value | null = null) {
    setChoice(nextChoice);
    setActiveIndex(nextChoice === null ? 0 : 2);
  }

  function compareOtherOutcome() {
    if (!outcome) return;
    const alternate = spec.outcomes.find(
      (item) => item.value !== outcome.value,
    );
    reset(alternate?.value ?? null);
  }

  return (
    <LabFrame
      className="minimal-run-lab"
      eyebrow={spec.eyebrow}
      status={
        <span className="trace-status">
          STEP {activeIndex + 1} / {steps.length}
        </span>
      }
      title={spec.title}
    >
      <MinimalRun activeIndex={activeIndex} steps={steps}>
        {isDecision ? (
          <>
            <div
              aria-label={spec.decision.groupLabel}
              className="minimal-run-choice-grid"
              role="group"
            >
              {spec.outcomes.map((item) => (
                <button
                  aria-pressed={choice === item.value}
                  className={`minimal-run-choice ${
                    choice === item.value ? "is-selected" : ""
                  }`}
                  key={item.value}
                  onClick={() => setChoice(item.value)}
                  type="button"
                >
                  <strong>{item.choice.title}</strong>
                  <small>{item.choice.description}</small>
                </button>
              ))}
            </div>
            <div className="minimal-run-controls">
              <button
                className="button button-light"
                disabled={!outcome}
                onClick={() => setActiveIndex(3)}
                type="button"
              >
                {spec.decision.actionLabel}
              </button>
            </div>
          </>
        ) : isComplete && outcome ? (
          <>
            <div className="minimal-run-evidence">{outcome.evidence}</div>
            <div className="minimal-run-controls">
              <button
                className="button button-secondary"
                onClick={() => reset()}
                type="button"
              >
                ↺ 从头重置
              </button>
              <button
                className="button button-light"
                onClick={compareOtherOutcome}
                type="button"
              >
                {spec.decision.alternateLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="minimal-run-controls">
            {activeIndex > 0 ? (
              <button
                className="button button-secondary"
                onClick={() => reset()}
                type="button"
              >
                ↺ 重置
              </button>
            ) : null}
            <button
              className="button button-light"
              onClick={() =>
                setActiveIndex((index) =>
                  Math.min(index + 1, steps.length - 1),
                )
              }
              type="button"
            >
              看下一步 →
            </button>
          </div>
        )}
      </MinimalRun>
    </LabFrame>
  );
}
