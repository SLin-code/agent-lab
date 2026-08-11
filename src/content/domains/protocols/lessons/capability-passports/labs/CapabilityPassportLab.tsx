import { useEffect, useRef, useState } from "react";
import { LabFrame } from "@/components/lab/LabFrame";

type PassportKind = "skill" | "tool" | "mcp" | "a2a";
type Destination = "agent" | "host" | "mcp-server" | "remote-agent";

interface CapabilityPassport {
  id: PassportKind;
  label: string;
  layer: string;
  discover: string;
  envelope: string;
  boundary: string;
  executor: string;
  destination: Destination;
  dispatch: string;
  result: string;
  evidence: string;
  continuation: string;
}

const passports: readonly CapabilityPassport[] = [
  {
    id: "skill",
    label: "Skill",
    layer: "方法包",
    discover: "目录元数据 · name + description",
    envelope: "加载 SKILL.md 与引用资源",
    boundary: "受信内容进入 Agent 当前工作视野",
    executor: "Skill 本身不定义执行端；Agent / Host 按说明读取资源或运行脚本",
    destination: "agent",
    dispatch: "加载这张 Skill 护照 →",
    result: "LOADED · incident-summary",
    evidence: "本次只加载 instructions · external_write=0",
    continuation: "继续：Agent 还要按方法选择并调用真正的动作能力",
  },
  {
    id: "tool",
    label: "Tool",
    layer: "动作接口",
    discover: "名称 + 描述 + 输入 Schema",
    envelope: "post_message(channel, text)",
    boundary: "模型动作建议进入 Host 权限边界",
    executor: "Host / 应用侧函数",
    destination: "host",
    dispatch: "把 tool call 交给 Host →",
    result: "EXECUTED · message_id=msg-77",
    evidence: "application function 执行 · write_count=1",
    continuation: "停止追踪：Host 已返回可核验的动作结果",
  },
  {
    id: "mcp",
    label: "MCP",
    layer: "能力协议",
    discover: "Server 能力 + tools/list",
    envelope: "tools/call · post_message",
    boundary: "Host 的 MCP Client 跨到已配置的远程 Server",
    executor: "MCP Server 背后的消息服务",
    destination: "mcp-server",
    dispatch: "把 tools/call 送往 MCP Server →",
    result: "RETURNED · message_id=msg-77",
    evidence: "channel + text 已发给该 Server · result received",
    continuation: "停止追踪：MCP Client 已收到 Server 的工具结果",
  },
  {
    id: "a2a",
    label: "A2A",
    layer: "Agent 协作协议",
    discover: "Remote Agent 的 Agent Card",
    envelope: "SendMessage · 发布事故摘要",
    boundary: "Client Agent 跨到独立 Remote Agent",
    executor: "远端 Agent 自主处理，并调用它自己的工具",
    destination: "remote-agent",
    dispatch: "把 Message 委派给 Remote Agent →",
    result: "ACCEPTED · task-42 working",
    evidence: "远端返回 Task 状态；尚不能声称消息已发布",
    continuation: "继续观察：等待 task-42 进入完成态并返回 Artifact",
  },
];

const routeNodes = [
  {
    id: "agent" as const,
    eyebrow: "CURRENT TRUST ZONE",
    title: "Agent 工作视野",
    detail: "选择能力、读取当前可见说明",
  },
  {
    id: "host" as const,
    eyebrow: "EXECUTION BOUNDARY",
    title: "Host / Client",
    detail: "校验请求、权限与连接配置",
  },
  {
    id: "mcp-server" as const,
    eyebrow: "CAPABILITY SERVER",
    title: "MCP Server",
    detail: "本实验中是已配置的远程服务",
  },
  {
    id: "remote-agent" as const,
    eyebrow: "AGENT / ORG BOUNDARY",
    title: "Remote Agent",
    detail: "内部规划、记忆与工具对调用方不透明",
  },
];

function isOnRoute(kind: PassportKind, node: Destination) {
  if (node === "agent") return true;
  if (node === "host") return kind !== "skill";
  if (node === "mcp-server") return kind === "mcp";
  return kind === "a2a";
}

