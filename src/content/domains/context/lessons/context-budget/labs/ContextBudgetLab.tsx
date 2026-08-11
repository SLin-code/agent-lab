import { useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type FinalEvidence = "usage-ledger" | "customer-profile";

interface EvidenceCandidate {
  id: FinalEvidence;
  kind: string;
  title: string;
  source: string;
  detail: string;
}

const evidenceCandidates: readonly EvidenceCandidate[] = [
  {
    id: "usage-ledger",
    kind: "行为记录",
    title: "使用账本",
    source: "USAGE LEDGER · 当前",
    detail: "购买后已有 3 次生成任务成功完成",
  },
  {
    id: "customer-profile",
    kind: "客户属性",
    title: "客户画像",
    source: "CRM · 当前",
    detail: "Platinum 客户 · 已注册 4 年",
  },
];

export function ContextBudgetLab() {
  const [selectedEvidence, setSelectedEvidence] =
    useState<FinalEvidence | null>(null);
  const firstCandidateRef = useRef<HTMLButtonElement>(null);
  const selectedCandidate = evidenceCandidates.find(
    (candidate) => candidate.id === selectedEvidence,
  );
  const usageCovered = selectedEvidence === "usage-ledger";

  const controlCopy =
    selectedEvidence === null
      ? {
          tone: "waiting",
          title: "等待选择最后一项证据",
          detail: "先决定最后一格放什么，再判断本次 Run 能否停止。",
        }
      : usageCovered
        ? {
            tone: "stop",
            title: "停止：决定性条件已覆盖",
            detail:
              "订单虽在 7 日内，但已有 3 次使用记录；拒绝自动退款，并转人工解释。",
          }
        : {
            tone: "continue",
            title: "继续：检索使用账本",
            detail:
              "位置已经填满，使用情况仍然未知；客户等级不能支持自动退款决定。",
          };

  return (
    <LabFrame
      className="context-slot-lab"
      eyebrow="CONTEXT SLOT LAB"
      status={<span className="cb-slot-status">3 SLOTS · 1 CHOICE</span>}
      title="最后一个位置，放什么才足以决定？"
    >
      <section className="cb-slot-goal">
        <span>目标</span>
        <div>
          <strong>判断这笔订阅能否自动退款</strong>
          <p>完成标准：现行规则中的每个决定条件，都有可核验的当前证据。</p>
        </div>
      </section>

      <div className="cb-slot-workspace">
        <section aria-labelledby="cb-slot-board-title" className="cb-slot-board">
          <header>
            <div>
              <span>看见 / 行动</span>
              <h4 id="cb-slot-board-title">当前模型视野</h4>
            </div>
            <small>{selectedCandidate ? "3 / 3 已占用" : "2 / 3 已占用"}</small>
          </header>

          <ol className="cb-slot-list">
            <li className="cb-slot-card is-fixed">
              <span className="cb-slot-index">01 · 规则</span>
              <strong>现行退款规则</strong>
              <small>POLICY · v2026.07.15</small>
              <p>购买 7 日内且未使用，才可自动退款。</p>
              <em>固定在视野中</em>
            </li>
            <li className="cb-slot-card is-fixed">
              <span className="cb-slot-index">02 · 时间</span>
              <strong>支付账本</strong>
              <small>BILLING LEDGER · 当前</small>
              <p>这笔订单发生在 3 天前。</p>
              <em>固定在视野中</em>
            </li>
            <li
              aria-label={
                selectedCandidate
                  ? `最后一个证据位：${selectedCandidate.title}，${selectedCandidate.detail}`
                  : "最后一个证据位为空"
              }
              className={`cb-slot-card cb-slot-open ${
                selectedCandidate ? "is-filled" : "is-empty"
              }`}
            >
              <span className="cb-slot-index">03 · 最后一格</span>
              {selectedCandidate ? (
                <>
                  <strong>{selectedCandidate.title}</strong>
                  <small>{selectedCandidate.source}</small>
                  <p>{selectedCandidate.detail}</p>
                  <em>{selectedCandidate.kind} · 已放入</em>
                </>
              ) : (
                <>
                  <strong>等待证据</strong>
                  <small>EMPTY SLOT</small>
                  <p>只剩一个位置。它必须回答当前决定仍缺少的问题。</p>
                  <em>从右侧选择一项</em>
                </>
              )}
            </li>
          </ol>
        </section>

        <section aria-labelledby="cb-slot-choice-title" className="cb-slot-choice-panel">
          <header>
            <span>决定</span>
            <h4 id="cb-slot-choice-title">最后一格放什么？</h4>
            <p>两项信息都是真的，但只有一项能补齐退款规则的决定条件。</p>
          </header>

          <div
            aria-label="选择最后一项上下文证据"
            className="cb-slot-candidates"
            role="group"
          >
            {evidenceCandidates.map((candidate) => {
              const isSelected = selectedEvidence === candidate.id;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`cb-slot-candidate ${isSelected ? "is-selected" : ""}`}
                  key={candidate.id}
                  onClick={() => setSelectedEvidence(candidate.id)}
                  ref={candidate.id === "usage-ledger" ? firstCandidateRef : undefined}
                  type="button"
                >
                  <span>{candidate.kind}</span>
                  <strong>{candidate.title}</strong>
                  <small>{candidate.detail}</small>
                  <em>{isSelected ? "✓ 已放入最后一格" : "放入最后一格 →"}</em>
                </button>
              );
            })}
          </div>

          <div className="cb-slot-choice-footer">
            <p>
              {selectedCandidate
                ? "点击另一张卡即可替换，只改变这一项。"
                : "选择一张卡后，覆盖结果会立即出现。"}
            </p>
            {selectedCandidate ? (
              <button
                className="button button-ghost-dark"
                onClick={() => {
                  setSelectedEvidence(null);
                  requestAnimationFrame(() =>
                    firstCandidateRef.current?.focus({ preventScroll: true }),
                  );
                }}
                type="button"
              >
                ↺ 清空最后一格
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <section className="cb-slot-feedback">
        <div className="cb-coverage-panel">
          <header>
            <span>观察</span>
            <h4>决定条件覆盖</h4>
          </header>
          <ul aria-label="自动退款决定的证据覆盖情况">
            <li className="is-covered">
              <span aria-hidden="true">✓</span>
              <div><strong>规则</strong><small>现行一手规则</small></div>
              <em>已覆盖</em>
            </li>
            <li className="is-covered">
              <span aria-hidden="true">✓</span>
              <div><strong>购买时间</strong><small>订单发生在 3 天前</small></div>
              <em>已覆盖</em>
            </li>
            <li
              className={
                selectedEvidence === null
                  ? "is-waiting"
                  : usageCovered
                    ? "is-covered"
                    : "is-missing"
              }
            >
              <span aria-hidden="true">
                {selectedEvidence === null ? "…" : usageCovered ? "✓" : "!"}
              </span>
              <div>
                <strong>使用情况</strong>
                <small>
                  {selectedEvidence === null
                    ? "等待最后一项证据"
                    : usageCovered
                      ? "账本记录 3 次成功生成"
                      : "客户等级不能证明是否使用"}
                </small>
              </div>
              <em>
                {selectedEvidence === null
                  ? "待补充"
                  : usageCovered
                    ? "已覆盖"
                    : "仍缺失"}
              </em>
            </li>
          </ul>
        </div>

        <div
          aria-atomic="true"
          aria-live="polite"
          className={`cb-control-card is-${controlCopy.tone}`}
          role="status"
        >
          <span>继续 / 停止</span>
          <strong>{controlCopy.title}</strong>
          <p>{controlCopy.detail}</p>
        </div>
      </section>
    </LabFrame>
  );
}
