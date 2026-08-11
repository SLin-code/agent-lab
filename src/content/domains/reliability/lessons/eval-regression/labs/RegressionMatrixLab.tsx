import { useRef, useState, type CSSProperties } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type Stage =
  | "demo"
  | "baseline"
  | "judged"
  | "local-fix"
  | "regression"
  | "reliable";
type CellResult = "pass" | "fail" | "not-run";

interface EvalCase {
  id: string;
  cluster: string;
  input: string;
  expected: string;
}

const cases: readonly EvalCase[] = [
  { id: "C-01", cluster: "常规", input: "购买 3 天", expected: "ALLOW" },
  { id: "C-02", cluster: "边界", input: "购买 7 天整", expected: "ALLOW" },
  { id: "C-03", cluster: "边界", input: "购买 8 天", expected: "DENY" },
  { id: "C-04", cluster: "相对日期", input: "上周五购买", expected: "ALLOW" },
  { id: "C-05", cluster: "相对日期", input: "两周前购买", expected: "DENY" },
  { id: "C-06", cluster: "证据缺口", input: "日期缺失", expected: "WAIT" },
  { id: "C-07", cluster: "品类例外", input: "数字商品", expected: "DENY" },
  { id: "C-08", cluster: "品类例外", input: "质量问题", expected: "ESCALATE" },
];

const stageOrder: readonly Stage[] = [
  "demo",
  "baseline",
  "judged",
  "local-fix",
  "regression",
  "reliable",
];

const stageCopy: Record<
  Stage,
  { status: string; action?: string; note: string; score: string }
> = {
  demo: {
    status: "DEMO 1 / 1",
    action: "扩大到故障样本簇 →",
    note: "常规样本通过，只能证明这一格成功。",
    score: "1 / 1",
  },
  baseline: {
    status: "BASELINE 7 / 8",
    action: "加入可判定 Eval →",
    note: "真实分布暴露了 C-04：Agent 无法把“上周五”换算成明确天数。",
    score: "7 / 8",
  },
  judged: {
    status: "FAILURE LOCATED",
    action: "应用过宽修复并复测 →",
    note: "判据把失败钉在“相对日期解析”，而不是笼统归因于模型不够聪明。",
    score: "C-04",
  },
  "local-fix": {
    status: "PATCH CASE 1 / 1",
    action: "启动全量回归雷达 →",
    note: "修复样本通过了，但其余七格尚未重跑，不能据此发布。",
    score: "1 / 1",
  },
  regression: {
    status: "REGRESSION 7 / 8",
    action: "收紧修复边界并回归 →",
    note: "“包含周就允许”的过宽规则修好 C-04，却让 C-05 从正确变成错误。",
    score: "1 新失败",
  },
  reliable: {
    status: "REGRESSION 8 / 8",
    note: "相对日期先被换算成绝对天数；失败样本和旧样本全部通过。",
    score: "8 / 8",
  },
};

function readResult(stage: Stage, caseId: string): CellResult {
  if (stage === "demo") return caseId === "C-01" ? "pass" : "not-run";
  if (stage === "baseline" || stage === "judged") {
    return caseId === "C-04" ? "fail" : "pass";
  }
  if (stage === "local-fix") {
    return caseId === "C-04" ? "pass" : "not-run";
  }
  if (stage === "regression") {
    return caseId === "C-05" ? "fail" : "pass";
  }
  return "pass";
}

function readActual(stage: Stage, item: EvalCase, result: CellResult) {
  if (result === "not-run") return "未运行";
  if (result === "pass") return item.expected;
  if (item.id === "C-04") return "WAIT";
  return "ALLOW";
}

export function RegressionMatrixLab() {
  const [stage, setStage] = useState<Stage>("demo");
  const summaryRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const stageIndex = stageOrder.indexOf(stage);
  const evalEnabled = stageIndex >= stageOrder.indexOf("judged");
  const copy = stageCopy[stage];

  function advance() {
    const next = stageOrder[stageIndex + 1];
    if (!next) return;
    setStage(next);
    requestAnimationFrame(() => summaryRef.current?.focus({ preventScroll: true }));
  }

  function reset() {
    setStage("demo");
    requestAnimationFrame(() => advanceRef.current?.focus({ preventScroll: true }));
  }

  return (
    <LabFrame
      className={`eval-regression-lab is-${stage}`}
      eyebrow="FAILURE MATRIX"
      status={<span className="trace-status">{copy.status}</span>}
      title="从单格成功走到全量回归"
    >
      <div className="eval-regression-overview">
        <section className="eval-regression-judge" aria-label="当前 Eval 判据">
          <span>EVAL CONTRACT</span>
          {evalEnabled ? (
            <>
              <strong>退货资格必须同时满足</strong>
              <ul>
                <li>决策等于预期状态</li>
                <li>使用 policy=return-v7</li>
                <li>evaluation_date=2026-08-11</li>
                <li>证据缺失时不得猜测</li>
              </ul>
            </>
          ) : (
            <>
              <strong>判据尚未固化</strong>
              <p>样本回放日固定为 2026-08-11，但人工判断还不能稳定进入每次回归。</p>
            </>
          )}
        </section>

        <div
          aria-label={`当前结果 ${copy.status}，${copy.note}`}
          aria-live="polite"
          className="eval-regression-summary"
          ref={summaryRef}
          role="status"
          tabIndex={-1}
        >
          <span>{stage === "regression" ? "REGRESSION ALERT" : "CURRENT EVIDENCE"}</span>
          <strong>{copy.score}</strong>
          <p>{copy.note}</p>
        </div>

        <div className="eval-regression-radar" aria-hidden="true">
          <span className="eval-regression-radar-sweep" />
          {cases.map((item, index) => (
            <i
              className={`is-${readResult(stage, item.id)}`}
              key={item.id}
              style={{ "--radar-index": index } as CSSProperties}
            />
          ))}
          <b>{stage === "regression" ? "1" : stage === "reliable" ? "0" : "·"}</b>
          <small>回归信号</small>
        </div>
      </div>

      <section className="eval-regression-matrix" aria-label="八个退货资格样本的评估结果">
        <header>
          <span>SAMPLE BANK · 8 CASES</span>
          <small>基准日 2026-08-11 · 每格同一判据</small>
        </header>
        <ol>
          {cases.map((item) => {
            const result = readResult(stage, item.id);
            return (
              <li className={`is-${result}`} key={item.id}>
                <div>
                  <span>{item.id}</span>
                  <small>{item.cluster}</small>
                </div>
                <strong>{item.input}</strong>
                <dl>
                  <div><dt>期望</dt><dd>{item.expected}</dd></div>
                  <div><dt>实际</dt><dd>{readActual(stage, item, result)}</dd></div>
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="eval-regression-controls">
        <button
          className="button button-ghost-dark"
          disabled={stage === "demo"}
          onClick={reset}
          type="button"
        >
          ↺ 重置实验
        </button>
        {copy.action ? (
          <button
            className="button button-light"
            onClick={advance}
            ref={advanceRef}
            type="button"
          >
            {copy.action}
          </button>
        ) : null}
      </div>
    </LabFrame>
  );
}
