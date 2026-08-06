import { useMemo, useState } from "react";
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

  const scenario = scenarios[currentIndex];
  const answer = answers[scenario.id];
  const isRevealed = revealed.has(scenario.id);
  const isLast = currentIndex === scenarios.length - 1;
  const score = useMemo(
    () =>
      scenarios.filter((item) => answers[item.id] === item.answer).length,
    [answers],
  );

  function choose(category: SystemCategory) {
    if (isRevealed) return;
    setAnswers((current) => ({ ...current, [scenario.id]: category }));
  }

  function reveal() {
    if (!answer) return;
    setRevealed((current) => new Set(current).add(scenario.id));
  }

  function next() {
    if (!isLast) setCurrentIndex((index) => index + 1);
  }

  function reset() {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(new Set());
  }

  return (
    <LabFrame
      className="classifier-lab"
      eyebrow="CLASSIFICATION LAB"
      meta={
        <span className="lab-progress-label">
          {currentIndex + 1} / {scenarios.length}
        </span>
      }
      title="它到底是什么？"
    >
      <div className="progress-track" aria-hidden="true">
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
        <h3 aria-atomic="true" aria-live="polite">
          {scenario.title}
        </h3>
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
            role="status"
          >
            <div className="answer-heading">
              <strong>
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

      {isRevealed ? (
        <div className="lab-footer">
          <span>
            当前得分 <strong>{score}</strong> / {currentIndex + 1}
          </span>
          {isLast ? (
            <div className="result-actions">
              <strong>
                {score >= 7
                  ? "你已经能从控制流识别 Agent。"
                  : "记住：先问下一步由谁决定。"}
              </strong>
              <button
                className="button button-light"
                onClick={reset}
                type="button"
              >
                重新挑战
              </button>
            </div>
          ) : (
            <button
              className="button button-light"
              onClick={next}
              type="button"
            >
              下一个场景 →
            </button>
          )}
        </div>
      ) : null}
    </LabFrame>
  );
}
