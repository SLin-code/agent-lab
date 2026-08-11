import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { ContextBudgetLab } from "./labs/ContextBudgetLab";

export function ContextBudgetLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="context-budget-lesson">
      <LessonSection
        number="01"
        title="最后一个位置，放什么才会改变决定？"
        lead="沿同一条六步 Run，只替换一项证据，看系统应该继续检索还是停止。"
      >
        <ContextBudgetLab />
        <p className="cb-after-lab-note">
          这个实验不奖励“把位置用满”。它只检查一件事：决定性问题有没有被可靠证据覆盖。
        </p>
      </LessonSection>

      <LessonSection
        number="02"
        title="预算不是只有 Token 数"
        lead="窗口容量只是硬上限；真正稀缺的是模型在当前一步可以稳定利用的注意力。"
      >
        <div className="cb-filter-grid">
          <article>
            <span>01</span>
            <h3>相关</h3>
            <p>它会改变当前决策吗？客户等级看起来有用，却不决定退款规则。</p>
          </article>
          <article>
            <span>02</span>
            <h3>可信</h3>
            <p>它是可核验的一手记录、当事人自述，还是二次生成的摘要？</p>
          </article>
          <article>
            <span>03</span>
            <h3>及时</h3>
            <p>它现在仍然有效吗？没有版本号的规则摘要不能自动继承“最新”。</p>
          </article>
          <article>
            <span>04</span>
            <h3>够用</h3>
            <p>它是否覆盖所有决定性问题，并清楚留下尚未覆盖的边界？</p>
          </article>
        </div>
        <div className="cb-principle-callout">
          <span>四问筛选法</span>
          <p>会改变决策吗？来源可靠吗？仍然新鲜吗？决定性问题覆盖够了吗？</p>
        </div>
        <p className="cb-research-note">
          长上下文研究还提示了另一层风险：相关信息在输入中的位置变化，也可能显著改变模型能否稳定利用它。因此“放得下”不等于“用得好”。
        </p>
      </LessonSection>

      <LessonSection
        number="03"
        title="上下文是一次运行的工作视野"
        lead="它不只是一叠文档，而是当前步骤真正交给模型的指令、状态、工具、历史与证据。"
      >
        <div
          aria-label="候选信息经过筛选和组装进入当前模型视野，行动结果写回状态并触发下一轮刷新"
          className="cb-context-flow"
        >
          <article>
            <span>候选来源</span>
            <strong>规则 · 工具结果 · 记忆 · 历史</strong>
            <small>大部分信息仍在模型视野之外</small>
          </article>
          <i aria-hidden="true">→</i>
          <article className="is-active">
            <span>选择与组装</span>
            <strong>按当前决策分配预算</strong>
            <small>保留来源、版本和不确定项</small>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <span>当前视野</span>
            <strong>模型只看见被放进来的信息</strong>
            <small>缺失信息必须表现为边界</small>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <span>行动后刷新</span>
            <strong>观察写回，旧信息退出</strong>
            <small>下一步重新判断什么值得进入</small>
          </article>
        </div>
        <div className="cb-visibility-compare">
          <article>
            <span>进入当前上下文</span>
            <p>完成这一步必须直接引用、比较或约束行动的信息。</p>
          </article>
          <article>
            <span>留在外部按需取回</span>
            <p>可能以后有用，但不会改变当前决定的信息与原始长记录。</p>
          </article>
          <article>
            <span>明确丢弃</span>
            <p>重复、已失效、无法追溯，或只增加噪声的信息。</p>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        number="04"
        title="冲突不是噪声，是决策状态"
        lead="把冲突双方都塞进窗口却不标注关系，只会把消解工作偷偷推给模型。"
      >
        <div className="cb-conflict-grid">
          <article>
            <span>VERSION CONFLICT</span>
            <h3>版本冲突</h3>
            <div className="cb-conflict-pair">
              <p><small>2025 FAQ</small>14 日内自动退款</p>
              <b>≠</b>
              <p><small>2026 POLICY</small>7 日内且未使用</p>
            </div>
            <strong>处理：保留版本与生效时间，采用现行一手规则。</strong>
          </article>
          <article>
            <span>FACT CONFLICT</span>
            <h3>事实冲突</h3>
            <div className="cb-conflict-pair">
              <p><small>用户自述</small>从未使用</p>
              <b>≠</b>
              <p><small>USAGE LEDGER</small>3 次成功生成</p>
            </div>
            <strong>处理：保留分歧与来源，让可核验记录约束自动行动。</strong>
          </article>
        </div>
        <p className="cb-boundary-note">
          好的上下文不会伪装成“已经知道一切”。它会让系统能说清：依据什么行动、哪里仍有分歧、什么结果必须等待新观察或人工授权。
        </p>
      </LessonSection>

      <LessonSection
        number="05"
        title="长任务要维护，不是不断追加"
        lead="历史会增长，工作视野却需要持续选择。"
      >
        <div className="cb-maintenance-grid">
          <article>
            <span>KEEP</span>
            <h3>原样保留</h3>
            <p>仍在生效的约束、最近观察、未解决冲突与当前完成标准。</p>
          </article>
          <article>
            <span>COMPACT</span>
            <h3>有损压缩前先验收</h3>
            <p>已结束的过程可以概括，但必须检查关键决定、失败和边界是否丢失。</p>
          </article>
          <article>
            <span>RETRIEVE</span>
            <h3>移出后按需取回</h3>
            <p>原始工具结果和长历史保留在外部，需要核验时再带来源取回。</p>
          </article>
        </div>
        <div className="cb-refresh-trigger">
          <span>刷新上下文的三个时刻</span>
          <ol>
            <li>目标或当前步骤改变</li>
            <li>工具返回了新观察</li>
            <li>证据过期、冲突或完成标准仍未满足</li>
          </ol>
        </div>
      </LessonSection>

      <LessonTakeaway>
        上下文窗口是容量；
        <strong>上下文工程是对当前决策负责的证据选择与维护。</strong>
      </LessonTakeaway>
    </div>
  );
}
