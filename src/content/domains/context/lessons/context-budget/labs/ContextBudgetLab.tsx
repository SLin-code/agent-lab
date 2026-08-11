import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";
import {
  CONTEXT_BUDGET,
  evidenceItems,
  type CoverageAxis,
  type EvidenceId,
  type EvidenceItem,
} from "./evidence";

type LabPhase = "select" | "result";
type AxisStrength = "strong" | "weak" | "missing";

interface AxisEvaluation {
  id: CoverageAxis;
  label: string;
  strength: AxisStrength;
  explanation: string;
}

const freshnessLabels = {
  current: "当前",
  stale: "过时",
  unknown: "版本未知",
} as const;

const authorityLabels = {
  primary: "一手记录",
  secondary: "二手说明",
  "self-report": "当事人自述",
  derived: "派生摘要",
} as const;

export function evaluateAxes(
  selectedIds: ReadonlySet<EvidenceId>,
): AxisEvaluation[] {
  const has = (id: EvidenceId) => selectedIds.has(id);

  return [
    has("current-policy")
      ? {
          id: "rule",
          label: "现行规则",
          strength: "strong",
          explanation: "已拿到带版本号的现行政策。",
        }
      : has("old-faq") || has("search-summary")
        ? {
            id: "rule",
            label: "现行规则",
            strength: "weak",
            explanation: "只有旧规则或无版本摘要，不能确认当前边界。",
          }
        : {
            id: "rule",
            label: "现行规则",
            strength: "missing",
            explanation: "没有退款规则，无法判断能否自动执行。",
          },
    has("purchase-ledger")
      ? {
          id: "timing",
          label: "订单时点",
          strength: "strong",
          explanation: "支付账本确认请求发生在购买后第 6 天。",
        }
      : {
          id: "timing",
          label: "订单时点",
          strength: "missing",
          explanation: "没有订单时间，无法套用 7 日窗口。",
        },
    has("usage-ledger")
      ? {
          id: "usage",
          label: "实际使用",
          strength: "strong",
          explanation: "工具账本确认已有 3 次成功生成。",
        }
      : has("customer-message")
        ? {
            id: "usage",
            label: "实际使用",
            strength: "weak",
            explanation: "只有用户自述，尚未与系统记录核对。",
          }
        : {
            id: "usage",
            label: "实际使用",
            strength: "missing",
            explanation: "没有使用证据，无法判断自动退款条件。",
          },
  ];
}

export function findIrrelevantItems(
  selectedIds: ReadonlySet<EvidenceId>,
) {
  return evidenceItems.filter(
    (item) => selectedIds.has(item.id) && item.coverage.length === 0,
  );
}

export function buildDecision(selectedIds: ReadonlySet<EvidenceId>) {
  const has = (id: EvidenceId) => selectedIds.has(id);
  const irrelevantItems = findIrrelevantItems(selectedIds);
  const decisive =
    has("current-policy") &&
    has("purchase-ledger") &&
    has("usage-ledger");

  if (decisive) {
    if (irrelevantItems.length > 0) {
      const irrelevantCost = irrelevantItems.reduce(
        (sum, item) => sum + item.cost,
        0,
      );
      return {
        quality: "可决策，但有噪声",
        qualityTone: "incomplete" as const,
        route: "转人工复核",
        summary:
          `三项决定性证据已经足以确定路径；${irrelevantItems.map((item) => item.title).join("、")}没有覆盖现行规则、订单时点或实际使用，却额外占用 ${irrelevantCost} 格。移除后结论不变。`,
        canExplain: "为什么不能自动退款，以及哪些上下文没有参与判断。",
        cannotExplain: "客服最终是否批准；这需要人工判断或新的授权结果。",
      };
    }

    return {
      quality: "证据充分",
      qualityTone: "strong" as const,
      route: "转人工复核",
      summary:
        "现行规则、订单时点和使用账本相互对齐：请求在 7 日内，但已有使用记录，因此不能自动退款。",
      canExplain: "为什么不能自动退款，以及为什么进入人工边界。",
      cannotExplain: "客服最终是否批准；这需要人工判断或新的授权结果。",
    };
  }

  if (!has("current-policy") && (has("old-faq") || has("search-summary"))) {
    return {
      quality: "规则不可靠",
      qualityTone: "risk" as const,
      route: "暂停自动执行",
      summary:
        "上下文里只有过时规则或无版本摘要。若直接采用，系统可能把未经核验的 14 日口径误当成现行政策。",
      canExplain: "候选信息声称 14 日内可能符合某种退款口径。",
      cannotExplain: "今天生效的规则，以及当前请求是否满足自动退款条件。",
    };
  }

  return {
    quality: "证据不足",
    qualityTone: "incomplete" as const,
    route: "暂停决策",
    summary:
      "至少一个决定性问题没有被可靠证据覆盖。此刻最安全的输出是指出缺口，而不是补出答案。",
    canExplain: "已选证据直接支持的局部事实。",
    cannotExplain: "缺失轴对应的结论；需要补充证据后重新评估。",
  };
}

