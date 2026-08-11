import { useMemo, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";
import {
  approvalCheckpointEvidence,
  buildRoute,
  expectedPrediction,
  initialConfig,
  predictionLabels,
  statusLabels,
  type ApprovalDecision,
  type BoundaryConfig,
  type Prediction,
  type RuntimeOutcome,
  type RuntimePhase,
} from "./boundaryRuntime";

const permissionOptions = [
  {
    value: "preview-only" as const,
    label: "仅预览",
    detail: "可读取目标集合，不可批量写入",
  },
  {
    value: "batch-write" as const,
    label: "允许批量写入",
    detail: "可对 inactive-90d 集合执行停用",
  },
];

const approvalOptions = [
  {
    value: "required" as const,
    label: "必须审批",
    detail: "运营负责人批准后才继续",
  },
  {
    value: "not-required" as const,
    label: "无需审批",
    detail: "权限通过后直接进入执行",
  },
];

const timeoutOptions = [
  {
    value: "four-seconds" as const,
    label: "4 秒",
    detail: "两批约需 6 秒，运行会中断",
  },
  {
    value: "ten-seconds" as const,
    label: "10 秒",
    detail: "足以完成两批写入与回读",
  },
];

const checkpointOptions = [
  {
    value: "enabled" as const,
    label: "保存检查点",
    detail: "记录目标快照、审批凭证与批次游标",
  },
  {
    value: "disabled" as const,
    label: "不保存",
    detail: "中断后需要先人工确认处理位置",
  },
];

const predictionOptions: Array<{ value: Prediction; label: string }> = [
  { value: "blocked", label: predictionLabels.blocked },
  { value: "approval", label: predictionLabels.approval },
  { value: "timeout", label: predictionLabels.timeout },
  { value: "completed", label: predictionLabels.completed },
];

const phaseLabels: Record<RuntimePhase, string> = {
  configure: "等待预测",
  approval: "等待审批",
  recover: "可从检查点恢复",
  final: "本次运行结束",
};

const outcomeCopy: Record<
  RuntimeOutcome,
  { title: string; summary: string }
> = {
  blocked: {
    title: "动作被权限阻止",
    summary: "批量写入没有发生；Harness 保留了模型建议与拒绝原因。",
  },
  approval: {
    title: "运行已暂停，等待审批",
    summary: "权限允许这个动作，但审批条件还没有满足。",
  },
  rejected: {
    title: "审批拒绝，运行停止",
    summary: "Host 没有执行写入；审批决定被记录为终止证据。",
  },
  "timed-out-recoverable": {
    title: "执行超时，但恢复位置明确",
    summary: "第一批已经回读确认；检查点表明第二批尚未开始。",
  },
  "timed-out-unknown": {
    title: "执行超时，处理位置不可信",
    summary: "没有批次游标可以证明进度；此时应先对账，而不是直接重跑。",
  },
  completed: {
    title: "执行完成，并已回读核验",
    summary: "286 个目标账号均完成停用，核验结果与目标快照一致。",
  },
  recovered: {
    title: "从检查点恢复后完成",
    summary: "恢复运行只处理剩余批次；286 个账号最终都已回读核验。",
  },
};

const evidenceCopy: Record<Prediction, string> = {
  blocked: "权限范围是 preview-only，它在任何审批或执行之前就阻断了批量写入。",
  approval: "批量写入权限已经通过，但 approval=required 让运行停在人工决定之前。",
  timeout: "写入权限通过且无需审批，但 4 秒预算小于两批约 6 秒的执行时间。",
  completed: "写入权限通过、无需审批，10 秒预算覆盖两批执行与回读核验。",
};

function focusNext(ref: React.RefObject<HTMLElement | null>) {
  requestAnimationFrame(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ block: "nearest" });
  });
}

