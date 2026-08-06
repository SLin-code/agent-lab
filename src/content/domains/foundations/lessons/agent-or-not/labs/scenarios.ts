export type SystemCategory = "model-call" | "workflow" | "agent";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  answer: SystemCategory;
  explanation: string;
  signal: string;
  upgrade?: string;
}

export const categoryLabels: Record<SystemCategory, string> = {
  "model-call": "模型调用",
  workflow: "Workflow",
  agent: "Agent",
};

export const scenarios: readonly Scenario[] = [
  {
    id: "translate",
    title: "翻译按钮",
    description:
      "用户输入中文，系统调用一次模型并返回英文。没有工具，也没有后续步骤。",
    answer: "model-call",
    signal: "输入 → 模型 → 输出",
    explanation:
      "模型完成了一次输入到输出的转换，没有行动、观察和反馈循环。",
  },
  {
    id: "meeting",
    title: "会议摘要",
    description: "上传会议记录后，模型一次性生成摘要、待办事项和负责人。",
    answer: "model-call",
    signal: "输出字段多，不等于步骤多",
    explanation:
      "一次输出可以同时包含多个字段，但系统并没有在环境中连续采取行动。",
  },
  {
    id: "faq",
    title: "企业 FAQ",
    description:
      "系统固定检索最相似的 5 段文档，再把问题和文档交给模型生成答案。",
    answer: "workflow",
    signal: "检索 → 生成的路径由代码预设",
    explanation:
      "它使用了 RAG，但每次都走同一条固定路径。RAG 本身不等于 Agent。",
    upgrade:
      "允许模型判断是否检索、选择数据源、改写查询，并在证据不足时继续搜索。",
  },
  {
    id: "invoice",
    title: "发票处理",
    description:
      "OCR 识别发票，模型提取字段；置信度低于 0.8 时进入人工审核，否则写入财务系统。",
    answer: "workflow",
    signal: "分支存在，但条件由代码写死",
    explanation: "流程包含模型、分支和人工参与，但下一步仍由预设规则决定。",
  },
  {
    id: "weekly-report",
    title: "每周经营报告",
    description: "每周一自动查数据库、生成图表、调用模型写摘要，然后发送邮件。",
    answer: "workflow",
    signal: "自动运行不等于自主决策",
    explanation:
      "定时触发、无人值守、调用多个工具，都不能单独证明它是 Agent。",
  },
  {
    id: "tool-assistant",
    title: "通用工具助手",
    description:
      "模型可选择搜索、天气或计算器；看到结果后可以改变行动，最多执行 5 步。",
    answer: "agent",
    signal: "模型动态选行动，观察会改变下一步",
    explanation: "系统具备最小 Agent 特征，并用步数预算定义了终止边界。",
  },
  {
    id: "research",
    title: "研究助手",
    description:
      "它拆分问题、搜索资料，发现证据缺口后改变搜索方向，交叉核验后再结束。",
    answer: "agent",
    signal: "运行路径由证据状态动态形成",
    explanation:
      "搜索路线无法预先完整写死，观察结果会改变计划和下一步行动。",
  },
  {
    id: "refund",
    title: "售后处理助手",
    description:
      "模型依据每次查询结果选择下一项检查，并可改写方案；退款前必须经客服批准，执行后再确认状态。",
    answer: "agent",
    signal: "动态行动 + 环境反馈 + 人工权限边界",
    explanation:
      "人工审批不会让它失去 Agent 属性。审批是边界，不是固定执行路线。",
  },
];
