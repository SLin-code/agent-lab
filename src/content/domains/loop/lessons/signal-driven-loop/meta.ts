import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "signal-driven-loop",
  slug: "signal-driven-loop",
  domainId: "loop",
  order: 1,
  title: "重试不是循环工程",
  summary:
    "沿一次任务的观测节拍，分清什么证据应该触发重试、修复、停止或升级。",
  durationMinutes: 18,
  audience: "all",
  stability: "converging",
  status: "ready",
  tags: ["loop-engineering", "retry", "evaluation", "stop-condition"],
  objectives: [
    {
      id: "separate-retry-from-loop",
      text: "区分机械重试与由新观察驱动的循环",
    },
    {
      id: "map-signal-to-decision",
      text: "根据环境信号判断应该重试、修复、停止还是升级",
    },
    {
      id: "recognize-loop-boundaries",
      text: "识别完成证据、权限边界与尝试预算如何终止自动循环",
    },
  ],
  interactions: [
    {
      id: "loop-diagnostic-strip",
      kind: "debugger",
      title: "循环诊断节拍器",
      objectiveIds: [
        "separate-retry-from-loop",
        "map-signal-to-decision",
        "recognize-loop-boundaries",
      ],
      resettable: true,
      deterministic: true,
    },
  ],
  prerequisites: ["harness-boundaries"],
  thesis: {
    statement: "循环工程不是把同一个动作再做一次；",
    emphasis: "它让每轮的新观察决定重试、修复、停止或升级。",
  },
  claims: [
    {
      id: "agents-use-environment-feedback",
      statement:
        "Anthropic 将 Agent 描述为基于环境反馈使用工具的循环，并建议用完成标准、检查点和最大迭代数维持控制。",
    },
    {
      id: "runner-has-distinct-loop-outcomes",
      statement:
        "OpenAI Agents SDK 的运行循环会分别处理最终输出、工具调用与最大轮数：最终输出结束，工具结果进入下一轮，超出 max_turns 则终止运行。",
    },
    {
      id: "retries-can-amplify-failure",
      statement:
        "AWS Builders' Library 指出重试会增加下游负载，并建议用超时、退避、抖动与重试上限约束重试行为。",
    },
    {
      id: "evaluation-feedback-can-drive-iteration",
      statement:
        "Anthropic 的 evaluator-optimizer 模式以评估反馈驱动下一轮生成，适合存在清晰评价标准且反馈能带来可验证改进的任务。",
    },
  ],
  lastVerified: "2026-08-11",
  sources: [
    {
      id: "anthropic-building-effective-agents",
      title: "Building effective agents",
      publisher: "Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      verifiedAt: "2026-08-11",
      supportsClaimIds: [
        "agents-use-environment-feedback",
        "evaluation-feedback-can-drive-iteration",
      ],
    },
    {
      id: "openai-agents-running-agents",
      title: "Running agents",
      publisher: "OpenAI Agents SDK",
      url: "https://openai.github.io/openai-agents-python/running_agents/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["runner-has-distinct-loop-outcomes"],
    },
    {
      id: "aws-timeouts-retries-backoff",
      title: "Timeouts, retries, and backoff with jitter",
      publisher: "Amazon Web Services",
      url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
      verifiedAt: "2026-08-11",
      supportsClaimIds: ["retries-can-amplify-failure"],
    },
  ],
});
