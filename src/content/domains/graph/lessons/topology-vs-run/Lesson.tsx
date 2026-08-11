import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { GraphRuntimeLab } from "./labs/GraphRuntimeLab";

export function TopologyVsRunLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="topology-vs-run-lesson">
      <LessonSection
        number="01"
        title="一张图，回答不了“刚才发生了什么”"
        lead="它更像线路图：展示所有可走的结构，而不是某一次真实行程。"
      >
        <div className="tvr-map-trace-compare">
          <article>
            <div className="tvr-compare-heading">
              <span>GRAPH TOPOLOGY</span>
              <small>设计时结构</small>
            </div>
            <div className="tvr-mini-topology" aria-label="拓扑包含并行、停止和回边三种可能结构">
              <b>检查</b><i>→</i>
              <span><em>事实</em><em>风险</em></span><i>→</i>
              <b>评估</b><i>↗︎ / ↩︎</i>
              <span><em>发布</em><em>修订</em></span>
            </div>
            <p>说明哪些节点存在、哪些边允许被选择，以及哪里可以分叉、并行、回到上游或结束。</p>
          </article>
          <article className="is-trace">
            <div className="tvr-compare-heading">
              <span>RUN TRACE</span>
              <small>运行时事实</small>
            </div>
            <ol className="tvr-mini-trace" aria-label="一次运行真正激活的节点序列">
              <li><b>T1</b><span>检查</span></li>
              <li><b>T2</b><span>事实 + 风险</span></li>
              <li><b>T3</b><span>草拟</span></li>
              <li><b>T4</b><span>评估 0.91</span></li>
              <li><b>T5</b><span>发布 → END</span></li>
            </ol>
            <p>说明这一 Run 实际激活了谁、条件读到了什么值，以及最终选择哪条边。</p>
          </article>
        </div>
        <div className="tvr-opening-rule">
          <strong>拓扑是“可能性集合”，Trace 是“已发生路径”。</strong>
          只保存图，无法证明运行时真的走了哪条边；只保存文字结果，又难以核对它是否遵守图的边界。
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="Graph Loop 是一条有条件的回边"
        lead="回边本身不会自动带来改进；运行时状态必须决定何时回去、何时退出。"
      >
        <div className="tvr-graph-vocabulary">
          <article>
            <span>BRANCH</span>
            <strong>条件选择边</strong>
            <p>路由读取当前状态，选择一个或多个下一节点；未选中的边只属于拓扑。</p>
          </article>
          <article>
            <span>PARALLEL</span>
            <strong>同一拍激活多个节点</strong>
            <p>事实核验与风险检查可以同时开始；它们不是两个先后发生的点击。</p>
          </article>
          <article>
            <span>JOIN</span>
            <strong>等待所需更新汇合</strong>
            <p>下游节点在依赖满足后继续，状态合并规则要能处理同一拍的多个更新。</p>
          </article>
          <article>
            <span>LOOP / END</span>
            <strong>回边与退出成对设计</strong>
            <p>评估不通过可回到修订；达到阈值、预算或边界时必须走向 END 或受控终止。</p>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="在同一张图上擦看两次 Run"
        lead="拖动时间游标：拓扑不动，真正激活的节点和边会随评估证据变化。"
      >
        <GraphRuntimeLab />
        <p className="tvr-lab-note">
          两次 Run 只改变第一次评估分数：A=0.91，B=0.62。事实检查、风险检查、阈值和图结构完全相同。
        </p>
      </LessonSection>

      <LessonSection
        number="04"
        title="并行是一拍，不是画在同一行"
        lead="运行时的 step 边界，决定哪些更新彼此可见。"
      >
        <div className="tvr-superstep-model">
          <article>
            <span>PLAN</span>
            <strong>选择本拍被激活的节点</strong>
            <p>前一拍更新了哪些状态或 channel，决定这一拍谁有资格执行。</p>
          </article>
          <i aria-hidden="true">→</i>
          <article className="is-parallel">
            <span>EXECUTION</span>
            <strong>事实核验 ∥ 风险检查</strong>
            <p>本拍被选择的节点并行运行；不要假设它们能立即读到彼此尚未提交的更新。</p>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <span>UPDATE</span>
            <strong>合并本拍写入</strong>
            <p>更新进入共享状态后，下一拍的节点才基于新的快照继续。</p>
          </article>
        </div>
        <div className="tvr-parallel-warning">
          <span aria-hidden="true">≠</span>
          <p><strong>视觉并排不等于运行时并行。</strong>要核对激活 step、依赖关系、合并规则和失败语义。</p>
        </div>
      </LessonSection>

      <LessonSection
        number="05"
        title="审查一张 Graph，至少要看三层证据"
        lead="把结构、状态和轨迹混在一起，调试时就只剩一张漂亮的图。"
      >
        <div className="tvr-review-layers">
          <article>
            <span>01 · TOPOLOGY</span>
            <h3>允许走到哪里？</h3>
            <p>节点、普通边、条件边、并行扇出、汇合与 END 是否表达完整。</p>
          </article>
          <article>
            <span>02 · ROUTING STATE</span>
            <h3>什么值选择了这条边？</h3>
            <p>记录评估分数、预算、错误类型或人工决定，而不是只写“进入修订”。</p>
          </article>
          <article>
            <span>03 · ACTIVATION TRACE</span>
            <h3>运行时实际激活了谁？</h3>
            <p>按 step 保留节点开始、结束、状态更新与停止原因，才能重放一条真实路径。</p>
          </article>
        </div>
      </LessonSection>

      <LessonTakeaway>
        Graph 让复杂路径可以被设计；
        <strong>运行时状态与激活轨迹，才让分支、并行、回边和停止变得可解释。</strong>
      </LessonTakeaway>
    </div>
  );
}
