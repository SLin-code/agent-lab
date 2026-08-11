import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { SystemControlRoomLab } from "./labs/SystemControlRoomLab";

export function AuditableRunLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="auditable-run-lesson">
      <LessonSection
        number="01"
        title="六层不是六条独立功能"
        lead="它们围绕同一个目标、同一份状态和同一个外部世界协同。"
      >
        <div className="auditable-run-system-map" aria-label="Context、Graph、Tool Contract、Harness、Loop 与 Eval 围绕同一次 Run 协同">
          <div className="auditable-run-system-goal">
            <span>RUN GOAL</span>
            <strong>为损坏订单只补发一次，并通知客户</strong>
            <small>order-4821 · operationId=replace-4821</small>
          </div>
          <div className="auditable-run-layer-ring">
            <article><span>CONTEXT</span><strong>带入事实与约束</strong></article>
            <article><span>GRAPH</span><strong>选择下一条边</strong></article>
            <article><span>TOOL CONTRACT</span><strong>约束真实动作</strong></article>
            <article><span>HARNESS</span><strong>保存状态与边界</strong></article>
            <article><span>LOOP</span><strong>决定继续或停止</strong></article>
            <article><span>EVAL</span><strong>判定完成证据</strong></article>
          </div>
        </div>
        <p className="auditable-run-system-note">
          <strong>系统性的关键不是层数，而是接缝。</strong>
          Graph 选择的动作必须受工具契约约束，Harness 保存的状态必须支持 Loop 继续，Eval 判定的完成必须来自环境结果。
        </p>
      </LessonSection>

      <LessonSection
        number="02"
        title="先定义一份跨层证据账本"
        lead="每个结论都要能指出来源；否则一次故障就会让各层讲出不同故事。"
      >
        <div className="auditable-run-ledger-contract">
          <article>
            <span>GOAL + SEEN</span>
            <h3>目标与输入快照</h3>
            <p>订单、政策版本、损坏证据、审批与唯一 operationId。</p>
            <strong>来源：Context + Run spec</strong>
          </article>
          <article>
            <span>DECISION + EDGE</span>
            <h3>决定与状态转移</h3>
            <p>当前节点、选择的边、触发它的可观察条件，以及仍可到达的退出路径。</p>
            <strong>来源：Graph + Loop</strong>
          </article>
          <article>
            <span>ACTION + CHECKPOINT</span>
            <h3>动作与运行状态</h3>
            <p>Host 实际调用了什么，调用前后保存了哪个检查点，哪些动作禁止重复。</p>
            <strong>来源：Tool Contract + Harness</strong>
          </article>
          <article>
            <span>OBSERVATION + VERDICT</span>
            <h3>环境结果与完成判据</h3>
            <p>运单是否存在、创建次数是否为一、通知是否成功，以及 Run 能否停止。</p>
            <strong>来源：Environment + Eval</strong>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="在工具回执处注入一个故障"
        lead="先建立无故障基线，再只把回执改成超时，观察六层如何一起变化。"
      >
        <SystemControlRoomLab />
        <p className="auditable-run-lab-note">
          故障分支保持目标、上下文、审批、请求参数与 operationId 不变；唯一变化是工具已接收请求，但响应超时。
        </p>
      </LessonSection>

      <LessonSection
        number="04"
        title="同一个动作请求，会产生三种不同的系统状态"
        lead="不要把“没有收到回执”压扁成一个笼统的 failed。"
      >
        <div className="auditable-run-state-comparison">
          <article>
            <span>NORMAL</span>
            <h3>回执可核验</h3>
            <dl>
              <div><dt>Tool</dt><dd>shipment=S-8892</dd></div>
              <div><dt>Graph</dt><dd>notify → complete</dd></div>
              <div><dt>Eval</dt><dd>create_count=1 · notified=true · PASS</dd></div>
            </dl>
            <strong>STOP</strong>
          </article>
          <article className="is-warning">
            <span>FAULT</span>
            <h3>请求已提交，回执超时</h3>
            <dl>
              <div><dt>Tool</dt><dd>outcome=UNKNOWN</dd></div>
              <div><dt>Graph</dt><dd>选择 reconcile 边</dd></div>
              <div><dt>Eval</dt><dd>完成证据不足 · HOLD</dd></div>
            </dl>
            <strong>CONTINUE</strong>
          </article>
          <article>
            <span>RECOVERY</span>
            <h3>同一意图安全重放</h3>
            <dl>
              <div><dt>Tool</dt><dd>返回既有 S-8892</dd></div>
              <div><dt>Harness</dt><dd>operationId 未变化</dd></div>
              <div><dt>Eval</dt><dd>create_count=1 · notified=true · PASS</dd></div>
            </dl>
            <strong>STOP</strong>
          </article>
        </div>
        <p className="auditable-run-reading-rule">
          <strong>恢复不是“再试一次”。</strong>
          它是从检查点读取同一意图，用工具契约允许的重放语义先对账，再由环境证据决定下一条边。
        </p>
      </LessonSection>

      <LessonSection
        number="05"
        title="六问审查一个完整 Agent System"
        lead="不要求写方案，只要能沿证据逐层回答。"
      >
        <ol className="auditable-run-review-list">
          <li><span>01</span><div><strong>Context</strong><p>当前决定依赖的事实、版本与缺口是什么？</p></div></li>
          <li><span>02</span><div><strong>Tool Contract</strong><p>谁允许动作发生，怎样证明只发生一次？</p></div></li>
          <li><span>03</span><div><strong>Harness</strong><p>中断时保存了什么，哪些状态可以安全恢复？</p></div></li>
          <li><span>04</span><div><strong>Loop</strong><p>哪条观察让 Run 继续、停止或移交？</p></div></li>
          <li><span>05</span><div><strong>Graph</strong><p>运行时实际选择了哪条边，触发条件能否核验？</p></div></li>
          <li><span>06</span><div><strong>Eval</strong><p>完成判据检查了最终结果，也保护了哪些旧能力？</p></div></li>
        </ol>
      </LessonSection>

      <LessonTakeaway>
        一个完整 Agent System 不是把组件接起来；
        <strong>它要让每次决定、动作、中断、恢复与停止都能回到同一份环境证据。</strong>
      </LessonTakeaway>
    </div>
  );
}
