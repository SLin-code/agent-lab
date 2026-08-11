import {
  MinimalRunExperiment,
  type MinimalRunExperimentSpec,
} from "@/components/lab/MinimalRunExperiment";

type CheckpointState = "present" | "missing";

const experiment = {
  eyebrow: "HARNESS RECOVERY RUN",
  title: "只改变检查点",
  goal: {
    title: "让 286 个账号的停用任务在超时后可安全恢复",
    detail: "完成标准：中断后能证明已完成的 143 个、剩余的 143 个，以及下一次应从哪里继续。",
  },
  see: {
    title: "权限与审批已通过，预算只有 4 秒",
    detail: "目标快照 A-204 已批准；唯一会改变的条件是是否保存批次检查点。",
  },
  decision: {
    title: "执行前保存检查点吗？",
    detail: "只改变检查点，观察同一次超时能否安全恢复。",
    groupLabel: "选择是否保存检查点",
    actionLabel: "执行第一批 →",
    alternateLabel: "换另一种检查点 →",
  },
  outcomes: [
    {
      value: "present",
      choice: {
        title: "保存检查点",
        description: "目标快照、审批凭证、批次游标",
      },
      decide: {
        title: "保存目标快照与批次游标",
        detail: "Harness 记录 snapshot=A-204、cursor=0/2 与审批凭证。",
      },
      act: {
        title: "Host 停用第一批 143 个账号",
        detail: "第一批写入完成后，运行在进入第二批前触发 4 秒超时。",
      },
      observe: {
        title: "INTERRUPTED · cursor=1/2",
        detail: "回读确认第一批 143 个已停用；检查点与环境事实一致。",
      },
      control: {
        title: "可恢复：从第二批继续",
        detail: "状态进入 RESUMABLE，而不是已完成；下一次 Run 先核验第一批，再执行剩余 143 个。",
      },
      evidence: "恢复证据：status=RESUMABLE · snapshot=A-204 · cursor=1/2 · remaining=143",
    },
    {
      value: "missing",
      choice: {
        title: "不保存检查点",
        description: "只保留超时错误",
      },
      decide: {
        title: "不保存可恢复游标",
        detail: "Harness 只启动执行，不记录已经处理到哪一批。",
      },
      act: {
        title: "Host 停用第一批 143 个账号",
        detail: "第一批写入完成后，运行在进入第二批前触发 4 秒超时。",
      },
      observe: {
        title: "INTERRUPTED · cursor=unknown",
        detail: "外部系统已有写入，但 Harness 无法判断第一批是否完整处理。",
      },
      control: {
        title: "停止：移交人工对账",
        detail: "直接重跑可能重复第一批；必须先人工核对外部状态再决定补偿或继续。",
      },
      evidence: "证据缺口：status=BLOCKED · cursor=unknown · external writes exist → handoff",
    },
  ],
} satisfies MinimalRunExperimentSpec<CheckpointState>;

export function BoundaryRouteLab() {
  return <MinimalRunExperiment spec={experiment} />;
}