export function BoundaryRouteLab() {
  const [config, setConfig] = useState<BoundaryConfig>(initialConfig);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [phase, setPhase] = useState<RuntimePhase>("configure");
  const [outcome, setOutcome] = useState<RuntimeOutcome | null>(null);
  const [approvalDecision, setApprovalDecision] =
    useState<ApprovalDecision | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const configureHeadingRef = useRef<HTMLHeadingElement>(null);

  const expected = expectedPrediction(config);
  const route = useMemo(
    () => buildRoute(config, phase, outcome),
    [config, outcome, phase],
  );
  const hasChanged =
    prediction !== null ||
    Object.entries(initialConfig).some(
      ([key, value]) => config[key as keyof BoundaryConfig] !== value,
    );
  const predictionIsCorrect = prediction === expected;

  function updateConfig<Key extends keyof BoundaryConfig>(
    key: Key,
    value: BoundaryConfig[Key],
  ) {
    if (phase !== "configure") return;
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function runConfiguredPath() {
    if (!prediction) return;

    if (expected === "blocked") {
      setOutcome("blocked");
      setPhase("final");
    } else if (expected === "approval") {
      setOutcome("approval");
      setPhase("approval");
    } else if (expected === "timeout") {
      const timedOutOutcome =
        config.checkpoint === "enabled"
          ? "timed-out-recoverable"
          : "timed-out-unknown";
      setOutcome(timedOutOutcome);
      setPhase(config.checkpoint === "enabled" ? "recover" : "final");
    } else {
      setOutcome("completed");
      setPhase("final");
    }

    focusNext(resultHeadingRef);
  }

  function submitApproval() {
    if (!approvalDecision) return;

    if (approvalDecision === "reject") {
      setOutcome("rejected");
      setPhase("final");
    } else if (config.timeout === "four-seconds") {
      const timedOutOutcome =
        config.checkpoint === "enabled"
          ? "timed-out-recoverable"
          : "timed-out-unknown";
      setOutcome(timedOutOutcome);
      setPhase(config.checkpoint === "enabled" ? "recover" : "final");
    } else {
      setOutcome("completed");
      setPhase("final");
    }

    focusNext(resultHeadingRef);
  }

  function recoverFromCheckpoint() {
    setOutcome("recovered");
    setPhase("final");
    focusNext(resultHeadingRef);
  }

  function reset() {
    setConfig(initialConfig);
    setPrediction(null);
    setPhase("configure");
    setOutcome(null);
    setApprovalDecision(null);
    focusNext(configureHeadingRef);
  }

  const currentCopy = outcome ? outcomeCopy[outcome] : null;

  return (
    <LabFrame
      className="harness-boundaries-lab"
      eyebrow="BOUNDARY ROUTE LAB · RUN 001"
      status={
        <span className={`harness-boundaries-lab-status is-${phase}`}>
          {phaseLabels[phase]}
        </span>
      }
      title="同一个动作，会走向哪种运行状态？"
    >
      <div className="harness-boundaries-action-brief">
        <div>
          <span>模型建议</span>
          <strong>停用 286 个连续 90 天未登录的试用账号</strong>
        </div>
        <dl>
          <div>
            <dt>风险</dt>
            <dd>批量修改外部账号状态</dd>
          </div>
          <div>
            <dt>工具耗时</dt>
            <dd>2 批 × 约 3 秒</dd>
          </div>
          <div>
            <dt>完成证据</dt>
            <dd>写入结果 + 回读状态</dd>
          </div>
        </dl>
      </div>

      <ol
        aria-label="动作从模型建议开始，依次经过权限、审批、检查点、执行与恢复"
        className="harness-boundaries-route"
      >
        {route.map((stage) => (
          <li
            className={`harness-boundaries-route-stage is-${stage.status}`}
            key={stage.id}
          >
            <div className="harness-boundaries-route-stage-heading">
              <span>{stage.eyebrow}</span>
              <small>{statusLabels[stage.status]}</small>
            </div>
            <strong>{stage.title}</strong>
            <p>{stage.detail}</p>
          </li>
        ))}
      </ol>

      {phase === "configure" ? (
        <form
          className="harness-boundaries-configurator"
          onSubmit={(event) => {
            event.preventDefault();
            runConfiguredPath();
          }}
        >
          <div className="harness-boundaries-config-heading">
            <div>
              <span>CONFIGURE</span>
              <h4 ref={configureHeadingRef} tabIndex={-1}>
                先配置边界，再预测路径
              </h4>
            </div>
            <p>每个选项都会改变动作能否继续、停在哪里，以及中断后是否可恢复。</p>
          </div>

          <div className="harness-boundaries-config-grid">
            <BoundaryChoice
              label="01 · 权限范围"
              name="permission"
              onChange={(value) => updateConfig("permission", value)}
              options={permissionOptions}
              value={config.permission}
            />
            <BoundaryChoice
              label="02 · 审批条件"
              name="approval"
              onChange={(value) => updateConfig("approval", value)}
              options={approvalOptions}
              value={config.approval}
            />
            <BoundaryChoice
              label="03 · 运行超时"
              name="timeout"
              onChange={(value) => updateConfig("timeout", value)}
              options={timeoutOptions}
              value={config.timeout}
            />
            <BoundaryChoice
              label="04 · 检查点"
              name="checkpoint"
              onChange={(value) => updateConfig("checkpoint", value)}
              options={checkpointOptions}
              value={config.checkpoint}
            />
          </div>

          <fieldset className="harness-boundaries-prediction">
            <legend>在揭晓前预测：这次运行首先会在哪里改变路径？</legend>
            <div>
              {predictionOptions.map((option) => (
                <label key={option.value}>
                  <input
                    checked={prediction === option.value}
                    name="prediction"
                    onChange={() => setPrediction(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="harness-boundaries-actions">
            <button
              className="button button-ghost-dark"
              disabled={!hasChanged}
              onClick={reset}
              type="button"
            >
              ↺ 恢复初始配置
            </button>
            <button
              className="button button-light"
              disabled={!prediction}
              type="submit"
            >
              锁定预测并运行 →
            </button>
          </div>
        </form>
      ) : (
        <div className="harness-boundaries-result">
          <div
            aria-atomic="true"
            aria-live="polite"
            className="harness-boundaries-result-summary"
            role="status"
          >
            <span>{phase === "approval" ? "PAUSED" : phase === "recover" ? "INTERRUPTED" : "RESULT"}</span>
            <h4 ref={resultHeadingRef} tabIndex={-1}>
              {currentCopy?.title}
            </h4>
            <p>{currentCopy?.summary}</p>
          </div>

          <div
            className={`harness-boundaries-prediction-feedback ${
              predictionIsCorrect ? "is-correct" : "is-different"
            }`}
          >
            <div>
              <strong>
                {predictionIsCorrect ? "预测命中" : "预测与路径不同"}
              </strong>
              <span>
                你预测：{prediction ? predictionLabels[prediction] : "—"}
              </span>
              <span>首个路径变化：{predictionLabels[expected]}</span>
            </div>
            <p>
              <b>改变结果的证据：</b>
              {evidenceCopy[expected]}
            </p>
          </div>

          {phase === "approval" ? (
            <form
              className="harness-boundaries-decision"
              onSubmit={(event) => {
                event.preventDefault();
                submitApproval();
              }}
            >
              <fieldset>
                <legend>审批人只能基于本次目标快照作出一个决定</legend>
                <div>
                  <label>
                    <input
                      checked={approvalDecision === "approve"}
                      name="approval-decision"
                      onChange={() => setApprovalDecision("approve")}
                      type="radio"
                    />
                    <span>
                      <strong>批准本次动作</strong>
                      绑定目标快照与审批凭证后继续
                    </span>
                  </label>
                  <label>
                    <input
                      checked={approvalDecision === "reject"}
                      name="approval-decision"
                      onChange={() => setApprovalDecision("reject")}
                      type="radio"
                    />
                    <span>
                      <strong>拒绝并停止</strong>
                      不执行写入，保留拒绝原因
                    </span>
                  </label>
                </div>
              </fieldset>
              <div className="harness-boundaries-actions">
                <button
                  className="button button-ghost-dark"
                  onClick={reset}
                  type="button"
                >
                  ↺ 重置实验
                </button>
                <button
                  className="button button-light"
                  disabled={!approvalDecision}
                  type="submit"
                >
                  提交审批决定 →
                </button>
              </div>
            </form>
          ) : null}

          {phase === "recover" ? (
            <div className="harness-boundaries-recovery-action">
              <div>
                <span>恢复依据</span>
                <strong>{`目标快照 v1 · ${approvalCheckpointEvidence(config)} · 批次游标 1/2`}</strong>
                <p>恢复运行只处理剩余 143 个账号，并再次回读全部目标状态。</p>
              </div>
              <div className="harness-boundaries-actions">
                <button
                  className="button button-ghost-dark"
                  onClick={reset}
                  type="button"
                >
                  ↺ 重置实验
                </button>
                <button
                  className="button button-light"
                  onClick={recoverFromCheckpoint}
                  type="button"
                >
                  从检查点恢复 →
                </button>
              </div>
            </div>
          ) : null}

          {phase === "final" ? (
            <div className="harness-boundaries-final-action">
              <p>
                想观察另一条路径？修改任一保护条件，再预测一次。动作不变，运行结果会变。
              </p>
              <button
                className="button button-light"
                onClick={reset}
                type="button"
              >
                ↺ 重新配置边界
              </button>
            </div>
          ) : null}
        </div>
      )}
    </LabFrame>
  );
}

function BoundaryChoice<Value extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: Value;
  options: ReadonlyArray<{ value: Value; label: string; detail: string }>;
  onChange: (value: Value) => void;
}) {
  return (
    <fieldset className="harness-boundaries-choice">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option.value}>
            <input
              checked={value === option.value}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
