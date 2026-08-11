import { useEffect, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type ApprovalEvidence = "missing" | "present";
type RunStatus = "ready" | "running" | "blocked" | "verified";
type GateState = "pending" | "active" | "passed" | "blocked" | "skipped";

interface ContractGate {
  id: string;
  label: string;
  title: string;
  question: string;
  checking: string;
  passed: string;
  passedLabel: string;
}

const gates: readonly ContractGate[] = [
  {
    id: "input",
    label: "01 · INPUT",
    title: "输入门",
    question: "参数形状与业务取值可接受吗？",
    checking: "校验 amount 与 operationId",
    passed: "Schema 通过 · amount=300",
    passedLabel: "通过",
  },
  {
    id: "authority",
    label: "02 · AUTHORITY",
    title: "权限 / 审批门",
    question: "¥300 超过直执上限，审批可核验吗？",
    checking: "核对审批人与请求快照",
    passed: "A-17 与 case-7781 匹配",
    passedLabel: "放行",
  },
  {
    id: "replay",
    label: "03 · REPLAY",
    title: "重复门",
    question: "operationId 是否已经成功执行？",
    checking: "查询 case-7781 的历史回执",
    passed: "无既有回执 · 允许首次执行",
    passedLabel: "通过",
  },
  {
    id: "execute",
    label: "04 · EXECUTE",
    title: "执行",
    question: "由 Host 发起一次真实工具调用。",
    checking: "调用 grant_credit",
    passed: "write_count=1",
    passedLabel: "已执行",
  },
  {
    id: "verify",
    label: "05 · VERIFY",
    title: "核验",
    question: "环境结果满足完成标准吗？",
    checking: "核对交易号与余额差值",
    passed: "txn-8842 · balance 120→420",
    passedLabel: "已核验",
  },
];

const gateStateLabels: Record<GateState, string> = {
  pending: "等待",
  active: "检查中",
  passed: "通过",
  blocked: "拦截",
  skipped: "未到达",
};

export function ToolContractLab() {
  const [approval, setApproval] = useState<ApprovalEvidence | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>("ready");
  const [activeGate, setActiveGate] = useState(-1);
  const firstApprovalRef = useRef<HTMLButtonElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const terminalGate = approval === "missing" ? 1 : gates.length - 1;

  useEffect(() => {
    if (runStatus !== "running" || !approval || activeGate < 0) return;
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (activeGate < terminalGate) {
        setActiveGate((current) => current + 1);
        return;
      }
      setRunStatus(approval === "missing" ? "blocked" : "verified");
    }, reducedMotion ? 80 : 520);
    return () => window.clearTimeout(timer);
  }, [activeGate, approval, runStatus, terminalGate]);

  useEffect(() => {
    if (runStatus !== "blocked" && runStatus !== "verified") return;
    requestAnimationFrame(() => outcomeRef.current?.focus({ preventScroll: true }));
  }, [runStatus]);

  function startRun(nextApproval: ApprovalEvidence | null = approval) {
    if (!nextApproval) return;
    setApproval(nextApproval);
    setActiveGate(0);
    setRunStatus("running");
  }

  function reset() {
    setApproval(null);
    setActiveGate(-1);
    setRunStatus("ready");
    requestAnimationFrame(() => firstApprovalRef.current?.focus({ preventScroll: true }));
  }

  function readGateState(index: number): GateState {
    if (runStatus === "ready") return "pending";
    if (runStatus === "running") {
      if (index < activeGate) return "passed";
      if (index === activeGate) return "active";
      return "pending";
    }
    if (runStatus === "blocked") {
      if (index < terminalGate) return "passed";
      if (index === terminalGate) return "blocked";
      return "skipped";
    }
    return "passed";
  }

  function readGateLabel(gate: ContractGate, state: GateState) {
    return state === "passed" ? gate.passedLabel : gateStateLabels[state];
  }

  function readGateResult(gate: ContractGate, index: number, state: GateState) {
    if (state === "active") return gate.checking;
    if (state === "passed") return gate.passed;
    if (state === "blocked") return "缺少主管审批 · tool_write_count=0";
    if (state === "skipped") return "上游已拦截 · 不执行";
    if (runStatus === "ready" && index === 0) return "等待送入 Host";
    return gate.question;
  }

  const alternateApproval: ApprovalEvidence =
    approval === "present" ? "missing" : "present";
  const statusLabel =
    runStatus === "ready"
      ? "READY"
      : runStatus === "running"
        ? `CHECKING ${activeGate + 1} / ${gates.length}`
        : runStatus === "blocked"
          ? "BLOCKED"
          : "VERIFIED";

  return (
    <LabFrame
      className="tool-contract-gate-lab"
      eyebrow="HOST CONTRACT RUN"
      status={<span className="trace-status">{statusLabel}</span>}
      title="同一个请求，逐门检查"
    >
      <div className="tool-gate-input-row">
        <section aria-label="模型提交给 Host 的工具请求" className="tool-gate-request">
          <span>MODEL REQUEST</span>
          <strong>grant_credit</strong>
          <dl>
            <div><dt>amount</dt><dd>¥300</dd></div>
            <div><dt>operationId</dt><dd>case-7781</dd></div>
            <div><dt>direct limit</dt><dd>¥200</dd></div>
          </dl>
        </section>

        <fieldset className="tool-gate-choice" disabled={runStatus === "running"}>
          <legend>Host 还能看到哪份审批证据？</legend>
          <div>
            <button
              aria-pressed={approval === "missing"}
              className={approval === "missing" ? "is-selected" : ""}
              disabled={runStatus !== "ready"}
              onClick={() => setApproval("missing")}
              ref={firstApprovalRef}
              type="button"
            >
              <strong>没有审批记录</strong>
              <small>只有模型给出的工具参数</small>
            </button>
            <button
              aria-pressed={approval === "present"}
              className={approval === "present" ? "is-selected" : ""}
              disabled={runStatus !== "ready"}
              onClick={() => setApproval("present")}
              type="button"
            >
              <strong>审批 A-17 已绑定</strong>
              <small>金额、请求与审批人可核验</small>
            </button>
          </div>
        </fieldset>
      </div>

      <div className="tool-gate-controls">
        {runStatus === "ready" || runStatus === "running" ? (
          <button
            className="button button-light"
            disabled={runStatus === "running" || !approval}
            onClick={() => startRun()}
            type="button"
          >
            {runStatus === "running" ? "Host 检查中…" : "把请求送入 Host →"}
          </button>
        ) : (
          <>
            <button className="button button-ghost-dark" onClick={reset} type="button">
              ↺ 从头重置
            </button>
            <button
              className="button button-light"
              onClick={() => startRun(alternateApproval)}
              type="button"
            >
              换成{alternateApproval === "present" ? "审批 A-17" : "无审批"}，并重跑 →
            </button>
          </>
        )}
      </div>

      <section
        aria-label="Host 依次执行输入、权限审批、重复、执行与核验检查"
        className="tool-gate-pipeline"
      >
        <header>
          <span>HOST CONTRACT GATES</span>
          <small>前一门未通过，后续动作不会发生</small>
        </header>
        <ol>
          {gates.map((gate, index) => {
            const state = readGateState(index);
            return (
              <li
                aria-current={state === "active" ? "step" : undefined}
                className={`is-${state}`}
                key={gate.id}
              >
                <div className="tool-gate-heading">
                  <span>{gate.label}</span>
                  <b>{readGateLabel(gate, state)}</b>
                </div>
                <strong>{gate.title}</strong>
                <p>{readGateResult(gate, index, state)}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div
        aria-atomic="true"
        aria-live="polite"
        className={`tool-gate-outcome is-${runStatus}`}
        ref={outcomeRef}
        role="status"
        tabIndex={-1}
      >
        <span>
          {runStatus === "blocked"
            ? "停在审批门前"
            : runStatus === "verified"
              ? "环境回执"
              : runStatus === "running"
                ? "当前状态"
                : "运行结果"}
        </span>
        <strong>
          {runStatus === "blocked"
            ? "BLOCKED · 没有外部写入"
            : runStatus === "verified"
              ? "VERIFIED · txn-8842"
              : runStatus === "running"
                ? gates[activeGate]?.checking
                : "等待选择审批证据"}
        </strong>
        <small>
          {runStatus === "blocked"
            ? "approval missing · tool_write_count=0 · balance=120"
            : runStatus === "verified"
              ? "approval A-17 · balance 120→420 · write_count=1"
              : runStatus === "running"
                ? "Host 只会执行已经通过前置闸门的下一步。"
                : "同一个请求只改变审批证据，比较它是否会产生副作用。"}
        </small>
      </div>
    </LabFrame>
  );
}
