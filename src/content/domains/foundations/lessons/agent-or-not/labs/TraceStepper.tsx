import {
  AgentLoopPlayer,
  type AgentLoopScenario,
} from "./AgentLoopPlayer";

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
      detail: "结论必须有证据，但用户没有预先写死查询顺序。",
    },
    {
      id: "r1-decide",
      phase: "decide",
      round: 1,
      actor: "Model",
      summary: "先比较各渠道退款率",
      detail: "先定位异常集中在哪个渠道，再决定往哪里查。",
    },
    {
      id: "r1-act",
      phase: "act",
      round: 1,
      actor: "Host",
      summary: "执行退款数据查询",
      detail: "Host 校验数据权限与范围后，调用内部数据工具。",
    },
    {
      id: "r1-observe",
      phase: "observe",
      round: 1,
      actor: "Tool",
      summary: "渠道 P 从 7.4% 升至 12.9%",
      detail: "工具结果写回运行状态，下一步拥有了新的环境证据。",
    },
    {
      id: "r1-evaluate",
      phase: "evaluate",
      round: 1,
      actor: "Verifier",
      summary: "范围缩小了，但证据还不够",
      detail: "只能确认异常集中在渠道 P，还不能解释为什么上涨。",
    },
    {
      id: "r2-decide",
      phase: "decide",
      round: 2,
      actor: "Model",
      summary: "观察改变路线：检查渠道 P 的近期变更",
      detail: "流程沿回边返回决策，不再泛查所有可能原因。",
    },
    {
      id: "r2-act",
      phase: "act",
      round: 2,
      actor: "Host",
      summary: "读取版本记录与支付错误码",
      detail: "Host 再次检查范围与权限后执行新的查询。",
    },
    {
      id: "r2-observe",
      phase: "observe",
      round: 2,
      actor: "Tool",
      summary: "SDK 升级、超时错误与回滚样本对齐",
      detail: "升级后超时集中出现，小流量回滚样本恢复到基线。",
    },
    {
      id: "r2-evaluate",
      phase: "evaluate",
      round: 2,
      actor: "Verifier",
      summary: "证据达到预设完成标准",
      detail: "时间、错误码与对照样本相互支持，仍保留未排除因素。",
    },
    {
      id: "r3-decide",
      phase: "decide",
      round: 3,
      actor: "Model",
      summary: "选择停止调查并整理结论",
      detail: "完成标准已满足，下一步不再调用工具，而是退出循环。",
    },
    {
      id: "complete",
      phase: "complete",
      round: 3,
      actor: "Host",
      summary: "交付证据、结论与不确定项",
      detail: "结论指向支付 SDK 升级，并附上证据来源与边界。",
    },
  ],
};

export function TraceStepper() {
  return <AgentLoopPlayer scenario={refundInvestigation} />;
}
