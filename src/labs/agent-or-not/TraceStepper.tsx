import {
  AgentLoopPlayer,
  type AgentLoopScenario,
} from "../shared/AgentLoopPlayer";

const refundInvestigation: AgentLoopScenario = {
  eyebrow: "INTERACTIVE AGENT LOOP · TRACE 001",
  title: "退款异常调查",
  objective: "找出本周退款率上升的原因，并给出可核验的结论。",
  events: [
    {
      id: "goal",
      phase: "goal",
      round: 0,
      actor: "User",
      summary: "定义目标与完成标准",
      detail: "用户要求结论必须有证据，但没有写死查询顺序。",
    },
    {
      id: "r1-decide",
      phase: "decide",
      round: 1,
      actor: "Model",
      summary: "先比较各渠道退款率",
      detail: "决策摘要：先定位异常集中在哪个渠道，再决定往哪里查。",
    },
    {
      id: "r1-act",
      phase: "act",
      round: 1,
      actor: "Host",
      summary: "执行退款数据查询",
      detail: "Host 校验数据权限和查询范围后，才调用内部数据工具。",
    },
    {
      id: "r1-observe",
      phase: "observe",
      round: 1,
      actor: "Tool",
      summary: "渠道 P 从 7.4% 升至 12.9%",
      detail: "工具结果写回运行状态，后续决策开始拥有新的证据。",
    },
    {
      id: "r1-revise",
      phase: "revise",
      round: 1,
      actor: "Verifier",
      summary: "范围缩小了，但证据还不够",
      detail: "当前只能确认异常集中在渠道 P，尚不能说明为什么上涨。",
    },
    {
      id: "r2-decide",
      phase: "decide",
      round: 2,
      actor: "Model",
      summary: "改查版本变更、错误码与对照样本",
      detail: "上一轮观察改变了行动路线：不再泛查所有可能原因。",
    },
    {
      id: "r2-act",
      phase: "act",
      round: 2,
      actor: "Host",
      summary: "执行版本与错误码查询",
      detail: "Host 再次检查范围与权限，并读取发布记录和支付错误日志。",
    },
    {
      id: "r2-observe",
      phase: "observe",
      round: 2,
      actor: "Tool",
      summary: "升级、超时错误与回滚样本对齐",
      detail: "SDK 升级后支付超时集中出现；小流量回滚样本恢复到基线。",
    },
    {
      id: "r2-revise",
      phase: "revise",
      round: 2,
      actor: "Verifier",
      summary: "证据达到预设标准",
      detail: "时间、错误码和对照样本相互支持，同时保留未排除的次要因素。",
    },
    {
      id: "r3-decide",
      phase: "decide",
      round: 3,
      actor: "Model",
      summary: "选择停止调查并整理结论",
      detail: "完成标准已满足，下一步不再调用工具，而是交付可核验报告。",
    },
    {
      id: "complete",
      phase: "complete",
      round: 3,
      actor: "Host",
      summary: "交付证据、结论与不确定项",
      detail: "运行退出循环；结论指向支付 SDK 升级，并附上证据来源和边界。",
    },
  ],
};

export function TraceStepper() {
  return <AgentLoopPlayer scenario={refundInvestigation} />;
}
