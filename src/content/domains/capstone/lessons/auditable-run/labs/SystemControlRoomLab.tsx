import { useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type RunState = "ready" | "baseline" | "faulted" | "recovered";
type LayerTone = "idle" | "ok" | "warning" | "active";

interface LayerState {
  id: string;
  label: string;
  name: string;
  status: string;
  detail: string;
  tone: LayerTone;
}

interface LedgerRow {
  phase: string;
  evidence: string;
  source: string;
}

const stateLabels: Record<RunState, string> = {
  ready: "READY",
  baseline: "BASELINE VERIFIED",
  faulted: "OUTCOME UNKNOWN",
  recovered: "RECOVERY VERIFIED",
};

function readLayers(state: RunState): readonly LayerState[] {
  const ready = state === "ready";
  const faulted = state === "faulted";
  const recovered = state === "recovered";

  return [
    {
      id: "context",
      label: "01 · CONTEXT",
      name: "上下文",
      status: ready ? "LOADED" : "VALID",
      detail: "order-4821 · policy-v7 · photo-ok · approval A-52",
      tone: ready ? "active" : "ok",
    },
    {
      id: "graph",
      label: "02 · GRAPH",
      name: "运行图",
      status: ready ? "ENTRY" : faulted ? "RECOVERY EDGE" : recovered ? "COMPLETE EDGE" : "HAPPY PATH",
      detail: ready
        ? "inspect → create_shipment"
        : faulted
          ? "create_shipment → reconcile"
          : recovered
            ? "reconcile → notify → complete"
            : "create_shipment → notify → complete",
      tone: faulted ? "warning" : ready ? "active" : "ok",
    },
    {
      id: "tool",
      label: "03 · TOOL CONTRACT",
      name: "动作契约",
      status: ready ? "ARMED" : faulted ? "UNKNOWN" : recovered ? "REPLAYED" : "VERIFIED",
      detail: ready
        ? "operationId=replace-4821 · create_count=0"
        : faulted
          ? "request accepted · response timeout · outcome unknown"
          : "shipment=S-8892 · create_count=1",
      tone: faulted ? "warning" : ready ? "active" : "ok",
    },
    {
      id: "harness",
      label: "04 · HARNESS",
      name: "运行控制",
      status: ready ? "CHECKPOINT 0" : faulted ? "RESUMABLE" : "CHECKPOINTED",
      detail: ready
        ? "保存目标、审批与 operationId"
        : faulted
          ? "after-submit · operationId 已保存 · 禁止换新键重试"
          : recovered
            ? "reconciled · checkpoint 2/2"
            : "completed · checkpoint 2/2",
      tone: faulted ? "active" : ready ? "active" : "ok",
    },
    {
      id: "loop",
      label: "05 · LOOP",
      name: "继续 / 停止",
      status: ready ? "RUN" : faulted ? "CONTINUE" : "STOP",
      detail: ready
        ? "目标尚未完成"
        : faulted
          ? "完成证据缺失；下一轮先对账"
          : "运单可核验且通知已发送",
      tone: faulted ? "active" : ready ? "active" : "ok",
    },
    {
      id: "eval",
      label: "06 · EVAL",
      name: "完成判据",
      status: ready ? "WAITING" : faulted ? "HOLD" : "PASS",
      detail: ready
        ? "需要 shipment_id + create_count=1 + notified=true"
        : faulted
          ? "没有运单回执，不允许声称完成"
          : "shipment=S-8892 · create_count=1 · notified=true",
      tone: faulted ? "warning" : ready ? "idle" : "ok",
    },
  ];
}

function readLedger(state: RunState): readonly LedgerRow[] {
  if (state === "ready") {
    return [
      { phase: "目标", evidence: "只补发一次，并把运单通知客户", source: "Run spec" },
      { phase: "看见", evidence: "订单、政策、损坏照片、审批 A-52", source: "Context" },
      { phase: "决定", evidence: "等待 Run 开始", source: "—" },
      { phase: "行动", evidence: "尚未调用外部工具", source: "Host" },
      { phase: "观察", evidence: "create_count=0", source: "Shipping API" },
      { phase: "继续 / 停止", evidence: "RUN · 目标未完成", source: "Loop" },
    ];
  }

  if (state === "baseline") {
    return [
      { phase: "目标", evidence: "只补发一次，并把运单通知客户", source: "Run spec" },
      { phase: "看见", evidence: "policy-v7 + order-4821 + approval A-52", source: "Context" },
      { phase: "决定", evidence: "走 create_shipment → notify", source: "Graph" },
      {
        phase: "行动",
        evidence: "create_shipment(replace-4821) → notify_customer(notify-4821)",
        source: "Host",
      },
      {
        phase: "观察",
        evidence: "shipment=S-8892 · create_count=1；notification=N-551 · delivered=true",
        source: "Shipping API + Messaging API",
      },
      {
        phase: "继续 / 停止",
        evidence: "运单、唯一创建与通知回执齐全；Eval PASS；STOP",
        source: "Loop + Eval",
      },
    ];
  }

  if (state === "faulted") {
    return [
      { phase: "目标", evidence: "只补发一次，并把运单通知客户", source: "Run spec" },
      {
        phase: "看见",
        evidence: "Context 与基线相同；checkpoint=after-submit；operationId 已保存",
        source: "Context + Harness",
      },
      { phase: "决定", evidence: "请求已提交，但不得假定运单不存在", source: "Tool Contract" },
      { phase: "行动", evidence: "create_shipment(operationId=replace-4821)", source: "Host" },
      { phase: "观察", evidence: "response timeout · 外部结果 UNKNOWN", source: "Shipping API" },
      { phase: "继续 / 停止", evidence: "Eval HOLD；Graph 选择 reconcile；CONTINUE", source: "Loop + Graph" },
    ];
  }

  return [
    { phase: "目标", evidence: "只补发一次，并把运单通知客户", source: "Run spec" },
    { phase: "看见", evidence: "checkpoint after-submit + operationId", source: "Harness" },
    { phase: "决定", evidence: "用同一 operationId 对账，再沿 notify 边继续", source: "Graph" },
    {
      phase: "行动",
      evidence: "重放 replace-4821 返回既有运单 → notify_customer(notify-4821)",
      source: "Host",
    },
    {
      phase: "观察",
      evidence: "shipment=S-8892 · create_count=1；notification=N-551 · delivered=true",
      source: "Shipping API + Messaging API",
    },
    {
      phase: "继续 / 停止",
      evidence: "运单、唯一创建与通知回执齐全；Eval PASS；STOP",
      source: "Loop + Eval",
    },
  ];
}

export function SystemControlRoomLab() {
  const [state, setState] = useState<RunState>("ready");
  const summaryRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const layers = readLayers(state);
  const ledger = readLedger(state);

  function transition(next: RunState) {
    setState(next);
    requestAnimationFrame(() => summaryRef.current?.focus({ preventScroll: true }));
  }

  function reset() {
    setState("ready");
    requestAnimationFrame(() => startRef.current?.focus({ preventScroll: true }));
  }

  return (
    <LabFrame
      className={`auditable-run-lab is-${state}`}
      eyebrow="SYSTEM CONTROL ROOM"
      status={<span className="trace-status">{stateLabels[state]}</span>}
      title="同一 Run 的六层状态"
    >
      <div
        aria-live="polite"
        className="auditable-run-summary"
        ref={summaryRef}
        role="status"
        tabIndex={-1}
      >
        <span>{state === "faulted" ? "FAULT PROPAGATION" : "RUN STATUS"}</span>
        <strong>
          {state === "ready"
            ? "等待执行补发 Run"
            : state === "baseline"
              ? "无故障路径：完成证据闭合"
              : state === "faulted"
                ? "回执超时：动作结果未知，不能宣布完成"
                : "恢复完成：返回既有运单，没有重复创建"}
        </strong>
        <small>
          {state === "baseline"
            ? "下一步只改变工具回执，其他输入保持不变。"
            : state === "faulted"
              ? "Tool、Harness、Graph、Loop 与 Eval 同时改变状态。"
              : state === "recovered"
                ? "shipment=S-8892 · create_count=1 · notification=N-551 · delivered=true"
                : "目标：为 order-4821 只创建一张补发运单，并通知客户。"}
        </small>
      </div>

      <section className="auditable-run-control-grid" aria-label="Context、Graph、工具契约、Harness、Loop 与 Eval 的当前状态">
        {layers.map((layer) => (
          <article className={`is-${layer.tone}`} key={layer.id}>
            <div>
              <span>{layer.label}</span>
              <b>{layer.status}</b>
            </div>
            <strong>{layer.name}</strong>
            <p>{layer.detail}</p>
            {layer.id === "tool" && state === "baseline" ? (
              <button
                className="auditable-run-fault-button"
                onClick={() => transition("faulted")}
                type="button"
              >
                <span aria-hidden="true">⚡</span>
                注入故障：工具回执超时
              </button>
            ) : null}
          </article>
        ))}
      </section>

      <section className="auditable-run-ledger" aria-label="当前 Run 的证据账本">
        <header>
          <span>EVIDENCE LEDGER</span>
          <small>结论必须能回到证据来源</small>
        </header>
        <ol>
          {ledger.map((row) => (
            <li key={row.phase}>
              <strong>{row.phase}</strong>
              <span>{row.evidence}</span>
              <small>{row.source}</small>
            </li>
          ))}
        </ol>
      </section>

      <div className="auditable-run-controls">
        <button
          className="button button-ghost-dark"
          disabled={state === "ready"}
          onClick={reset}
          type="button"
        >
          ↺ 重置控制室
        </button>
        {state === "ready" ? (
          <button
            className="button button-light"
            onClick={() => transition("baseline")}
            ref={startRef}
            type="button"
          >
            运行无故障基线 →
          </button>
        ) : state === "faulted" ? (
          <button
            className="button button-light"
            onClick={() => transition("recovered")}
            type="button"
          >
            用检查点恢复一轮 →
          </button>
        ) : state === "baseline" ? (
          <small>在 TOOL CONTRACT 面板点击唯一故障注入点。</small>
        ) : (
          <small>Run 已以可核验结果停止。</small>
        )}
      </div>
    </LabFrame>
  );
}
