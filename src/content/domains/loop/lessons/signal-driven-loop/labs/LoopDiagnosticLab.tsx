import { useEffect, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type BoundaryEvidence = "present" | "missing";
type Decision = "RETRY" | "REPAIR" | "STOP" | "ESCALATE";

interface DiagnosticBeat {
  id: string;
  attempt: string;
  action: string;
  observation: string;
  evaluation: string;
  decision: Decision;
  decisionNote: string;
}

const fixedBeats: readonly DiagnosticBeat[] = [
  {
    id: "transient",
    attempt: "ATTEMPT 01",
    action: "提交 100 人通知批次",
    observation: "503 · Retry-After=2s · write_count=0",
    evaluation: "失败是瞬时的；外部回读证明没有发送；还剩 2 次预算。",
    decision: "RETRY",
    decisionNote: "动作不变，等待 2 秒后再试",
  },
  {
    id: "repair",
    attempt: "ATTEMPT 02",
    action: "按同一 operationId 重放请求",
    observation: "422 · required_footer=missing · write_count=0",
    evaluation: "同样输入会确定性失败；错误指出一个可修正字段。",
    decision: "REPAIR",
    decisionNote: "补上退订说明，再生成候选动作",
  },
];

const terminalBeats: Record<BoundaryEvidence, DiagnosticBeat> = {
  present: {
    id: "stop",
    attempt: "ATTEMPT 03",
    action: "提交已修复内容，审批 A-42 与快照匹配",
    observation: "accepted=100 · receipt=msg-8041 · duplicate=0",
    evaluation: "环境回读覆盖 100 个目标，完成标准已经满足。",
    decision: "STOP",
    decisionNote: "关闭 Run；继续发送会制造重复副作用",
  },
  missing: {
    id: "escalate",
    attempt: "ATTEMPT 03",
    action: "已修复内容等待发送；Host 尚未执行",
    observation: "required_approval=missing · write_count=0",
    evaluation: "内容已修好，但 Agent 无权补造审批；更多重试不会改变边界。",
    decision: "ESCALATE",
    decisionNote: "保存修复结果与证据，移交审批人",
  },
};

const decisionClass: Record<Decision, string> = {
  RETRY: "is-retry",
  REPAIR: "is-repair",
  STOP: "is-stop",
  ESCALATE: "is-escalate",
};

export function LoopDiagnosticLab() {
  const [revealed, setRevealed] = useState(0);
  const [boundaryEvidence, setBoundaryEvidence] =
    useState<BoundaryEvidence | null>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const firstBoundaryRef = useRef<HTMLButtonElement>(null);
  const diagnosisRef = useRef<HTMLDivElement>(null);

  const visibleBeats = [
    ...fixedBeats.slice(0, revealed),
    ...(boundaryEvidence ? [terminalBeats[boundaryEvidence]] : []),
  ];
  const waitingForBoundary = revealed === fixedBeats.length && !boundaryEvidence;
  const terminalBeat = boundaryEvidence ? terminalBeats[boundaryEvidence] : null;

  useEffect(() => {
    if (!waitingForBoundary) return;
    requestAnimationFrame(() =>
      firstBoundaryRef.current?.focus({ preventScroll: true }),
    );
  }, [waitingForBoundary]);

  useEffect(() => {
    if (!boundaryEvidence) return;
    requestAnimationFrame(() =>
      diagnosisRef.current?.focus({ preventScroll: true }),
    );
  }, [boundaryEvidence]);

  const status = terminalBeat
    ? terminalBeat.decision
    : waitingForBoundary
      ? "EVALUATE BOUNDARY"
      : revealed === 0
        ? "READY"
        : `BEAT ${revealed} / 3`;

  function revealNext() {
    setRevealed((current) => Math.min(current + 1, fixedBeats.length));
  }

  function chooseBoundary(nextEvidence: BoundaryEvidence) {
    setBoundaryEvidence(nextEvidence);
  }

  function compareOtherBranch() {
    setBoundaryEvidence((current) => (current === "present" ? "missing" : "present"));
  }

  function reset() {
    setRevealed(0);
    setBoundaryEvidence(null);
    requestAnimationFrame(() => startRef.current?.focus({ preventScroll: true }));
  }

  const currentBeat = visibleBeats.at(-1);

  return (
    <LabFrame
      className="sdl-diagnostic-lab"
      eyebrow="LOOP DIAGNOSTIC"
      status={<span className="trace-status">{status}</span>}
      title="100 人通知任务 · 逐拍读信号"
    >
      <div className="sdl-lab-goal">
        <span>GOAL / COMPLETE WHEN</span>
        <strong>100 个目标都被服务端接受，并且同一 operationId 没有重复发送。</strong>
      </div>

      <ol className="sdl-attempt-strip" aria-label="已揭示的循环诊断节拍">
        {[0, 1, 2].map((slot) => {
          const beat = visibleBeats[slot];
          const isCurrent = slot === visibleBeats.length - 1;
          return (
            <li
              className={[
                beat ? "is-revealed" : "is-pending",
                isCurrent && beat ? "is-current" : "",
              ].filter(Boolean).join(" ")}
              key={slot}
            >
              <span>{`0${slot + 1}`}</span>
              {beat ? (
                <>
                  <small>{beat.attempt}</small>
                  <strong className={decisionClass[beat.decision]}>{beat.decision}</strong>
                  <p>{beat.decisionNote}</p>
                </>
              ) : (
                <>
                  <small>FUTURE BEAT</small>
                  <strong>等待新观察</strong>
                  <p>未来步骤不预设决定</p>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div
        aria-atomic="true"
        aria-live="polite"
        className="sdl-current-diagnosis"
        ref={diagnosisRef}
        role="status"
        tabIndex={-1}
      >
        {currentBeat ? (
          <>
            <div><span>ACTION</span><p>{currentBeat.action}</p></div>
            <div><span>OBSERVE</span><p>{currentBeat.observation}</p></div>
            <div><span>EVALUATE</span><p>{currentBeat.evaluation}</p></div>
            <div className="is-decision">
              <span>DECIDE</span>
              <p><strong className={decisionClass[currentBeat.decision]}>{currentBeat.decision}</strong> · {currentBeat.decisionNote}</p>
            </div>
          </>
        ) : (
          <div className="sdl-diagnosis-empty">
            <span>READY</span>
            <p>第一拍会先执行动作，再用环境回读判断是否值得继续。</p>
          </div>
        )}
      </div>

      {waitingForBoundary ? (
        <fieldset className="sdl-boundary-choice">
          <legend>修复完成。Host 此刻看见哪条审批证据？</legend>
          <div>
            <button
              onClick={() => chooseBoundary("present")}
              ref={firstBoundaryRef}
              type="button"
            >
              <strong>审批 A-42 已绑定</strong>
              <small>授权目标与当前快照一致</small>
            </button>
            <button onClick={() => chooseBoundary("missing")} type="button">
              <strong>没有审批记录</strong>
              <small>Agent 不能自行补造权限</small>
            </button>
          </div>
        </fieldset>
      ) : null}

      <div className="sdl-lab-controls">
        {!terminalBeat && !waitingForBoundary ? (
          <button
            className="button button-light"
            onClick={revealNext}
            ref={startRef}
            type="button"
          >
            {revealed === 0 ? "读取第一拍 →" : "读取下一拍 →"}
          </button>
        ) : null}
        {terminalBeat ? (
          <button className="button button-light" onClick={compareOtherBranch} type="button">
            对照另一条边界证据 →
          </button>
        ) : null}
        {revealed > 0 || boundaryEvidence ? (
          <button className="button button-ghost-dark" onClick={reset} type="button">
            ↺ 从头重置
          </button>
        ) : null}
      </div>
    </LabFrame>
  );
}
