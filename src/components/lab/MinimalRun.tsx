import { useEffect, useRef, type ReactNode } from "react";

export type MinimalRunStageId =
  | "goal"
  | "see"
  | "decide"
  | "act"
  | "observe"
  | "control";

export interface MinimalRunStep {
  id: MinimalRunStageId;
  label: string;
  title: string;
  detail: string;
}

type StepAt<Id extends MinimalRunStageId> = Omit<MinimalRunStep, "id"> & {
  id: Id;
};

export type MinimalRunSteps = readonly [
  StepAt<"goal">,
  StepAt<"see">,
  StepAt<"decide">,
  StepAt<"act">,
  StepAt<"observe">,
  StepAt<"control">,
];

export function MinimalRun({
  steps,
  activeIndex,
  children,
}: {
  steps: MinimalRunSteps;
  activeIndex: number;
  children?: ReactNode;
}) {
  const currentIndex = Number.isInteger(activeIndex)
    ? Math.min(Math.max(activeIndex, 0), steps.length - 1)
    : 0;
  const activeStep = steps[currentIndex];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (previousIndexRef.current === currentIndex) return;
    previousIndexRef.current = currentIndex;
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }, [currentIndex]);

  return (
    <div className="minimal-run">
      <ol className="minimal-run-map" aria-label="本次 Agent Run 的六个阶段">
        {steps.map((step, index) => {
          const state =
            index < currentIndex
              ? "is-complete"
              : index === currentIndex
                ? "is-active"
                : "is-future";

          return (
            <li
              aria-current={index === currentIndex ? "step" : undefined}
              className={state}
              key={step.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{step.label}</small>
                <strong>{index <= currentIndex ? step.title : "待运行"}</strong>
              </div>
            </li>
          );
        })}
      </ol>

      <section
        aria-live="polite"
        className="minimal-run-focus"
      >
        <div className="minimal-run-focus-copy">
          <span>
            STEP {String(currentIndex + 1).padStart(2, "0")} · {activeStep.label}
          </span>
          <h4 ref={headingRef} tabIndex={-1}>{activeStep.title}</h4>
          <p>{activeStep.detail}</p>
        </div>
        {children ? <div className="minimal-run-focus-action">{children}</div> : null}
      </section>

      {currentIndex > 0 ? (
        <details className="minimal-run-trace">
          <summary>查看到当前的 {currentIndex + 1} 步</summary>
          <ol>
            {steps.slice(0, currentIndex + 1).map((step) => (
              <li key={step.id}>
                <span>{step.label}</span>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