export function findConflicts(selectedIds: ReadonlySet<EvidenceId>) {
  const conflicts: string[] = [];

  if (selectedIds.has("current-policy") && selectedIds.has("old-faq")) {
    conflicts.push(
      "版本冲突：2026 现行政策与 2025 FAQ 的期限、使用条件不同；应保留来源与版本，不能把两者拼成一条规则。",
    );
  }
  if (
    selectedIds.has("current-policy") &&
    selectedIds.has("search-summary")
  ) {
    conflicts.push(
      "规则冲突：无版本搜索摘要声称“大多数 14 日内可以通过”，与 v2026.07.15 现行政策“7 日内且未使用才可自动退款”不一致；应采用带版本的一手规则，并将摘要降权或排除。",
    );
  }
  if (selectedIds.has("usage-ledger") && selectedIds.has("customer-message")) {
    conflicts.push(
      "事实冲突：用户称从未使用，但使用账本记录了 3 次成功生成；决策应显式保留分歧，并以可核验记录约束自动执行。",
    );
  }

  return conflicts;
}

export function ContextBudgetLab() {
  const [phase, setPhase] = useState<LabPhase>("select");
  const [selected, setSelected] = useState<EvidenceId[]>([]);
  const [notice, setNotice] = useState(
    "先预测：哪些信息值得占用这 12 格上下文？",
  );
  const firstEvidenceRef = useRef<HTMLButtonElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedIds = useMemo(() => new Set(selected), [selected]);
  const selectedItems = evidenceItems.filter((item) =>
    selectedIds.has(item.id),
  );
  const usedBudget = selectedItems.reduce((sum, item) => sum + item.cost, 0);
  const remainingBudget = CONTEXT_BUDGET - usedBudget;
  const axes = evaluateAxes(selectedIds);
  const decision = buildDecision(selectedIds);
  const conflicts = findConflicts(selectedIds);
  const irrelevantItems = findIrrelevantItems(selectedIds);
  const irrelevantCost = irrelevantItems.reduce(
    (sum, item) => sum + item.cost,
    0,
  );
  const staleItems = selectedItems.filter(
    (item) => item.freshness === "stale" || item.freshness === "unknown",
  );

  function toggleEvidence(item: EvidenceItem) {
    if (phase !== "select") return;

    if (selectedIds.has(item.id)) {
      setSelected((current) => current.filter((id) => id !== item.id));
      setNotice(`已移出“${item.title}”，释放 ${item.cost} 格预算。`);
      return;
    }

    if (item.cost > remainingBudget) {
      setNotice(
        `“${item.title}”需要 ${item.cost} 格，但只剩 ${remainingBudget} 格。请先移出一项证据。`,
      );
      return;
    }

    setSelected((current) => [...current, item.id]);
    setNotice(`已加入“${item.title}”，还剩 ${remainingBudget - item.cost} 格。`);
  }

  function evaluateSelection() {
    if (selected.length === 0) return;
    setPhase("result");
    requestAnimationFrame(() => {
      resultHeadingRef.current?.focus({ preventScroll: true });
      resultHeadingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function adjustSelection() {
    setPhase("select");
    setNotice("保留当前选择。现在可以替换证据，再观察结果如何变化。 ");
    requestAnimationFrame(() => {
      firstEvidenceRef.current?.focus({ preventScroll: true });
    });
  }

  function reset() {
    setPhase("select");
    setSelected([]);
    setNotice("已重置。重新预测：哪些信息值得占用这 12 格上下文？");
    requestAnimationFrame(() => {
      firstEvidenceRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <LabFrame
      className="context-budget-lab"
      eyebrow="CONTEXT BUDGET LAB · 12 UNITS"
      status={
        <span className="cb-budget-status">
          已用 {usedBudget} / {CONTEXT_BUDGET}
        </span>
      }
      title="该给退款 Agent 看什么？"
    >
      <div className="cb-task-strip">
        <span>当前决策</span>
        <strong>是否自动退还 ¥899 年度套餐？</strong>
        <small>窗口只能容纳 12 格；系统必须依据入选证据行动。</small>
      </div>

      <div className="cb-budget-meter">
        <div
          aria-label="上下文预算使用量"
          aria-valuemax={CONTEXT_BUDGET}
          aria-valuemin={0}
          aria-valuenow={usedBudget}
          aria-valuetext={`已使用 ${usedBudget} 格，剩余 ${remainingBudget} 格`}
          className="cb-budget-track"
          role="progressbar"
        >
          <span style={{ width: `${(usedBudget / CONTEXT_BUDGET) * 100}%` }} />
        </div>
        <span aria-live="polite">剩余 {remainingBudget} 格</span>
      </div>

      {phase === "select" ? (
        <div className="cb-selection-stage">
          <div className="cb-stage-heading">
            <div>
              <span>01 · 先选择，再看结果</span>
              <h4>候选证据池</h4>
            </div>
            <p>成本代表它占用的上下文空间。点击卡片加入或移出。</p>
          </div>

          <div
            aria-label="候选证据；选择要放进上下文的信息"
            className="cb-evidence-grid"
            role="group"
          >
            {evidenceItems.map((item, index) => {
              const isSelected = selectedIds.has(item.id);
              const cannotFit = !isSelected && item.cost > remainingBudget;

              return (
                <button
                  aria-pressed={isSelected}
                  className={[
                    "cb-evidence-card",
                    isSelected ? "is-selected" : "",
                    cannotFit ? "cannot-fit" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={item.id}
                  onClick={() => toggleEvidence(item)}
                  ref={index === 0 ? firstEvidenceRef : undefined}
                  type="button"
                >
                  <span className="cb-evidence-card-top">
                    <strong>{item.title}</strong>
                    <b>{item.cost} 格</b>
                  </span>
                  <small>{item.source}</small>
                  <span className="cb-evidence-detail">{item.detail}</span>
                  <span className="cb-evidence-meta">
                    <em className={`is-${item.freshness}`}>
                      {freshnessLabels[item.freshness]}
                    </em>
                    <em>{authorityLabels[item.authority]}</em>
                    {cannotFit ? <em className="is-over-budget">当前放不下</em> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <p aria-atomic="true" aria-live="polite" className="cb-lab-notice">
            {notice}
          </p>
        </div>
      ) : (
        <div className="cb-result-stage">
          <div className="cb-result-heading">
            <div>
              <span>02 · 观察决策边界</span>
              <h4 ref={resultHeadingRef} tabIndex={-1}>
                这份上下文让系统走向：{decision.route}
              </h4>
            </div>
            <strong className={`is-${decision.qualityTone}`}>
              {decision.quality}
            </strong>
          </div>

          <div className="cb-result-flow" aria-label="上下文如何改变决策的三步路径">
            <section>
              <span>SELECTED</span>
              <h5>进入视野</h5>
              <ul>
                {selectedItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <small>{item.cost} 格</small>
                  </li>
                ))}
              </ul>
            </section>
            <i aria-hidden="true">→</i>
            <section>
              <span>COVERAGE</span>
              <h5>决定性问题</h5>
              <ul className="cb-axis-list">
                {axes.map((axis) => (
                  <li className={`is-${axis.strength}`} key={axis.id}>
                    <strong>{axis.label}</strong>
                    <small>
                      {axis.strength === "strong"
                        ? "已覆盖"
                        : axis.strength === "weak"
                          ? "证据弱"
                          : "缺失"}
                    </small>
                  </li>
                ))}
              </ul>
            </section>
            <i aria-hidden="true">→</i>
            <section className="cb-route-card">
              <span>BOUNDARY</span>
              <h5>{decision.route}</h5>
              <p>{decision.summary}</p>
            </section>
          </div>

          <div className="cb-axis-detail-grid">
            {axes.map((axis) => (
              <article className={`is-${axis.strength}`} key={axis.id}>
                <span>{axis.label}</span>
                <p>{axis.explanation}</p>
              </article>
            ))}
          </div>

          <p className="cb-lab-notice">
            <strong>预算相关性：</strong>{" "}
            {irrelevantItems.length > 0
              ? `${irrelevantItems.map((item) => item.title).join("、")}没有覆盖现行规则、订单时点或实际使用，却占用 ${irrelevantCost} 格。移除后，当前决策路径不会改变。`
              : "所有入选证据都覆盖至少一个决定性问题；上下文预算无需刻意用满。"}
          </p>

          <div className="cb-risk-grid">
            <section>
              <span>过时 / 版本未知</span>
              {staleItems.length > 0 ? (
                <ul>
                  {staleItems.map((item) => (
                    <li key={item.id}>{item.title}：{freshnessLabels[item.freshness]}</li>
                  ))}
                </ul>
              ) : (
                <p>入选证据没有已知的过时项。</p>
              )}
            </section>
            <section>
              <span>显式冲突</span>
              {conflicts.length > 0 ? (
                <ul>
                  {conflicts.map((conflict) => (
                    <li key={conflict}>{conflict}</li>
                  ))}
                </ul>
              ) : (
                <p>当前选择没有同时暴露冲突双方；这不等于现实中不存在冲突。</p>
              )}
            </section>
          </div>

          <div className="cb-boundary-grid">
            <p>
              <span>当前能说明</span>
              {decision.canExplain}
            </p>
            <p>
              <span>当前不能说明</span>
              {decision.cannotExplain}
            </p>
          </div>
        </div>
      )}

      <footer className="cb-lab-footer">
        <button
          className="button button-ghost-dark"
          disabled={selected.length === 0}
          onClick={reset}
          type="button"
        >
          ↺ 重置
        </button>
        <span>{selected.length} 项证据 · {remainingBudget} 格未使用</span>
        {phase === "select" ? (
          <button
            className="button button-light"
            disabled={selected.length === 0}
            onClick={evaluateSelection}
            type="button"
          >
            评估这份上下文 →
          </button>
        ) : (
          <button
            className="button button-light"
            onClick={adjustSelection}
            type="button"
          >
            调整一项，再比较 →
          </button>
        )}
      </footer>
    </LabFrame>
  );
}
