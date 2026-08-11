import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";
import { RegressionMatrixLab } from "./labs/RegressionMatrixLab";

export function EvalRegressionLesson({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <div className="eval-regression-lesson">
      <LessonSection
        number="01"
        title="一段顺滑 Demo，只覆盖了一条路径"
        lead="把“看起来会做”与“在真实分布里稳定完成”分开。"
      >
        <div className="eval-regression-demo-contrast">
          <article className="eval-regression-demo-card">
            <div>
              <span>HAND-PICKED DEMO</span>
              <small>购买 3 天 · 未拆封</small>
            </div>
            <p>Agent 读取 return-v7，判断 ALLOW，并给出正确依据。</p>
            <strong>PASS · 1 / 1</strong>
          </article>
          <div className="eval-regression-demo-gap" aria-hidden="true">≠</div>
          <article className="eval-regression-distribution-card">
            <div>
              <span>REAL DISTRIBUTION</span>
              <small>典型 · 边界 · 例外 · 证据缺口</small>
            </div>
            <div className="eval-regression-mini-matrix" aria-label="真实分布包含多个尚未检查的样本簇">
              {Array.from({ length: 8 }, (_, index) => (
                <i className={index === 0 ? "is-known" : ""} key={index} />
              ))}
            </div>
            <strong>UNKNOWN · 其余路径尚未被测量</strong>
          </article>
        </div>
        <p className="eval-regression-key-note">
          <strong>Demo 是样本，不是分布。</strong>
          它可以验证产品方向，却不能回答边界输入、证据缺失、工具异常或下一次变更会不会破坏旧能力。
        </p>
      </LessonSection>

      <LessonSection
        number="02"
        title="可靠性需要四份能互相接上的证据"
        lead="每一份都回答不同问题，缺一份就会留下盲区。"
      >
        <div className="eval-regression-evidence-set">
          <article>
            <span>01 · FAILURE BANK</span>
            <h3>失败样本簇</h3>
            <p>从日志、人工复核和生产异常中收集典型、边界、对抗与证据缺口。</p>
            <strong>它回答：哪里真的会坏？</strong>
          </article>
          <article>
            <span>02 · EVAL CONTRACT</span>
            <h3>可判定 Eval</h3>
            <p>把成功写成可检查的结果、环境后置条件或经校准的评分标准。</p>
            <strong>它回答：怎样才算对？</strong>
          </article>
          <article>
            <span>03 · TARGETED FIX</span>
            <h3>有边界的修复</h3>
            <p>先定位失败发生在上下文、决策、工具、Harness 还是环境结果，再修改对应层。</p>
            <strong>它回答：为什么会变好？</strong>
          </article>
          <article>
            <span>04 · REGRESSION</span>
            <h3>全量回归</h3>
            <p>失败样本复测后，仍要重跑旧能力，防止一个补丁制造新的行为倒退。</p>
            <strong>它回答：别处仍然好吗？</strong>
          </article>
        </div>
      </LessonSection>

      <LessonSection
        number="03"
        title="让一次成功经得住样本簇与回归"
        lead="每次只推进一种证据，观察矩阵里哪一格改变、为什么改变。"
      >
        <RegressionMatrixLab />
        <p className="eval-regression-lab-note">
          实验中的输出状态、政策版本和样本结果都是可审查事实；不展示或仿造模型的隐藏思维过程。
        </p>
      </LessonSection>

      <LessonSection
        number="04"
        title="分数告诉你哪里变了，Trace 帮你判断为什么"
        lead="只看总分容易把偶然波动、错误判据和真实回归混在一起。"
      >
        <div className="eval-regression-score-trace">
          <article>
            <span>OUTCOME VIEW</span>
            <h3>结果矩阵</h3>
            <dl>
              <div><dt>任务结果</dt><dd>ALLOW / DENY / WAIT / ESCALATE</dd></div>
              <div><dt>环境状态</dt><dd>是否发生不允许的副作用</dd></div>
              <div><dt>回归差异</dt><dd>哪些旧样本由通过变成失败</dd></div>
            </dl>
            <strong>适合快速发现变化</strong>
          </article>
          <article>
            <span>TRACE VIEW</span>
            <h3>运行记录</h3>
            <dl>
              <div><dt>看见</dt><dd>policy=return-v7；日期文本=两周前</dd></div>
              <div><dt>动作</dt><dd>relative_date_resolver 未被调用</dd></div>
              <div><dt>观察</dt><dd>解析值缺失；仍输出 ALLOW</dd></div>
            </dl>
            <strong>适合定位失败层级</strong>
          </article>
        </div>
        <p className="eval-regression-reading-rule">
          <strong>正确顺序：</strong>
          先用结果判据确认“真的失败”，再读少量 Trace 定位“失败发生在哪里”，最后把这个失败固化成回归样本。
        </p>
      </LessonSection>

      <LessonSection
        number="05"
        title="三个看似在做 Eval 的反模式"
        lead="它们都有数字或样本，但仍不能支撑可靠性判断。"
      >
        <div className="eval-regression-antipatterns">
          <article>
            <span>ONE GOLDEN PATH</span>
            <h3>反复跑同一个顺滑 Demo</h3>
            <p>样本数增加了，覆盖面没有增加。把真实失败按原因聚成簇，才能看见能力边界。</p>
            <strong>缺失：代表性样本分布</strong>
          </article>
          <article>
            <span>VAGUE GRADER</span>
            <h3>只问“回答质量好吗？”</h3>
            <p>主观分数无法证明动作后置条件，也难以区分判据漂移与 Agent 退化。</p>
            <strong>缺失：可复核成功标准</strong>
          </article>
          <article>
            <span>PATCH-ONLY TEST</span>
            <h3>修好失败样本就直接发布</h3>
            <p>局部复测证明补丁命中原问题；只有全量回归能检查旧能力有没有倒退。</p>
            <strong>缺失：变更后的回归证据</strong>
          </article>
        </div>
      </LessonSection>

      <LessonTakeaway>
        一次成功可以开启实验；
        <strong>失败样本、可判定 Eval、针对性修复与全量回归，才把偶然成功变成可重复能力。</strong>
      </LessonTakeaway>
    </div>
  );
}
