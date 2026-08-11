import { useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type CheckpointState = "present" | "missing";

const checkpointOptions: readonly {
  value: CheckpointState;
  title: string;
  description: string;
}[] = [
  {
    value: "present",
    title: "保存检查点",
    description: "目标快照、审批凭证、批次游标",
  },
  {
    value: "missing",
    title: "不保存检查点",
    description: "只保留超时错误",
  },
];

export function BoundaryRouteLab() {
  const [checkpoint, setCheckpoint] = useState<CheckpointState | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const canResume = checkpoint === "present";

  function focusResult() {
    requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function run() {
    if (!checkpoint) return;
    setHasRun(true);
    focusResult();
  }

  function compareOtherPath() {
    setCheckpoint(canResume ? "missing" : "present");
    setHasRun(true);
    focusResult();
  }

  function reset() {
    setCheckpoint(null);
    setHasRun(false);
    requestAnimationFrame(() => firstChoiceRef.current?.focus({ preventScroll: true }));
  }

  const finalState = !hasRun
    ? "等待运行"
    : canResume
      ? "RESUMABLE"
      : "BLOCKED";

  return (
    <LabFrame
      className="harness-recovery-lab"
      eyebrow="INTERRUPTION TIMELINE · RUN 001"
      status={
        <span className={`harness-recovery-status is-${hasRun ? finalState.toLowerCase() : "ready"}`}>
          {finalState}
        </span>
      }
      title="同一次超时，会从哪里继续？"
    >
      <div className="harness-recovery-brief">
        <div>
          <span>目标</span>
          <strong>停用 286 个目标账号</strong>
        </div>
        <dl>
          <div>
            <dt>已批准</dt>
            <dd>snapshot A-204</dd>
          </div>
          <div>
            <dt>执行计划</dt>
            <dd>2 批 × 143</dd>
          </div>
          <div>
            <dt>时间预算</dt>
            <dd>4 秒，必然中断</dd>
          </div>
        </dl>
      </div>

      <ol
        aria-label="运行从授权通过开始，经过检查点、第一批写入请求和超时，最后进入可恢复或人工移交状态"
        className="harness-recovery-timeline"
      >
        <li className="is-passed">
          <span>01</span>
          <div>
            <small>授权与审批</small>
            <strong>A-204 已通过</strong>
            <p>目标范围固定为 286 个账号。</p>
          </div>
        </li>
        <li className={checkpoint ? "is-selected" : "is-waiting"}>
          <span>02</span>
          <div>
            <small>执行前状态</small>
            <strong>
              {checkpoint === "present"
                ? "cursor=0/2 已保存"
                : checkpoint === "missing"
                  ? "未保存批次游标"
                  : "等待检查点选择"}
            </strong>
            <p>检查点决定中断后能否定位剩余工作。</p>
          </div>
        </li>
        <li
          className={
            hasRun ? (canResume ? "is-passed" : "is-uncertain") : "is-waiting"
          }
        >
          <span>03</span>
          <div>
            <small>外部写入</small>
            <strong>
              {!hasRun
                ? "第一批尚未执行"
                : canResume
                  ? "第一批 143 个已停用并回读"
                  : "第一批写入请求已发出，提交数未知"}
            </strong>
            <p>
              {!hasRun || canResume
                ? "写入发生在外部系统，不能靠重置界面撤销。"
                : "没有检查点与回读，Harness 不能证明外部系统已提交多少。"}
            </p>
          </div>
        </li>
        <li className={hasRun ? "is-interrupted" : "is-waiting"}>
          <span>04</span>
          <div>
            <small>运行边界</small>
            <strong>{hasRun ? "TIMEOUT · 4.0s" : "等待时间预算耗尽"}</strong>
            <p>
              {!hasRun
                ? "Harness 会在时间预算耗尽时停止继续写入。"
                : canResume
                  ? "回读与游标证明运行在第二批开始前被中断。"
                  : "只有超时错误，无法证明中断发生在第几批的哪个位置。"}
            </p>
          </div>
        </li>
        <li
          className={
            !hasRun
              ? "is-waiting"
              : canResume
                ? "is-resumable"
                : "is-blocked"
          }
        >
          <span>05</span>
          <div>
            <small>下一状态</small>
            <strong>
              {!hasRun
                ? "等待中断证据"
                : canResume
                  ? "cursor=1/2 → 从第二批恢复"
                  : "cursor=unknown → 人工对账"}
            </strong>
            <p>
              {!hasRun
                ? "只有中断发生后，恢复路径才会形成。"
                : canResume
                  ? "先回读第一批，再处理剩余 143 个；当前状态是可恢复，不是已完成。"
                  : "直接重跑可能重复第一批，必须先核对外部事实。"}
            </p>
          </div>
        </li>
      </ol>

      {!hasRun ? (
        <div className="harness-recovery-decision">
          <div>
            <span>只改变一个条件</span>
            <strong>执行前是否保存检查点？</strong>
          </div>
          <div aria-label="选择是否保存检查点" className="harness-recovery-choices" role="group">
            {checkpointOptions.map((option) => (
              <button
                aria-pressed={checkpoint === option.value}
                className={checkpoint === option.value ? "is-selected" : ""}
                key={option.value}
                onClick={() => setCheckpoint(option.value)}
                ref={option.value === "present" ? firstChoiceRef : undefined}
                type="button"
              >
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
          <button
            className="button button-light"
            disabled={!checkpoint}
            onClick={run}
            type="button"
          >
            执行到超时 →
          </button>
        </div>
      ) : (
        <div className={`harness-recovery-result ${canResume ? "is-resumable" : "is-blocked"}`}>
          <div>
            <span>INTERRUPTED → {finalState}</span>
            <h4 ref={resultRef} tabIndex={-1}>
              {canResume ? "恢复位置可以被证明" : "恢复位置无法被证明"}
            </h4>
            <p>
              {canResume
                ? "证据：snapshot=A-204 · cursor=1/2 · readback=143 · remaining=143"
                : "证据缺口：cursor=unknown · committed_count=unknown · safe_retry=false"}
            </p>
          </div>
          <div className="harness-recovery-result-actions">
            <button className="button button-secondary" onClick={reset} type="button">
              ↺ 重置
            </button>
            <button className="button button-light" onClick={compareOtherPath} type="button">
              看另一条恢复路径 →
            </button>
          </div>
        </div>
      )}
    </LabFrame>
  );
}
