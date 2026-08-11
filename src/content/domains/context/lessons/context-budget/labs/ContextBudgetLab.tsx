import {
  MinimalRunExperiment,
  type MinimalRunExperimentSpec,
} from "@/components/lab/MinimalRunExperiment";

type FinalEvidence = "usage-ledger" | "customer-profile";

const experiment = {
  eyebrow: "CONTEXT RUN",
  title: "只替换最后一项证据",
  goal: {
    title: "判断这笔订阅能否自动退款",
    detail: "完成标准：现行规则的每个决定条件都有可核验的当前证据。",
  },
  see: {
    title: "还剩 1 个上下文位置",
    detail: "已知现行规则是“7 日内且未使用”，订单发生在 3 天前。现在只能再放一项证据。",
  },
  decision: {
    title: "最后一个位置放什么？",
    detail: "只替换这一项，观察上下文是否足以支持下一步。",
    groupLabel: "选择最后一项上下文证据",
    actionLabel: "用这份上下文运行 →",
    alternateLabel: "换另一项证据 →",
  },
  outcomes: [
    {
      value: "usage-ledger",
      choice: {
        title: "使用账本 · 1 格",
        description: "可核验是否已使用",
      },
      decide: {
        title: "放入使用账本",
        detail: "账本直接覆盖规则中的“是否使用”条件。",
      },
      act: {
        title: "组装：规则 + 时间 + 使用账本",
        detail: "模型只会看见被放入本轮工作视野的证据。",
      },
      observe: {
        title: "账本：已成功生成 3 次",
        detail: "规则条件已经覆盖完整：订单虽在 7 日内，但并非未使用。",
      },
      control: {
        title: "停止：拒绝自动退款，转人工解释",
        detail: "当前结论有规则、时间与使用事实共同支持，可以停止自动判断。",
      },
      evidence: "覆盖：现行规则 ✓ · 购买时间 ✓ · 使用情况 ✓ → 可以停止",
    },
    {
      value: "customer-profile",
      choice: {
        title: "客户画像 · 1 格",
        description: "信息真实，但不决定退款条件",
      },
      decide: {
        title: "放入客户画像",
        detail: "画像可能影响服务方式，但不能回答订阅是否已使用。",
      },
      act: {
        title: "组装：规则 + 时间 + 客户画像",
        detail: "模型只会看见被放入本轮工作视野的证据。",
      },
      observe: {
        title: "画像：Platinum 客户",
        detail: "客户等级没有填补使用情况缺口；自动退款仍不可安全判断。",
      },
      control: {
        title: "继续：检索使用账本",
        detail: "不是把窗口装满就结束；缺失决定性证据时，下一步应当是检索。",
      },
      evidence: "覆盖：现行规则 ✓ · 购买时间 ✓ · 使用情况缺失 → 必须继续",
    },
  ],
} satisfies MinimalRunExperimentSpec<FinalEvidence>;

export function ContextBudgetLab() {
  return <MinimalRunExperiment spec={experiment} />;
}
