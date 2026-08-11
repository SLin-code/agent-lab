import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { ToolContractLab } from "./labs/ToolContractLab";

export function ToolContractLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="tool-contract-lesson">
      <LessonSection
        number="01"
        title="模型提出调用，Host 决定动作是否发生"
        lead="先把一句“调用工具”拆成可观察的系统路径。"
      >
        <div className="tool-contract-boundary-map" aria-label="模型提出工具调用后，Host 检查契约，再决定拒绝、等待审批、执行或返回既有结果">
          <article className="tool-contract-boundary-model">
            <span>MODEL</span>
            <strong>建议调用工具</strong>
            <p>选择工具并给出参数</p>
          </article>
          <span aria-hidden="true" className="tool-contract-boundary-arrow">→</span>
          <article className="tool-contract-boundary-host">
            <span>HOST</span>
            <strong>检查动作契约</strong>
            <ul>
              <li>输入是否合法？</li>
              <li>调用者有权执行吗？</li>
              <li>这是同一意图的重放吗？</li>
              <li>环境证据能证明成功吗？</li>
            </ul>
          </article>
          <span aria-hidden="true" className="tool-contract-boundary-arrow">→</span>
          <div className="tool-contract-boundary-outcomes">
            <span>拒绝</span>
            <span>待审批</span>
            <span>执行并核验</span>
            <span>返回既有结果</span>
          </div>
        </div>
        <div className="tool-contract-key-point">
          <span>关键边界</span>
          工具调用是模型交给应用的动作请求。只有 Host 完成检查并观察到环境结果，动作才有可核验的状态。
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="一份动作契约，至少回答四个问题"
        lead="参数 Schema 只是第一层；副作用还需要权限、结果与重放语义。"
      >
        <div className="tool-contract-parts">
          <article>
            <span>01 · INPUT</span>
            <h3>允许什么输入？</h3>
            <p>定义必填字段、类型、枚举与业务取值边界。形状正确，不代表业务值就安全。</p>
            <strong>例：amount 是整数，且不超过可提议上限。</strong>
          </article>
          <article>
            <span>02 · AUTHORITY</span>
            <h3>谁能让它发生？</h3>
            <p>区分“可看到工具”“可提议动作”和“可直接执行”，并标出需要人工批准的条件。</p>
            <strong>例：客服可提议；超过 ¥200 需主管批准。</strong>
          </article>
          <article>
            <span>03 · EVIDENCE</span>
            <h3>怎样证明成功？</h3>
            <p>把完成定义为环境可观察的后置条件，而不是模型生成一句“已经完成”。</p>
            <strong>例：交易号存在，且 after = before + amount。</strong>
          </article>
          <article>
            <span>04 · REPLAY</span>
            <h3>同一请求再来一次呢？</h3>
            <p>定义如何识别同一意图，以及重复请求是返回已有结果、拒绝，还是允许再次执行。</p>
            <strong>例：相同 operationId 返回原回执，不再写入。</strong>
          </article>
        </div>
        <p className="tool-contract-scope-note">
          <strong>不要把所有边界都塞进参数 Schema。</strong>
          Schema 负责结构与可表达的取值约束；身份、审批、执行后的环境证据和重放历史需要 Host 在运行时判断。
        </p>
      </LessonSection>

      <LessonSection
        number="03"
        title="同一个调用，审批证据怎样改变路径？"
        lead="沿同一条六步 Run，一次只改变审批证据，直接比较零写入与执行核验。"
      >
        <ToolContractLab />
        <div className="tool-contract-lab-note">
          本实验展示的是可审计的规则、动作、观察和状态变化，不展示模型的隐藏思维过程。
        </div>
      </LessonSection>

      <LessonSection
        number="04"
        title="“模型说成功”不是执行证据"
        lead="可靠的 Trace 要能指出决定、动作、观察和最终状态分别来自哪里。"
      >
        <div className="tool-contract-evidence-comparison">
          <article className="tool-contract-evidence-weak">
            <span>仅有模型文本</span>
            <blockquote>“已为用户发放 ¥300 优惠金。”</blockquote>
            <p>不知道 Host 是否放行、工具是否执行，也不知道外部状态是否改变。</p>
          </article>
          <article className="tool-contract-evidence-strong">
            <span>可审计动作记录</span>
            <dl>
              <div><dt>决定</dt><dd>主管 A-17 批准 case-7781</dd></div>
              <div><dt>动作</dt><dd>grant_credit 写入 1 次</dd></div>
              <div><dt>观察</dt><dd>工具返回 txn-8842；余额 120 → 420</dd></div>
              <div><dt>状态</dt><dd>后置条件通过，operationId 已记录</dd></div>
            </dl>
          </article>
        </div>
        <div className="tool-contract-reading-rule">
          <strong>读 Trace 时只问一句：</strong>
          哪条来自环境的证据，证明副作用真的发生了一次，而且只发生了一次？
        </div>
      </LessonSection>

      <LessonSection
        number="05"
        title="三个常见的“看似成功”"
        lead="这些问题不需要更多交互；把缺失的契约层并排看，反而更清楚。"
      >
        <div className="tool-contract-failures">
          <article>
            <span>VALID INPUT</span>
            <h3>参数合法，但调用者无权执行</h3>
            <p>字段全部通过 Schema，只能证明请求形状可读。Host 仍要检查身份、范围与审批记录。</p>
            <strong>缺失：权限与审批契约</strong>
          </article>
          <article>
            <span>SUCCESS TEXT</span>
            <h3>返回成功，但后置条件没变</h3>
            <p>响应没有错误，不代表业务目标已经达成。应读取交易号、状态或外部资源变化。</p>
            <strong>缺失：可验证结果契约</strong>
          </article>
          <article>
            <span>RETRY</span>
            <h3>网络重试，被当成第二次意图</h3>
            <p>如果 Host 无法识别同一请求，超时后的再次调用可能重复产生副作用。</p>
            <strong>缺失：重复执行语义</strong>
          </article>
        </div>
      </LessonSection>

      <LessonTakeaway>
        Tool Call 只是一个动作提案；
        <strong>工具契约让 Host 知道何时拒绝、何时等待、怎样证明完成，以及重放时不能再做什么。</strong>
      </LessonTakeaway>
    </div>
  );
}
