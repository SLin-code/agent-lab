import { LessonSection } from "../../components/lesson/LessonSection";
import type { Lesson } from "../course-manifest";
import { ScenarioClassifier } from "../../labs/agent-or-not/ScenarioClassifier";
import { TraceStepper } from "../../labs/agent-or-not/TraceStepper";

export function AgentOrNotLesson({ lesson }: { lesson: Lesson }) {
  return (
    <>
      <header className="lesson-hero">
        <div className="lesson-meta">
          <span>阶段 01 · Agent 心智</span>
          <span className="stability stability-stable">Stable</span>
          <span>{lesson.duration} 分钟</span>
          <span>面向所有人</span>
        </div>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
        <div className="lesson-thesis">
          真正的区别，不是模型有多聪明，而是
          <strong>谁在决定下一步。</strong>
        </div>
        <ul className="lesson-objectives">
          {lesson.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </header>

      <LessonSection
        number="01"
        title="同一个模型，两种完全不同的系统"
        lead="先不要背定义。看它们怎样处理同一个任务。"
      >
        <div className="system-comparison">
          <div className="system-card model-card">
            <div className="system-card-heading">
              <span>一次模型调用</span>
              <small>INPUT → OUTPUT</small>
            </div>
            <p className="task-line">
              找出本周退款率上升的原因，并给出可核验的结论。
            </p>
            <div className="single-call-flow">
              <span>任务</span>
              <i>→</i>
              <span>模型</span>
              <i>→</i>
              <span>答案</span>
            </div>
            <blockquote>
              “退款上涨可能与产品质量、物流延迟、促销活动或支付问题有关……”
            </blockquote>
            <div className="system-result weak">
              听起来合理，但没有查询和验证
            </div>
          </div>
          <div className="system-card agent-card">
            <div className="system-card-heading">
              <span>Agent System</span>
              <small>OBSERVE → DECIDE → ACT</small>
            </div>
            <p className="task-line">
              找出本周退款率上升的原因，并给出可核验的结论。
            </p>
            <ol className="agent-mini-trace">
              <li>查询各渠道退款率</li>
              <li>发现渠道 P 明显异常</li>
              <li>检查该渠道近期变更</li>
              <li>验证支付 SDK 升级影响</li>
            </ol>
            <div className="system-result strong">
              结论附带数据、来源和不确定项
            </div>
          </div>
        </div>
        <div className="key-reveal">
          <span>关键变化</span>
          右侧系统会根据观察结果重新决定下一步，而不是一次性猜出答案。
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="先用一句话判断"
        lead="不要先问用了几个模型或工具，先看控制流。"
      >
        <div className="definition-grid">
          <article>
            <span className="definition-icon">→</span>
            <small>MODEL CALL</small>
            <h3>模型调用</h3>
            <p>输入一些内容，模型生成一次输出。</p>
            <code>Input → Model → Output</code>
          </article>
          <article>
            <span className="definition-icon">◇</span>
            <small>WORKFLOW</small>
            <h3>工作流</h3>
            <p>代码预先规定路径，模型负责其中一个或多个步骤。</p>
            <code>A → if/else → B → C</code>
          </article>
          <article>
            <span className="definition-icon">↻</span>
            <small>AGENT</small>
            <h3>Agent</h3>
            <p>模型结合当前状态和环境反馈，动态选择下一步。</p>
            <code>Observe → Decide → Act ↻</code>
          </article>
        </div>
        <p className="concept-scope-note">
          <strong>这是按一次运行的控制结构分类。</strong>
          模型调用是构件；Workflow 与 Agent 描述系统如何编排这些构件，三者不是产品物种。
        </p>
        <div className="rule-callout">
          <strong>两问判断法</strong>
          <p>
            谁持续拥有跨观察的行动选择权？观察会不会反过来改变下一步？
          </p>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="它到底是不是 Agent？"
        lead="八个真实场景。不要看产品名称，只看运行结构。"
      >
        <ScenarioClassifier />
      </LessonSection>

      <LessonSection
        number="04"
        title="拆开一次最小 Agent Run"
        lead="点击下一步，观察节点、路径与运行日志怎样一起变化。"
      >
        <TraceStepper />
        <div className="safety-note">
          教学界面只展示决策摘要、行动、观察和状态变化，不展示隐藏思维链。
        </div>
      </LessonSection>

      <LessonSection
        number="05"
        title="三类系统的控制权差异"
        lead="复杂度不是目标。能用稳定 Workflow 完成，就不必增加自治。"
      >
        <div className="table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>模型调用</th>
                <th>Workflow</th>
                <th>Agent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>下一步由谁决定</th>
                <td>没有下一步</td>
                <td>代码</td>
                <td>模型与控制策略</td>
              </tr>
              <tr>
                <th>执行路径</th>
                <td>单步</td>
                <td>预定义</td>
                <td>运行时形成</td>
              </tr>
              <tr>
                <th>环境反馈</th>
                <td>无</td>
                <td>进入固定分支</td>
                <td>影响后续决策</td>
              </tr>
              <tr>
                <th>停止方式</th>
                <td>输出即结束</td>
                <td>流程结束</td>
                <td>成功、失败、预算、审批或移交</td>
              </tr>
              <tr>
                <th>适合任务</th>
                <td>翻译、摘要、分类</td>
                <td>规则稳定的自动化</td>
                <td>路径难以预先写死的开放任务</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="graph-note">
          <strong>Graph 也不自动等于 Agent。</strong>
          固定拓扑也能承载 Agent，动态路由也可能只是规则 Workflow。关键是状态转移与行动由预设规则决定，还是由模型基于观察反复选择。
        </p>
      </LessonSection>

      <LessonSection
        number="06"
        title="五个最常见的误判"
        lead="营销名称不重要，Trace 和控制流才是证据。"
      >
        <div className="misconception-grid">
          <article>
            <strong>“会聊天就是 Agent”</strong>
            <p>聊天只是一种界面。一次问答仍然可能只是模型调用。</p>
          </article>
          <article>
            <strong>“调用工具就是 Agent”</strong>
            <p>如果代码固定调用工具，它仍然是 Workflow。</p>
          </article>
          <article>
            <strong>“无人值守就是 Agent”</strong>
            <p>定时任务可以完全自动，但路径仍可能完全固定。</p>
          </article>
          <article>
            <strong>“Agent 必须完全自主”</strong>
            <p>可靠 Agent 通常有明确权限、预算、审批点和停止条件。</p>
          </article>
          <article>
            <strong>“多 Agent 一定更先进”</strong>
            <p>更多 Agent 会增加成本、延迟、协调问题和失败面。</p>
          </article>
        </div>
      </LessonSection>

      <section className="lesson-conclusion">
        <span>TAKEAWAY</span>
        <blockquote>
          模型负责提出可能的下一步；
          <strong>Agent System 负责让下一步在边界内真正发生。</strong>
        </blockquote>
      </section>

      <section className="lesson-sources">
        <div>
          <span className="eyebrow">SOURCES</span>
          <h2>来源与核验</h2>
          <p>稳定原理与厂商实现分层维护，避免把产品 API 当成定义。</p>
        </div>
        <ul>
          {lesson.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
              </a>
              <span>
                {source.publisher}
                {source.supports ? ` · 支持：${source.supports}` : ""}
                {` · 核验于 ${source.verifiedAt}`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
