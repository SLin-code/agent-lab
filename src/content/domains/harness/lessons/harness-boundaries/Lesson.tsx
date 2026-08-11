import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { BoundaryRouteLab } from "./labs/BoundaryRouteLab";

export function HarnessBoundariesLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="harness-boundaries-lesson">
      <LessonSection
        number="01"
        title="建议出现了，动作还没有发生"
        lead="先看同一个批量停用建议，在有无运行边界时会发生什么。"
      >
        <div className="harness-boundaries-opening">
          <article className="harness-boundaries-opening-model">
            <div className="harness-boundaries-card-heading">
              <span>MODEL OUTPUT</span>
              <small>动作建议</small>
            </div>
            <p>“停用连续 90 天未登录的试用账号。”</p>
            <dl>
              <div>
                <dt>目标集合</dt>
                <dd>inactive-90d · 286 个</dd>
              </div>
              <div>
                <dt>建议动作</dt>
                <dd>批量停用 286 个目标账号</dd>
              </div>
            </dl>
            <div className="harness-boundaries-not-executed">
              <span aria-hidden="true">◇</span>
              <strong>这是请求，不是执行凭证</strong>
              <small>外部账号状态仍未改变</small>
            </div>
          </article>

          <article className="harness-boundaries-opening-harness">
            <div className="harness-boundaries-card-heading">
              <span>RUN CONTROL</span>
              <small>有边界的运行</small>
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>权限作用域</strong>
                  <small>这次 Run 能否批量写入？</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>人工检查点</strong>
                  <small>谁必须确认目标快照？</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>时间与状态边界</strong>
                  <small>何时停止，停下时保存什么？</small>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>执行、核验与恢复</strong>
                  <small>Host 执行；结果决定完成还是移交</small>
                </div>
              </li>
            </ol>
          </article>
        </div>

        <div className="harness-boundaries-key-reveal">
          <span>关键分离</span>
          <p>
            模型给出的是<strong>候选动作</strong>；应用侧 Host 才会执行代码。中间的 Harness
            决定这次 Run 能否继续、何时暂停，以及中断后从哪里恢复。
          </p>
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="本课说的 Harness，处在什么层级？"
        lead="它不是模型的新名字，也不是某个框架的固定产品模块。"
      >
        <p className="harness-boundaries-scope-note">
          <strong>本课采用一个工程视角：</strong>
          把模型周围负责策略、运行状态、执行编排与恢复的系统统称为 Harness。不同厂商可能把这些能力叫
          Runner、Runtime、Orchestrator、Host 或 Middleware；这里不把术语包装成行业统一定义。
        </p>

        <div className="harness-boundaries-layer-map">
          <article>
            <span>01 · MODEL</span>
            <strong>提出候选行动</strong>
            <p>根据目标与当前观察，给出下一项工具调用及参数。</p>
            <small>输出：建议</small>
          </article>
          <i aria-hidden="true">→</i>
          <article className="is-harness">
            <span>02 · HARNESS</span>
            <strong>控制整个 Run</strong>
            <p>收紧权限作用域、暂停审批、追踪预算、保存状态并选择恢复或移交。</p>
            <small>输出：可执行的运行决定</small>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <span>03 · HOST + TOOL</span>
            <strong>改变外部世界</strong>
            <p>应用代码执行动作，工具与环境返回可观察结果。</p>
            <small>输出：事实与副作用</small>
          </article>
        </div>

        <div className="harness-boundaries-level-difference">
          <div>
            <span>上一层：工具契约</span>
            <p>约束一次调用的输入、授权、结果核验与幂等语义。</p>
          </div>
          <div>
            <span>本课新增：Run 级边界</span>
            <p>控制跨多步的权限作用域、总时间预算、检查点、暂停、恢复与人工移交。</p>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="同一次超时，为什么有时能恢复？"
        lead="沿同一条六步 Run，只改变检查点，观察系统应该继续还是停止。"
      >
        <BoundaryRouteLab />
        <p className="harness-boundaries-lab-note">
          实验只展示动作建议、策略结果、运行状态与环境证据；不展示或仿造模型的隐藏思维过程。
        </p>
      </LessonSection>

      <LessonSection
        number="04"
        title="四类边界，回答四个不同问题"
        lead="把它们混成一个“安全开关”，就无法解释系统为什么停、还能不能继续。"
      >
        <div className="harness-boundaries-boundary-grid">
          <article>
            <span>PERMISSION SCOPE</span>
            <strong>这次 Run 最多能做什么？</strong>
            <p>把资源、动作与凭证范围收紧到当前任务；越界时明确进入 blocked。</p>
            <small>证据：授权策略 + 目标集合</small>
          </article>
          <article>
            <span>APPROVAL</span>
            <strong>现在是否应该继续？</strong>
            <p>敏感动作可在执行前暂停，把目标快照交给指定角色批准或拒绝。</p>
            <small>证据：审批人 + 决定 + 绑定快照</small>
          </article>
          <article>
            <span>TIME / STEP BUDGET</span>
            <strong>运行到什么时候必须停？</strong>
            <p>总时长或最大迭代数是可测量的停止条件；到达上限应产生中断状态。</p>
            <small>证据：预算 + 已用量 + 停止原因</small>
          </article>
          <article>
            <span>CHECKPOINT / RECOVERY</span>
            <strong>停下后从哪里继续？</strong>
            <p>检查点保存可恢复状态；恢复前仍需用工具回读外部世界，确认已发生的副作用。</p>
            <small>证据：状态快照 + 游标 + 回读结果</small>
          </article>
        </div>

        <div className="harness-boundaries-checkpoint-warning">
          <span aria-hidden="true">!</span>
          <div>
            <strong>检查点不是“撤销”按钮</strong>
            <p>
              它证明 Harness 保存了什么，不自动撤销外部系统已经发生的写入。恢复设计还要说明：先回读什么、哪些动作可安全重试、哪些必须补偿或人工处理。
            </p>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        number="05"
        title="不要只记录“成功 / 失败”"
        lead="可控运行需要让下一位接手者知道：发生了什么、证据在哪里、下一步允许做什么。"
      >
        <div
          aria-label="四种运行状态及其所需证据；可横向滚动"
          className="harness-boundaries-state-table-wrap"
          role="region"
          tabIndex={0}
        >
          <table className="harness-boundaries-state-table">
            <caption className="visually-hidden">
              Harness 运行状态、含义、必要证据与安全下一步
            </caption>
            <thead>
              <tr>
                <th scope="col">状态</th>
                <th scope="col">它说明什么</th>
                <th scope="col">必须保留的证据</th>
                <th scope="col">允许的下一步</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">BLOCKED</th>
                <td>动作越过权限作用域，尚未执行</td>
                <td>建议、目标集合、拒绝策略</td>
                <td>缩小范围或申请新权限</td>
              </tr>
              <tr>
                <th scope="row">WAITING APPROVAL</th>
                <td>权限通过，但人的决定尚未到达</td>
                <td>待审快照、审批角色、运行状态</td>
                <td>批准、拒绝或继续暂停</td>
              </tr>
              <tr>
                <th scope="row">COMPLETED + VERIFIED</th>
                <td>动作完成，环境回读满足完成标准</td>
                <td>执行结果、回读结果、目标快照</td>
                <td>交付结果并关闭 Run</td>
              </tr>
              <tr>
                <th scope="row">INTERRUPTED</th>
                <td>预算耗尽或系统中断，完成状态未定</td>
                <td>停止原因、检查点、外部状态回读</td>
                <td>恢复、补偿或移交人工</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="harness-boundaries-state-principle">
          <strong>状态名称不是装饰。</strong>
          <p>
            它决定自动化还能做什么。把 interrupted 写成 failed，可能丢掉可恢复位置；把 tool returned 写成 completed，又可能跳过环境核验。
          </p>
        </div>
      </LessonSection>

      <LessonSection
        number="06"
        title="五问判断一次 Run 能否被接手"
        lead="用五个可观察问题复盘边界，不需要再填写一份长文本作业。"
      >
        <ol className="harness-boundaries-review-questions">
          <li>
            <span>01</span>
            <div>
              <strong>模型建议了什么？</strong>
              <p>把建议与实际执行者分开写，避免把 tool call 当成既成事实。</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>这次 Run 的权限作用域是什么？</strong>
              <p>明确资源、动作、凭证和越界后的 blocked 状态。</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>什么条件必须暂停？</strong>
              <p>绑定审批角色、目标快照、超时或最大步数，而不是笼统写“必要时人工确认”。</p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <strong>检查点保存什么事实？</strong>
              <p>至少说明运行状态、进度游标、授权/审批凭证与待核验副作用。</p>
            </div>
          </li>
          <li>
            <span>05</span>
            <div>
              <strong>谁能证明可以恢复？</strong>
              <p>用环境回读决定继续、补偿或移交；不要凭模型记忆猜测外部状态。</p>
            </div>
          </li>
        </ol>
      </LessonSection>

      <LessonTakeaway>
        模型能力决定它能提出什么；
        <strong>Harness 边界决定这些建议怎样安全地成为可追踪、可停止、可恢复的动作。</strong>
      </LessonTakeaway>
    </div>
  );
}