export function CapabilityPassportLab() {
  const [activeId, setActiveId] = useState<PassportKind | null>(null);
  const [sent, setSent] = useState(false);
  const firstPassportRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const activePassport = passports.find((passport) => passport.id === activeId);

  useEffect(() => {
    if (!sent) return;
    requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
  }, [sent]);

  function selectPassport(id: PassportKind) {
    setActiveId(id);
    setSent(false);
  }

  function reset() {
    setActiveId(null);
    setSent(false);
    requestAnimationFrame(() =>
      firstPassportRef.current?.focus({ preventScroll: true }),
    );
  }

  const status = !activePassport
    ? "CHOOSE A PASSPORT"
    : sent
      ? `ARRIVED · ${activePassport.label.toUpperCase()}`
      : `READY · ${activePassport.label.toUpperCase()}`;

  return (
    <LabFrame
      className="capability-passport-lab"
      eyebrow="CAPABILITY BORDER CONTROL"
      status={<span className="cp-lab-status">{status}</span>}
      title="同一份目标，会停在哪条边界？"
    >
      <section className="cp-lab-goal">
        <span>目标封套</span>
        <div>
          <strong>发布一份已核验的事故摘要</strong>
          <small>只追踪能力如何进入系统，不比较哪种技术“更强”。</small>
        </div>
      </section>

      <fieldset className="cp-passport-picker">
        <legend>选择一张能力护照</legend>
        <div>
          {passports.map((passport, index) => (
            <button
              aria-pressed={activeId === passport.id}
              className={activeId === passport.id ? "is-selected" : ""}
              key={passport.id}
              onClick={() => selectPassport(passport.id)}
              ref={index === 0 ? firstPassportRef : undefined}
              type="button"
            >
              <span>{passport.layer}</span>
              <strong>{passport.label}</strong>
              <small>
                {passport.id === "skill"
                  ? "教 Agent 怎样做"
                  : passport.id === "tool"
                    ? "向 Host 提出动作"
                    : passport.id === "mcp"
                      ? "连接外部工具与资源"
                      : "委派给独立 Agent"}
              </small>
            </button>
          ))}
        </div>
      </fieldset>

      {activePassport ? (
        <div className="cp-passport-workspace">
          <article className={`cp-passport-book ${sent ? "is-stamped" : ""}`}>
            <header>
              <span>CAPABILITY PASSPORT</span>
              <strong>{activePassport.label}</strong>
              <small>{activePassport.layer}</small>
            </header>
            <dl>
              <div>
                <dt><i aria-hidden="true">{sent ? "✓" : "1"}</i> 如何发现</dt>
                <dd>{activePassport.discover}</dd>
              </div>
              <div>
                <dt><i aria-hidden="true">{sent ? "✓" : "2"}</i> 请求封套</dt>
                <dd>{activePassport.envelope}</dd>
              </div>
              <div>
                <dt><i aria-hidden="true">{sent ? "✓" : "3"}</i> 信任边界</dt>
                <dd>{activePassport.boundary}</dd>
              </div>
              <div>
                <dt><i aria-hidden="true">{sent ? "✓" : "4"}</i> 谁执行</dt>
                <dd>{activePassport.executor}</dd>
              </div>
            </dl>
          </article>

          <section aria-label={`${activePassport.label} 的能力边界路径`} className="cp-route-board">
            <header>
              <span>TRUST MAP</span>
              <small>发亮的节点才属于这张护照的路径</small>
            </header>
            <div className={`cp-route-map is-${activePassport.id} ${sent ? "is-sent" : ""}`}>
              <div className="cp-route-main">
                {routeNodes.slice(0, 2).map((node) => {
                  const destination = activePassport.destination === node.id;
                  return (
                    <article
                      className={`${isOnRoute(activePassport.id, node.id) ? "is-on-route" : ""} ${sent && destination ? "is-destination" : ""}`}
                      key={node.id}
                    >
                      <span>{node.eyebrow}</span>
                      <strong>{node.title}</strong>
                      <small>{node.detail}</small>
                      {sent && destination ? <b>✉ 到达</b> : null}
                    </article>
                  );
                })}
              </div>
              <div className="cp-route-external">
                <span className="cp-route-external-label">HOST 外部 · 两个并列终点</span>
                {routeNodes.slice(2).map((node) => {
                  const destination = activePassport.destination === node.id;
                  return (
                    <article
                      className={`${isOnRoute(activePassport.id, node.id) ? "is-on-route" : ""} ${sent && destination ? "is-destination" : ""}`}
                      key={node.id}
                    >
                      <span>{node.eyebrow}</span>
                      <strong>{node.title}</strong>
                      <small>{node.detail}</small>
                      {sent && destination ? <b>✉ 到达</b> : null}
                    </article>
                  );
                })}
              </div>
              <div aria-hidden="true" className={`cp-moving-envelope is-${activePassport.destination}`}>
                <span>✉</span>
                <small>{activePassport.label}</small>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="cp-passport-empty">
          <span aria-hidden="true">✦</span>
          <strong>先打开一张护照</strong>
          <p>你将看见它怎样被发现、封套里装什么，以及请求最终停在哪里。</p>
        </div>
      )}

      <div className="cp-passport-controls">
        {activePassport ? (
          <>
            {!sent ? (
              <button className="button button-light" onClick={() => setSent(true)} type="button">
                {activePassport.dispatch}
              </button>
            ) : null}
            <button className="button button-ghost-dark" onClick={reset} type="button">
              ↺ 重置护照
            </button>
          </>
        ) : null}
      </div>

      <div
        aria-atomic="true"
        aria-live="polite"
        className={`cp-passport-result ${sent ? "is-arrived" : ""}`}
        ref={resultRef}
        role="status"
        tabIndex={-1}
      >
        <span>{sent ? "观察 / 继续或停止" : activePassport ? "等待行动" : "等待决定"}</span>
        <strong>
          {sent && activePassport
            ? activePassport.result
            : activePassport
              ? `封套已就绪 · 终点是${
                  activePassport.destination === "agent"
                    ? " Agent 工作视野"
                    : activePassport.destination === "host"
                      ? " Host"
                      : activePassport.destination === "mcp-server"
                        ? " MCP Server"
                        : " Remote Agent"
                }`
              : "选择护照后，结果会在这里出现"}
        </strong>
        <small>
          {sent && activePassport
            ? activePassport.evidence
            : "目标相同，不代表数据、执行权与完成证据相同。"}
        </small>
        {sent && activePassport ? <em>{activePassport.continuation}</em> : null}
      </div>
    </LabFrame>
  );
}
