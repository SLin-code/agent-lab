import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type LabStage =
  | "predict"
  | "rejected"
  | "pending"
  | "executed"
  | "duplicate";

type PredictedOutcome = "rejected" | "pending" | "executed" | "duplicate";

type GateState = "waiting" | "active" | "passed" | "blocked" | "skipped";

interface GateView {
  id: string;
  label: string;
  detail: string;
  state: GateState;
  stateLabel: string;
}

const outcomeOptions: readonly {
  id: PredictedOutcome;
  label: string;
  hint: string;
}[] = [
  { id: "rejected", label: "拒绝", hint: "不产生副作用" },
  { id: "pending", label: "等待审批", hint: "暂停并请求授权" },
  { id: "executed", label: "直接执行", hint: "写入账户流水" },
  { id: "duplicate", label: "阻止重复", hint: "返回已有结果" },
];

const stageLabels: Record<LabStage, string> = {
  predict: "等待预测",
  rejected: "已拒绝",
  pending: "等待审批",
  executed: "已执行并核验",
  duplicate: "重复已保护",
};

function getGates(stage: LabStage): readonly GateView[] {
  if (stage === "predict") {
    return [
      {
        id: "input",
        label: "输入门",
        detail: "金额形状与上限",
        state: "active",
        stateLabel: "待检查",
      },
      {
        id: "authority",
        label: "权限门",
        detail: "角色与审批策略",
        state: "waiting",
        stateLabel: "未到达",
      },
      {
        id: "replay",
        label: "重复门",
        detail: "operationId 历史",
        state: "waiting",
        stateLabel: "未到达",
      },
      {
        id: "execute",
        label: "执行",
        detail: "写入账户流水",
        state: "waiting",
        stateLabel: "未发生",
      },
      {
        id: "verify",
        label: "结果核验",
        detail: "回执与余额变化",
        state: "waiting",
        stateLabel: "无证据",
      },
    ];
  }

  if (stage === "rejected") {
    return [
      {
        id: "input",
        label: "输入门",
        detail: "¥300 超过 v1 上限 ¥200",
        state: "blocked",
        stateLabel: "拒绝",
      },
      {
        id: "authority",
        label: "权限门",
        detail: "上游已拒绝",
        state: "skipped",
        stateLabel: "跳过",
      },
      {
        id: "replay",
        label: "重复门",
        detail: "上游已拒绝",
        state: "skipped",
        stateLabel: "跳过",
      },
      {
        id: "execute",
        label: "执行",
        detail: "零次写入",
        state: "skipped",
        stateLabel: "未执行",
      },
      {
        id: "verify",
        label: "结果核验",
        detail: "没有动作可核验",
        state: "skipped",
        stateLabel: "未发生",
      },
    ];
  }

  if (stage === "pending") {
    return [
      {
        id: "input",
        label: "输入门",
        detail: "¥300 不超过 v2 上限 ¥500",
        state: "passed",
        stateLabel: "通过",
      },
      {
        id: "authority",
        label: "权限门",
        detail: "超过直执行线 ¥200",
        state: "active",
        stateLabel: "待审批",
      },
      {
        id: "replay",
        label: "重复门",
        detail: "等待批准记录",
        state: "waiting",
        stateLabel: "未到达",
      },
      {
        id: "execute",
        label: "执行",
        detail: "零次写入",
        state: "waiting",
        stateLabel: "已暂停",
      },
      {
        id: "verify",
        label: "结果核验",
        detail: "没有动作可核验",
        state: "waiting",
        stateLabel: "无证据",
      },
    ];
  }

  if (stage === "executed") {
    return [
      {
        id: "input",
        label: "输入门",
        detail: "形状与金额均通过",
        state: "passed",
        stateLabel: "通过",
      },
      {
        id: "authority",
        label: "权限门",
        detail: "主管 A-17 已批准",
        state: "passed",
        stateLabel: "通过",
      },
      {
        id: "replay",
        label: "重复门",
        detail: "operationId 尚未出现",
        state: "passed",
        stateLabel: "首次",
      },
      {
        id: "execute",
        label: "执行",
        detail: "新增一条账户流水",
        state: "passed",
        stateLabel: "完成",
      },
      {
        id: "verify",
        label: "结果核验",
        detail: "余额与回执一致",
        state: "active",
        stateLabel: "已核验",
      },
    ];
  }

  return [
    {
      id: "input",
      label: "输入门",
      detail: "形状与金额均通过",
      state: "passed",
      stateLabel: "通过",
    },
    {
      id: "authority",
      label: "权限门",
      detail: "沿用同一批准动作",
      state: "passed",
      stateLabel: "通过",
    },
    {
      id: "replay",
      label: "重复门",
      detail: "命中 operationId: case-7781",
      state: "blocked",
      stateLabel: "保护",
    },
    {
      id: "execute",
      label: "执行",
      detail: "没有新增账户流水",
      state: "skipped",
      stateLabel: "跳过",
    },
    {
      id: "verify",
      label: "结果核验",
      detail: "返回原回执 txn-8842",
      state: "active",
      stateLabel: "复用证据",
    },
  ];
}

