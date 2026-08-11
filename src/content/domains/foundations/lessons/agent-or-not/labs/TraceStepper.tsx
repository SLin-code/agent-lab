import {
  MinimalRunExperiment,
  type MinimalRunExperimentSpec,
} from "@/components/lab/MinimalRunExperiment";

type Controller = "workflow" | "agent";

const experiment = {
  eyebrow: "MINIMAL AGENT RUN",
  title: "只改变下一步的控制者",
  goal: {
    title: "找出退款率上涨原因",
    detail: "完成标准：结论必须引用可核验的数据，而不是只列出可能原因。",
  },
  see: {
    title: "本周退款率 8.1% → 11.6%",
    detail: "当前只有整体变化，还不知道异常集中在哪里，也不知道由什么造成。",
  },
  decision: {
    title: "谁来决定下一步？",
    detail: "只改变控制者，观察同一目标会怎样走向不同路径。",
    groupLabel: "选择下一步的控制者",
    actionLabel: "运行这个决定 →",
    alternateLabel: "换另一种控制者 →",
  },
  outcomes: [
    {
      value: "workflow",
      choice: {
        title: "代码按固定流程",
        description: "不根据新观察改路线",
      },
      decide: {
        title: "代码执行预先写好的下一步",
        detail: "固定流程不读取新的环境状态，直接进入通用原因摘要。",
      },
      act: {
        title: "生成通用原因摘要",
        detail: "系统按固定模板列出质量、物流、促销和支付等可能原因。",
      },
      observe: {
        title: "得到一组可能原因",
        detail: "文本听起来合理，却没有新增任何能够改变判断的环境证据。",
      },
      control: {
        title: "停止：固定流程已经结束",
        detail: "路径没有因为观察而改变。它可以自动化，但仍是预设 Workflow。",
      },
      evidence: "证据：没有新增环境观察 → 路径按预设步骤结束",
    },
    {
      value: "agent",
      choice: {
        title: "模型根据观察选择",
        description: "新证据可以改变下一步",
      },
      decide: {
        title: "模型根据当前观察选择查询",
        detail: "控制策略允许模型先查各渠道退款率，再根据结果重新选择行动。",
      },
      act: {
        title: "查询各渠道退款率",
        detail: "Host 执行数据查询，把真实结果写回本次 Run。",
      },
      observe: {
        title: "渠道 P 退款率升至 12.9%",
        detail: "新证据把调查范围缩小到渠道 P，但还没有解释原因。",
      },
      control: {
        title: "继续：检查渠道 P 的近期变更",
        detail: "观察改变了下一步，系统进入第二轮；这才形成反馈循环。",
      },
      evidence: "证据：观察到渠道 P 异常 → 下一步改为检查该渠道变更",
    },
  ],
} satisfies MinimalRunExperimentSpec<Controller>;

export function TraceStepper() {
  return <MinimalRunExperiment spec={experiment} />;
}
