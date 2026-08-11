export type PermissionMode = "preview-only" | "batch-write";
export type ApprovalMode = "required" | "not-required";
export type TimeoutMode = "four-seconds" | "ten-seconds";
export type CheckpointMode = "enabled" | "disabled";
export type Prediction = "blocked" | "approval" | "timeout" | "completed";
export type ApprovalDecision = "approve" | "reject";

export interface BoundaryConfig {
  permission: PermissionMode;
  approval: ApprovalMode;
  timeout: TimeoutMode;
  checkpoint: CheckpointMode;
}

export type RuntimePhase =
  | "configure"
  | "approval"
  | "recover"
  | "final";

export type RuntimeOutcome =
  | "blocked"
  | "approval"
  | "rejected"
  | "timed-out-recoverable"
  | "timed-out-unknown"
  | "completed"
  | "recovered";

export type RouteStageId =
  | "proposal"
  | "permission"
  | "approval"
  | "checkpoint"
  | "execution"
  | "recovery";

export type RouteStageStatus =
  | "idle"
  | "passed"
  | "blocked"
  | "waiting"
  | "rejected"
  | "saved"
  | "skipped"
  | "running"
  | "timed-out"
  | "unknown"
  | "completed"
  | "recovered";

export interface RouteStage {
  id: RouteStageId;
  eyebrow: string;
  title: string;
  status: RouteStageStatus;
  detail: string;
}

export const initialConfig: BoundaryConfig = {
  permission: "preview-only",
  approval: "required",
  timeout: "four-seconds",
  checkpoint: "enabled",
};

export const predictionLabels: Record<Prediction, string> = {
  blocked: "被权限阻止",
  approval: "暂停并等待审批",
  timeout: "执行中超时",
  completed: "执行并核验完成",
};

export const statusLabels: Record<RouteStageStatus, string> = {
  idle: "未到达",
  passed: "通过",
  blocked: "已阻止",
  waiting: "等待中",
  rejected: "已拒绝",
  saved: "已保存",
  skipped: "已跳过",
  running: "执行中",
  "timed-out": "已超时",
  unknown: "待对账",
  completed: "已核验",
  recovered: "已恢复",
};

export function expectedPrediction(config: BoundaryConfig): Prediction {
  if (config.permission === "preview-only") return "blocked";
  if (config.approval === "required") return "approval";
  if (config.timeout === "four-seconds") return "timeout";
  return "completed";
}

export function approvalCheckpointEvidence(config: BoundaryConfig): string {
  return config.approval === "required"
    ? "审批凭证 A-204"
    : "审批策略记录：无需人工审批";
}

function checkpointPreviewDetail(config: BoundaryConfig): string {
  if (config.checkpoint === "disabled") {
    return "当前配置不保存可恢复的批次游标。";
  }

  return config.approval === "required"
    ? "计划保存目标快照与批次游标；审批通过后再绑定审批凭证。"
    : "计划保存目标快照、批次游标与“无需人工审批”的策略记录。";
}

function savedCheckpointDetail(
  config: BoundaryConfig,
  outcome: RuntimeOutcome | null,
): string {
  const approvalEvidence = approvalCheckpointEvidence(config);

  if (outcome === "timed-out-recoverable") {
    return `执行前已保存目标快照、${approvalEvidence}、批次游标 0/2；第一批回读确认后更新为 1/2。`;
  }

  if (outcome === "recovered") {
    return `原运行保存了${approvalEvidence}，并在批次游标 1/2 中断；恢复完成并回读后更新为 2/2。`;
  }

  if (outcome === "completed") {
    return `执行前已保存目标快照、${approvalEvidence}、批次游标 0/2；两批回读确认后更新为 2/2。`;
  }

  return `已保存目标快照、${approvalEvidence}、批次游标 0/2。`;
}

function idleStage(
  id: RouteStageId,
  eyebrow: string,
  title: string,
  detail: string,
): RouteStage {
  return { id, eyebrow, title, detail, status: "idle" };
}

