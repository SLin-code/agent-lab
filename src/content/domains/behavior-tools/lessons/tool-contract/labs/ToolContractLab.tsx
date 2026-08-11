import {
  MinimalRunExperiment,
  type MinimalRunExperimentSpec,
} from "@/components/lab/MinimalRunExperiment";

type ApprovalEvidence = "missing" | "present";

const experiment = {
  eyebrow: "TOOL ACTION RUN",
  title: "只改变审批证据",
  goal: {
    title: "发放 ¥300 优惠金，且只发生一次",
    detail: "完成标准：外部余额增加 ¥300，并留下交易号与 operationId。",
  },
  see: {
    title: "grant_credit(amount=300)",
    detail: "输入 Schema 已通过；调用者是客服 bot，直接执行上限为 ¥200。",
  },
  decision: {
    title: "Host 看到了审批证据吗？",
    detail: "只改变审批证据，观察同一工具调用是否会产生副作用。",
    groupLabel: "选择 Host 可见的审批证据",
    actionLabel: "让 Host 判断 →",
    alternateLabel: "换另一份审批证据 →",
  },
  outcomes: [
    {
      value: "missing",
      choice: {
        title: "没有审批记录",
        description: "只有模型给出的工具参数",
      },
      decide: {
        title: "没有可核验的主管审批",
        detail: "金额超过直接执行上限。Host 必须拒绝，而不是相信模型的成功文本。",
      },
      act: {
        title: "Host 拒绝执行",
        detail: "Host 未执行工具，没有外部写入、交易号或余额变化。",
      },
      observe: {
        title: "余额仍为 120",
        detail: "零写入与拒绝原因共同证明不安全请求被边界拦住。",
      },
      control: {
        title: "停止：等待新的审批证据",
        detail: "补齐审批后可以开启新的 Run；当前 Run 不产生副作用。",
      },
      evidence: "拒绝证据：approval missing · tool_write_count=0 · balance=120",
    },
    {
      value: "present",
      choice: {
        title: "审批 A-17 已绑定",
        description: "金额、请求与审批人可核验",
      },
      decide: {
        title: "审批 A-17 与请求快照匹配",
        detail: "权限门放行：审批人、金额与 operationId 都能对应当前请求。",
      },
      act: {
        title: "Host 调用 grant_credit 一次",
        detail: "应用代码携带 operationId=case-7781 执行真实写入。",
      },
      observe: {
        title: "txn-8842 · 余额 120 → 420",
        detail: "交易号和余额差值共同证明副作用发生了一次。",
      },
      control: {
        title: "停止：动作已完成并核验",
        detail: "operationId 已记录；相同请求重放时返回原回执，不再次写入。",
      },
      evidence: "执行证据：approval A-17 · txn-8842 · balance 120→420 · write_count=1",
    },
  ],
} satisfies MinimalRunExperimentSpec<ApprovalEvidence>;

export function ToolContractLab() {
  return <MinimalRunExperiment spec={experiment} />;
}
