import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { CapabilityPassportLab } from "./labs/CapabilityPassportLab";

const layerCards = [
  {
    kind: "SKILL",
    question: "怎样做得更稳？",
    answer: "把一套可复用的指令、脚本与参考资料交给 Agent。",
    key: "重点是方法进入工作视野",
  },
  {
    kind: "TOOL",
    question: "能调用哪个动作？",
    answer: "用名称、描述和输入结构表达一个可调用能力。",
    key: "重点是 Host 执行具体动作",
  },
  {
    kind: "MCP",
    question: "怎样接入外部能力？",
    answer: "约定 Host、Client 与 Server 如何发现和交换能力。",
    key: "重点是连接工具与资源",
  },
  {
    kind: "A2A",
    question: "怎样把任务交给另一个 Agent？",
    answer: "让独立 Agent 通过消息、任务状态与产物进行协作。",
    key: "重点是 Agent 间委派",
  },
] as const;

const passports = [
  {
    kind: "SKILL",
    discover: "Skill 目录中的 name + description",
    request: "加载 SKILL.md 与按需资源",
    boundary: "受信内容 → Agent 当前工作视野",
    executor: "Agent 遵循方法；外部动作仍需工具",
  },
  {
    kind: "TOOL",
    discover: "工具名称、描述与参数 Schema",
    request: "结构化 tool call",
    boundary: "模型的动作建议 → Host 权限边界",
    executor: "Host / 应用侧函数",
  },
  {
    kind: "MCP",
    discover: "Server 能力 + tools/list",
    request: "MCP tools/call",
    boundary: "MCP Client → 已配置的本地或远程 Server",
    executor: "MCP Server 背后的服务",
  },
  {
    kind: "A2A",
    discover: "Agent Card",
    request: "A2A Message；必要时形成 Task",
    boundary: "Client Agent → 独立 Remote Agent",
    executor: "远端 Agent 及其内部工具",
  },
] as const;

export function CapabilityPassportsLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="capability-passports-lesson">
      <LessonSection
        number="01"
        title="它们不是四种大小不同的“插件”"
        lead="四个词都与能力有关，但分别回答方法、动作、连接与协作问题。"
      >
        <div className="cp-layer-grid">
          {layerCards.map((card) => (
            <article key={card.kind}>
              <span>{card.kind}</span>
              <h3>{card.question}</h3>
              <p>{card.answer}</p>
              <strong>{card.key}</strong>
            </article>
          ))}
        </div>
        <div className="cp-layer-rule">
          <span>先别问谁取代谁</span>
          <p>先问这项能力如何被找到、请求交给谁、数据离开了哪里，以及最后是谁动手。</p>
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="沿着能力护照，找到真正的执行者"
        lead="四张护照从同一个 Agent 出发，却停在完全不同的系统边界。"
      >
        <CapabilityPassportLab />
        <p className="cp-lab-note">
          本实验把一次“发布事故摘要”放进四种封套。它们不是同一任务的四个等价实现，而是用同一情境显出各层的职责差异。
        </p>
      </LessonSection>

      <LessonSection
        number="03"
        title="读懂一张能力护照，只看四栏"
        lead="名称最容易混淆；发现、请求、边界与执行者更难伪装。"
      >
        <div className="cp-passport-grid">
          {passports.map((passport) => (
            <article key={passport.kind}>
              <header>
                <span>CAPABILITY PASSPORT</span>
                <strong>{passport.kind}</strong>
              </header>
              <dl>
                <div><dt>如何发现</dt><dd>{passport.discover}</dd></div>
                <div><dt>请求封套</dt><dd>{passport.request}</dd></div>
                <div><dt>信任边界</dt><dd>{passport.boundary}</dd></div>
                <div><dt>谁执行</dt><dd>{passport.executor}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </LessonSection>

      <LessonSection
        number="04"
        title="一条 Run 可以同时使用四层"
        lead="它们更像一套嵌套合同，而不是必须四选一的技术栈。"
      >
        <div
          aria-label="Agent A 加载 Skill，通过 MCP 调用工具，也可通过 A2A 委派给 Agent B；Agent B 内部还可使用自己的 Skill 与工具"
          className="cp-composition-map"
        >
          <article className="cp-composition-agent">
            <span>AGENT A</span>
            <strong>事故协调 Agent</strong>
            <div><b>Skill</b><small>规定摘要结构与核验顺序</small></div>
            <div><b>Tool</b><small>post_message 表达可调用动作</small></div>
          </article>
          <div className="cp-composition-routes">
            <span className="cp-composition-routes-label">AGENT A 的两条能力路径</span>
            <div className="cp-composition-route">
              <article>
                <span>MCP</span>
                <strong>tools/call</strong>
                <small>连接并调用已发现的具体工具</small>
              </article>
              <i aria-hidden="true">→</i>
              <article className="cp-composition-destination">
                <span>CAPABILITY SERVER</span>
                <strong>消息系统 Server</strong>
                <small>执行 post_message 并返回工具结果</small>
              </article>
            </div>
            <div className="cp-composition-route">
              <article>
                <span>A2A</span>
                <strong>SendMessage</strong>
                <small>交换 Message、Task 与 Artifact</small>
              </article>
              <i aria-hidden="true">→</i>
              <article className="cp-composition-destination is-remote">
                <span>REMOTE AGENT B</span>
                <strong>沟通 Agent</strong>
                <small>内部可使用自己的 Skill、MCP 与工具</small>
              </article>
            </div>
          </div>
        </div>
        <p className="cp-composition-note">
          A2A 官方文档把两者描述为互补：MCP 连接工具与资源，A2A 连接独立 Agent。被委派的 Agent 内部仍然可以使用 MCP。
        </p>
      </LessonSection>

      <LessonSection
        number="05"
        title="三个名字相似、边界却不同的坑"
        lead="判断层级时，始终回到执行权和可见边界。"
      >
        <div className="cp-confusion-grid">
          <article>
            <span>SKILL ≠ TOOL</span>
            <h3>会做，不等于已经有执行权</h3>
            <p>Skill 可以教 Agent 何时、按什么顺序使用能力；真正改变外部状态，仍要经过工具与 Host 的执行契约。</p>
          </article>
          <article>
            <span>MCP SERVER ≠ AGENT</span>
            <h3>能暴露工具，不等于会自主协作</h3>
            <p>MCP Server 可以提供工具、资源与提示，但这本身不表示它会维护目标、独立规划或承担任务生命周期。</p>
          </article>
          <article>
            <span>TWO “SKILLS”</span>
            <h3>同一个词，可能是两份合同</h3>
            <p>Agent Skills 的 Skill 是带 SKILL.md 的能力包；A2A Agent Card 里的 AgentSkill 是远端能力描述，不要只凭字段名判定实现。</p>
          </article>
        </div>
      </LessonSection>

      <LessonTakeaway>
        Tool、Skill、MCP 与 A2A 可以出现在同一条 Run 中；
        <strong>真正稳定的分类方式，是追踪发现、封套、边界与执行者。</strong>
      </LessonTakeaway>
    </div>
  );
}