export function buildRoute(
  config: BoundaryConfig,
  phase: RuntimePhase,
  outcome: RuntimeOutcome | null,
): RouteStage[] {
  const stages: RouteStage[] = [
    idleStage(
      "proposal",
      "01 · MODEL",
      "提出动作",
      "建议停用 286 个 90 天未登录账号。",
    ),
    idleStage(
      "permission",
      "02 · POLICY",
      "检查权限",
      "Host 对资源范围与动作类型做确定性检查。",
    ),
    idleStage(
      "approval",
      "03 · HUMAN",
      "请求审批",
      "高风险动作可在执行前暂停。",
    ),
    idleStage(
      "checkpoint",
      "04 · STATE",
      "保存检查点",
      checkpointPreviewDetail(config),
    ),
    idleStage(
      "execution",
      "05 · HOST",
      "执行并核验",
      "两批写入，每批约 3 秒，并回读账号状态。",
    ),
    idleStage(
      "recovery",
      "06 · RECOVERY",
      "恢复或移交",
      "从已确认状态继续，或转人工对账。",
    ),
  ];

  if (phase === "configure") return stages;

  stages[0] = {
    ...stages[0],
    status: "passed",
    detail: "模型只提交动作建议；此时外部账号尚未改变。",
  };

  if (outcome === "blocked") {
    stages[1] = {
      ...stages[1],
      status: "blocked",
      detail: "当前凭证只允许预览，批量写入未被执行。",
    };
    return stages;
  }

  stages[1] = {
    ...stages[1],
    status: "passed",
    detail: "动作和目标集合都在 batch-write 授权范围内。",
  };

  if (phase === "approval" || outcome === "approval") {
    stages[2] = {
      ...stages[2],
      status: "waiting",
      detail: "运行已序列化并暂停，等待运营负责人决定。",
    };
    return stages;
  }

  if (outcome === "rejected") {
    stages[2] = {
      ...stages[2],
      status: "rejected",
      detail: "审批人拒绝；Host 记录决定并终止本次动作。",
    };
    return stages;
  }

  stages[2] = {
    ...stages[2],
    status: config.approval === "required" ? "passed" : "skipped",
    detail:
      config.approval === "required"
        ? "审批凭证已绑定到本次动作。"
        : "当前策略不要求人工审批；路径直接继续。",
  };

  stages[3] = {
    ...stages[3],
    status: config.checkpoint === "enabled" ? "saved" : "skipped",
    detail:
      config.checkpoint === "enabled"
        ? savedCheckpointDetail(config, outcome)
        : "未保存可恢复的批次游标。",
  };

  if (
    outcome === "timed-out-recoverable" ||
    outcome === "timed-out-unknown"
  ) {
    stages[4] = {
      ...stages[4],
      status: "timed-out",
      detail: "4 秒上限到达：第一批已回读确认，第二批尚未开始。",
    };
    stages[5] = {
      ...stages[5],
      status:
        outcome === "timed-out-recoverable" ? "waiting" : "unknown",
      detail:
        outcome === "timed-out-recoverable"
          ? "检查点指向批次 1/2；可从剩余 143 个账号继续。"
          : "没有游标可证明处理位置；必须先人工对账，不能盲目重跑。",
    };
    return stages;
  }

  if (outcome === "recovered") {
    stages[4] = {
      ...stages[4],
      status: "completed",
      detail: "恢复运行只处理第二批；286 个状态均已回读核验。",
    };
    stages[5] = {
      ...stages[5],
      status: "recovered",
      detail: "从批次游标 1/2 继续，没有重复执行已确认的第一批。",
    };
    return stages;
  }

  stages[4] = {
    ...stages[4],
    status: "completed",
    detail: "两批均在 10 秒预算内完成，286 个状态已回读核验。",
  };
  stages[5] = {
    ...stages[5],
    status: "skipped",
    detail: "没有发生中断，不需要进入恢复路径。",
  };
  return stages;
}
