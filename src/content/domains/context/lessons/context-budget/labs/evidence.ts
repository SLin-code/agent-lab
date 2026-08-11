export type EvidenceId =
  | "current-policy"
  | "purchase-ledger"
  | "usage-ledger"
  | "customer-message"
  | "old-faq"
  | "search-summary"
  | "vip-profile"
  | "past-ticket";

export type CoverageAxis = "rule" | "timing" | "usage";
export type Freshness = "current" | "stale" | "unknown";
export type Authority = "primary" | "secondary" | "self-report" | "derived";

export interface EvidenceItem {
  id: EvidenceId;
  title: string;
  source: string;
  detail: string;
  cost: number;
  freshness: Freshness;
  authority: Authority;
  coverage: readonly CoverageAxis[];
}

export const CONTEXT_BUDGET = 12;

export const evidenceItems: readonly EvidenceItem[] = [
  {
    id: "current-policy",
    title: "现行退款规则",
    source: "Policy Hub · v2026.07.15",
    detail:
      "购买 7 日内且没有生成记录可自动退款；已有使用记录则转人工复核。",
    cost: 4,
    freshness: "current",
    authority: "primary",
    coverage: ["rule"],
  },
  {
    id: "purchase-ledger",
    title: "支付账本",
    source: "Billing Ledger · 2026-08-01 10:24",
    detail: "用户在 6 天前支付 ¥899 购买年度套餐，本次请求对应同一笔订单。",
    cost: 3,
    freshness: "current",
    authority: "primary",
    coverage: ["timing"],
  },
  {
    id: "usage-ledger",
    title: "使用记录",
    source: "Usage Ledger · 查询于 2026-08-07 09:30",
    detail: "购买后已有 3 次生成任务成功完成。",
    cost: 3,
    freshness: "current",
    authority: "primary",
    coverage: ["usage"],
  },
  {
    id: "customer-message",
    title: "用户留言",
    source: "Support Inbox · 2026-08-07 09:12",
    detail: "“我是不小心购买的，买完以后一次也没有用过。”",
    cost: 2,
    freshness: "current",
    authority: "self-report",
    coverage: ["usage"],
  },
  {
    id: "old-faq",
    title: "旧版客服 FAQ",
    source: "Support Wiki · v2025.11.03",
    detail: "年度套餐购买 14 日内均可自动退款，没有列出使用条件。",
    cost: 3,
    freshness: "stale",
    authority: "secondary",
    coverage: ["rule"],
  },
  {
    id: "search-summary",
    title: "搜索摘要",
    source: "Enterprise Search · 生成于 2026-08-07",
    detail: "“大多数 14 日内提出的退款请求可以通过。”摘要没有显示规则版本。",
    cost: 2,
    freshness: "unknown",
    authority: "derived",
    coverage: ["rule"],
  },
  {
    id: "vip-profile",
    title: "客户画像",
    source: "CRM · 2026-08-07",
    detail: "客户等级为 Gold，注册 4 年，过去 90 天打开过 11 封邮件。",
    cost: 2,
    freshness: "current",
    authority: "primary",
    coverage: [],
  },
  {
    id: "past-ticket",
    title: "两年前的工单",
    source: "Support Archive · 2024-02-11",
    detail: "用户曾因重复扣款退过一次月度套餐。",
    cost: 3,
    freshness: "stale",
    authority: "primary",
    coverage: [],
  },
] as const;
