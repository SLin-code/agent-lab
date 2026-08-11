import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { LoopDiagnosticLab } from "./labs/LoopDiagnosticLab";

export function SignalDrivenLoopLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="signal-driven-loop-lesson">
      <LessonSection
        number="01"
        title="重复发生了，不代表循环成立了"
        lead="先看两个外表相似、工程含义完全不同的过程。"
      >
        <div className="sdl-opening-compare">
          <article className="is-blind">
            <div className="sdl-opening-heading">
              <span>BLIND RETRY</span>
              <small>只有次数变化</small>
            </div>
            <ol aria-label="机械重试三次">
              <li><b>01</b><span>发送相同请求</span><em>失败</em></li>
              <li><b>02</b><span>发送相同请求</span><em>失败</em></li>
              <li><b>03</b><span>发送相同请求</span><em>失败</em></li>
            </ol>
            <p>没有先判断失败是否瞬时、动作是否已经发生，也没有改变策略。</p>
          </article>

          <article className="is-engineered">
            <div className="sdl-opening-heading">
              <span>ENGINEERED LOOP</span>
              <small>每轮都产生新判断</small>
            </div>
            <ol aria-label="观察驱动的三轮循环">
              <li><b>01</b><span>观察：瞬时超时且未写入</span><em>RETRY</em></li>
              <li><b>02</b><span>观察：输入违反确定规则</span><em>REPAIR</em></li>
              <li><b>03</b><span>观察：完成，或越过权限边界</span><em>STOP / ESCALATE</em></li>
            </ol>
            <p>观察改变评估，评估再决定下一拍是否还应由自动化执行。</p>
          </article>
        </div>
        <div className="sdl-opening-rule">
          <span>判断线</span>
          <p>
            <strong>重试</strong>只是四种后续决定之一。循环工程还要知道何时改动作、何时完成，以及何时把控制权交出去。
          </p>
        </div>
      </LessonSection>

      <LessonSection
        number="02"
        title="四种决定，不是四个报错标签"
        lead="决定来自环境证据与边界的组合，而不是只看一句错误信息。"
      >
        <div className="sdl-decision-grid">
          <article>
            <span>RETRY</span>
            <h3>动作不变，时机改变</h3>
            <p>失败可恢复、确认没有副作用，并且尝试预算仍允许再次执行。</p>
            <small>证据例：503 + write_count=0 + Retry-After</small>
          </article>
          <article>
            <span>REPAIR</span>
            <h3>先改状态或动作</h3>
            <p>同样输入还会失败；先修正参数、上下文、计划或工具选择，再进入下一轮。</p>
            <small>证据例：确定性校验失败 + 明确缺失字段</small>
          </article>
          <article>
            <span>STOP</span>
            <h3>完成标准已经满足</h3>
            <p>环境回读证明目标达成；继续行动只会浪费预算或制造重复副作用。</p>
            <small>证据例：accepted=100 + receipt 可核验</small>
          </article>
          <article>
            <span>ESCALATE</span>
            <h3>自动化边界已经到达</h3>
            <p>缺少权限、关键事实或剩余预算时，把当前状态和证据交给人或上级系统。</p>
            <small>证据例：required_approval=missing</small>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="逐拍诊断一次循环"
        lead="不要沿箭头兜圈；读完每轮的新证据，再看下一拍为什么改变。"
      >
        <LoopDiagnosticLab />
        <p className="sdl-lab-note">
          最后一拍只改变“审批证据是否存在”。此前的目标、请求、失败与修复保持相同，因此 STOP / ESCALATE 的分叉可以归因。
        </p>
      </LessonSection>

      <LessonSection
        number="04"
        title="一次观察，还不够做决定"
        lead="同一个 timeout 可能应该重试，也可能必须先核对副作用。"
      >
        <div className="sdl-signal-stack">
          <article>
            <span>01 · RESULT</span>
            <strong>工具或环境返回了什么？</strong>
            <p>错误码、校验结果、执行回执与回读状态，是这一拍的新事实。</p>
          </article>
          <i aria-hidden="true">+</i>
          <article>
            <span>02 · SIDE EFFECT</span>
            <strong>动作可能已经发生了吗？</strong>
            <p>超时只说明响应没回来；重试前仍要查询幂等键、写入计数或外部状态。</p>
          </article>
          <i aria-hidden="true">+</i>
          <article>
            <span>03 · BOUNDARY</span>
            <strong>预算与权限还允许什么？</strong>
            <p>即使存在修复方案，权限不足或尝试上限已到，也应停止自动循环。</p>
          </article>
        </div>
        <div className="sdl-evaluation-formula">
          <span>评估不是复述报错</span>
          <strong>结果事实 + 副作用事实 + 运行边界 → 下一拍决定</strong>
        </div>
      </LessonSection>

      <LessonSection
        number="05"
        title="给循环一个可审查的出口"
        lead="没有退出语义的循环，只是把不确定性拖得更久。"
      >
        <div className="sdl-exit-checks">
          <article>
            <span>完成出口</span>
            <h3>什么环境事实一出现就必须 STOP？</h3>
            <p>完成标准要能被回读，不以模型说“完成了”为依据。</p>
          </article>
          <article>
            <span>控制出口</span>
            <h3>什么边界一到就必须 ESCALATE？</h3>
            <p>最大轮数、总时间、成本、权限与关键事实缺口都应成为显式状态。</p>
          </article>
          <article>
            <span>修正入口</span>
            <h3>什么证据允许下一轮继续？</h3>
            <p>记录观察如何改变动作；如果什么都没变，就要证明重试确实合理。</p>
          </article>
        </div>
      </LessonSection>

      <LessonTakeaway>
        循环的价值不在于“再来一次”；
        <strong>而在于让新观察持续改变下一步，并在完成或越界时可靠退出。</strong>
      </LessonTakeaway>
    </div>
  );
}
