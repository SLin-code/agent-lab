import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";
import {
  categoryLabels,
  scenarios,
  type SystemCategory,
} from "./scenarios";

const categories = Object.entries(categoryLabels) as [
  SystemCategory,
  string,
][];

export function ScenarioClassifier() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Partial<Record<string, SystemCategory>>
  >({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const scenarioHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackHeadingRef = useRef<HTMLElement>(null);

  const scenario = scenarios[currentIndex];
  const answer = answers[scenario.id];
  const isRevealed = revealed.has(scenario.id);
  const isLast = currentIndex === scenarios.length - 1;
  const hasProgress =
    currentIndex > 0 || Object.keys(answers).length > 0 || revealed.size > 0;
  const score = useMemo(
    () =>
      scenarios.filter(
        (item) =>
          revealed.has(item.id) && answers[item.id] === item.answer,
      ).length,
    [answers, revealed],
  );

  function choose(category: SystemCategory) {
    if (isRevealed) return;
    setAnswers((current) => ({ ...current, [scenario.id]: category }));
  }

  function reveal() {
    if (!answer) return;
    setRevealed((current) => new Set(current).add(scenario.id));
    requestAnimationFrame(() => {
      feedbackHeadingRef.current?.focus({ preventScroll: true });
      feedbackHeadingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function next() {
    if (isLast) return;
    setCurrentIndex((index) => index + 1);
    requestAnimationFrame(() => {
      scenarioHeadingRef.current?.focus({ preventScroll: true });
      scenarioHeadingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function reset() {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(new Set());
    requestAnimationFrame(() => {
      scenarioHeadingRef.current?.focus({ preventScroll: true });
      scenarioHeadingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  return (
    <LabFrame
      className="classifier-lab"
      eyebrow="CLASSIFICATION LAB"
      status={
        <span className="lab-progress-label">
          题目 {currentIndex + 1} / {scenarios.length}
        </span>
      }
      title="它到底是什么？"
    >
      <div
        aria-label="分类练习进度"
        aria-valuemax={scenarios.length}
        aria-valuemin={0}
        aria-valuenow={currentIndex + (isRevealed ? 1 : 0)}
        aria-valuetext={`已完成 ${currentIndex + (isRevealed ? 1 : 0)} / ${scenarios.length} 题`}
        className="progress-track"
        role="progressbar"
      >
        <span
          style={{
            width:
              ((currentIndex + (isRevealed ? 1 : 0)) / scenarios.length) *
                100 +
              "%",
          }}
        />
      </div>

      <div className="scenario-stage">
        <div className="scenario-number">
          CASE {String(currentIndex + 1).padStart(2, "0")}
        </div>
        <h4 ref={scenarioHeadingRef} tabIndex={-1}>
          {scenario.title}
        </h4>
        <p>{scenario.description}</p>
        <div
          className="category-choices"
          aria-label="选择系统类型"
          role="group"
        >
          {categories.map(([category, label]) => (
            <button
              aria-pressed={answer === category}
              className={
                answer === category
                  ? "category-choice is-selected"
                  : "category-choice"
              }
              disabled={isRevealed}
              key={category}
              onClick={() => choose(category)}
              type="button"
            >
              <span aria-hidden="true">
                {category === "model-call"
                  ? "→"
                  : category === "workflow"
                    ? "◇"
                    : "↻"}
              </span>
              {label}
            </button>
          ))}
        </div>

        {!isRevealed ? (
          <button
            className="button button-light"
            disabled={!answer}
            onClick={reveal}
            type="button"
          >
            确认判断
          </button>
        ) : (
          <div
            className={
              answer === scenario.answer
                ? "answer-panel is-correct"
                : "answer-panel is-wrong"
            }
          >
            <div className="answer-heading">
              <strong ref={feedbackHeadingRef} tabIndex={-1}>
                {answer === scenario.answer ? "判断正确" : "再看一次控制权"}
              </strong>
              <span>正确答案：{categoryLabels[scenario.answer]}</span>
            </div>
            <div className="signal-line">
              <span>关键证据</span>
              {scenario.signal}
            </div>
            <p>{scenario.explanation}</p>
            {scenario.upgrade ? (
              <p className="upgrade-note">
                <strong>怎样变成 Agent：</strong>
                {scenario.upgrade}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="lab-footer">
        <span>
          已答 <strong>{revealed.size}</strong> 题 · 答对 <strong>{score}</strong> 题
        </span>
        <div className="result-actions">
          {isRevealed && isLast ? (
            <>
              <strong>
                {score >= 7
                  ? "你已经能从控制流识别 Agent。"
                  : "记住：先问下一步由谁决定。"}
              </strong>
            </>
          ) : null}
          <button
            className="button button-ghost-dark"
            disabled={!hasProgress}
            onClick={reset}
            type="button"
          >
            ↺ 重置
          </button>
          {isRevealed && !isLast ? (
            <button
              className="button button-light"
              onClick={next}
              type="button"
            >
              下一个场景 →
            </button>
          ) : null}
        </div>
      </div>
    </LabFrame>
  );
}