export function ToolContractLab() {
  const [stage, setStage] = useState<LabStage>("predict");
  const [prediction, setPrediction] = useState<PredictedOutcome>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const predictionHeadingRef = useRef<HTMLHeadingElement>(null);

  const gates = useMemo(() => getGates(stage), [stage]);
  const contractVersion = stage === "predict" || stage === "rejected" ? 1 : 2;
  const amountLimit = contractVersion === 1 ? 200 : 500;
  const hasProgress = stage !== "predict" || prediction !== undefined;

  function moveTo(nextStage: LabStage) {
    setStage(nextStage);
    requestAnimationFrame(() => {
      feedbackRef.current?.focus({ preventScroll: true });
      feedbackRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function reset() {
    setStage("predict");
    setPrediction(undefined);
    requestAnimationFrame(() => {
      predictionHeadingRef.current?.focus({ preventScroll: true });
      predictionHeadingRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function primaryAction() {
    if (stage === "predict" && prediction) moveTo("rejected");
    if (stage === "rejected") moveTo("pending");
    if (stage === "pending") moveTo("executed");
    if (stage === "executed") moveTo("duplicate");
    if (stage === "duplicate") reset();
  }

  const actionLabel =
    stage === "predict"
      ? "提交预测，运行检查 →"
      : stage === "rejected"
        ? "修改契约：上限调至 ¥500 →"
        : stage === "pending"
          ? "记录主管批准并继续 →"
          : stage === "executed"
            ? "重放同一 operationId →"
            : "重新运行实验 ↺";

  return (
    <LabFrame
      className="tool-contract-lab"
      eyebrow="TOOL CONTRACT LAB · CASE 001"
      status={<span className={`tool-contract-lab-status is-${stage}`}>{stageLabels[stage]}</span>}
      title="同一份优惠金请求，Host 会走哪条路？"
    >
      <div className="tool-contract-request-grid">
        <section aria-labelledby="tool-contract-call-title" className="tool-contract-call-card">
          <div className="tool-contract-card-heading">
            <span>MODEL TOOL CALL</span>
            <strong id="tool-contract-call-title">模型建议发放优惠金</strong>
          </div>
          <dl>
            <div>
              <dt>customerId</dt>
              <dd>U-2048</dd>
            </div>
            <div>
              <dt>amount</dt>
              <dd>¥300</dd>
            </div>
            <div>
              <dt>reason</dt>
              <dd>物流延误补偿</dd>
            </div>
            <div>
              <dt>operationId</dt>
              <dd>case-7781</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="tool-contract-policy-title" className="tool-contract-policy-card">
          <div className="tool-contract-card-heading">
            <span>HOST CONTRACT · V{contractVersion}</span>
            <strong id="tool-contract-policy-title">当前动作边界</strong>
          </div>
          <ul>
            <li className={contractVersion === 2 ? "is-changed" : undefined}>
              <span>输入</span>
              amount 为整数，提议上限 <strong>¥{amountLimit}</strong>
            </li>
            <li>
              <span>权限</span>
              support-agent 直执行线 ¥200；超出需主管批准
            </li>
            <li>
              <span>证据</span>
              返回交易号，并核对 before + amount = after
            </li>
            <li>
              <span>重放</span>
              同一 operationId 不再写入，返回原回执
            </li>
          </ul>
        </section>
      </div>

      <div
        aria-label="Host 依次检查输入、权限、重复记录，再执行并核验结果"
        className="tool-contract-gates"
        role="group"
      >
        {gates.map((gate, index) => (
          <div className="tool-contract-gate-wrap" key={gate.id}>
            <article className={`tool-contract-gate is-${gate.state}`}>
              <span className="tool-contract-gate-index">0{index + 1}</span>
              <div>
                <strong>{gate.label}</strong>
                <small>{gate.detail}</small>
              </div>
              <em>{gate.stateLabel}</em>
            </article>
            {index < gates.length - 1 ? (
              <span aria-hidden="true" className="tool-contract-gate-arrow">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {stage === "predict" ? (
        <section className="tool-contract-prediction" aria-labelledby="tool-contract-prediction-title">
          <div>
            <span>先预测，再看 Host</span>
            <h4 id="tool-contract-prediction-title" ref={predictionHeadingRef} tabIndex={-1}>
              按当前 v1 契约，这个调用会怎样？
            </h4>
          </div>
          <div aria-label="预测 Host 结果" className="tool-contract-outcomes" role="group">
            {outcomeOptions.map((option) => (
              <button
                aria-pressed={prediction === option.id}
                className={prediction === option.id ? "is-selected" : undefined}
                key={option.id}
                onClick={() => setPrediction(option.id)}
                type="button"
              >
                <strong>{option.label}</strong>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div
          aria-atomic="true"
          aria-live="polite"
          className={`tool-contract-feedback is-${stage}`}
          ref={feedbackRef}
          role="status"
          tabIndex={-1}
        >
          {stage === "rejected" ? (
            <>
              <span>PATH 01 · REJECTED</span>
              <h4>{prediction === "rejected" ? "预测正确：输入门先拒绝" : "结果：输入门先拒绝"}</h4>
              <p>
                关键证据是 <strong>amount ¥300 &gt; v1 上限 ¥200</strong>。工具调用已经出现，但 Host
                没有进入权限门，也没有产生账户写入。
              </p>
              {prediction !== "rejected" ? <small>你的预测是“{outcomeOptions.find((item) => item.id === prediction)?.label}”；它忽略了更早发生的输入检查。</small> : null}
            </>
          ) : null}

          {stage === "pending" ? (
            <>
              <span>PATH 02 · APPROVAL REQUIRED</span>
              <h4>输入通过，不代表可以直接执行</h4>
              <p>
                v2 允许提议 ¥300，但它仍超过 support-agent 的 <strong>¥200 直执行线</strong>。Host
                暂停动作并等待值班主管批准；此刻账户依然是零次写入。
              </p>
            </>
          ) : null}

          {stage === "executed" ? (
            <>
              <span>PATH 03 · EXECUTED + VERIFIED</span>
              <h4>执行完成，要看环境证据</h4>
              <p>
                主管 A-17 的批准记录让 Host 继续执行。工具返回交易回执，Host 核对余额变化，而不是采信模型说“已完成”。
              </p>
              <dl className="tool-contract-receipt">
                <div><dt>before</dt><dd>¥120</dd></div>
                <div><dt>amount</dt><dd>+ ¥300</dd></div>
                <div><dt>after</dt><dd>¥420</dd></div>
                <div><dt>receipt</dt><dd>txn-8842</dd></div>
                <div><dt>writes</dt><dd>1</dd></div>
              </dl>
            </>
          ) : null}

          {stage === "duplicate" ? (
            <>
              <span>PATH 04 · REPLAY PROTECTED</span>
              <h4>同一意图被识别，副作用没有重做</h4>
              <p>
                Host 在执行前命中 <strong>operationId case-7781</strong>，跳过第二次写入并返回原回执
                txn-8842。总写入数仍然是 1，余额仍是 ¥420。
              </p>
            </>
          ) : null}
        </div>
      )}

      <footer className="tool-contract-lab-controls">
        {stage !== "duplicate" ? (
          <button
            className="button button-ghost-dark"
            disabled={!hasProgress}
            onClick={reset}
            type="button"
          >
            ↺ 重置
          </button>
        ) : <span>实验完成：四种路径来自同一个调用与不同契约状态。</span>}
        <button
          className="button button-light"
          disabled={stage === "predict" && !prediction}
          onClick={primaryAction}
          type="button"
        >
          {actionLabel}
        </button>
      </footer>
    </LabFrame>
  );
}
