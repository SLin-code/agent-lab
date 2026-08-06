import { Link } from "react-router-dom";
import { useProgress } from "../app/ProgressContext";
import { lessons, stages } from "../content/course-manifest";

export function HomePage() {
  const firstLesson = lessons[0];
  const { completed } = useProgress();

  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">INTERACTIVE AGENT SYSTEMS COURSE</div>
          <h1>
            不要只读懂 Agent。
            <br />
            <em>亲手让它运行。</em>
          </h1>
          <p>
            从一次模型调用出发，逐步搭出 Context、Harness、Loop、Graph
            与持续改进系统。每个概念都能操作，每个系统都允许失败。
          </p>
          <div className="hero-actions">
            <Link
              className="button button-primary"
              to={"/lesson/" + firstLesson.slug}
            >
              开始第一课
            </Link>
            <button
              className="text-link"
              type="button"
              onClick={() =>
                document.getElementById("path")?.scrollIntoView()
              }
            >
              查看完整路径 ↓
            </button>
          </div>
          <div className="hero-meta">
            <span>
              <strong>9</strong> 个阶段
            </span>
            <span>
              <strong>36</strong> 课规划
            </span>
            <span>
              <strong>0</strong> API Key 起步
            </span>
          </div>
        </div>
        <div className="hero-loop" aria-label="Agent 反馈回路示意图">
          <div className="loop-orbit orbit-one">
            <span>观察</span>
          </div>
          <div className="loop-orbit orbit-two">
            <span>行动</span>
          </div>
          <div className="loop-orbit orbit-three">
            <span>验证</span>
          </div>
          <div className="loop-core">
            <span>MODEL</span>
            <strong>下一步？</strong>
          </div>
          <div className="loop-caption">
            目标 → 决策 → 工具 → 反馈 → 终止
          </div>
        </div>
      </section>

      <section className="course-principles" aria-label="课程原则">
        <div>
          <span>01</span>
          <strong>直觉先行</strong>
          <p>先形成可以操作的心智模型。</p>
        </div>
        <div>
          <span>02</span>
          <strong>故障驱动</strong>
          <p>通过超时、越权和崩溃理解系统。</p>
        </div>
        <div>
          <span>03</span>
          <strong>过程可见</strong>
          <p>观察路径、状态与反馈如何改变下一步。</p>
        </div>
      </section>

      <section className="learning-path" id="path">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEARNING PATH</span>
            <h2>从 Prompt 到 Durable Graph</h2>
          </div>
          <p>第一课已经可以体验，其余课程会沿这条主线逐步开放。</p>
        </div>
        <ol className="stage-list">
          {stages.map((stage) => {
            const stageLessons = lessons.filter(
              (lesson) => lesson.stageId === stage.id,
            );
            const ready = stageLessons.some(
              (lesson) => lesson.status === "ready",
            );
            return (
              <li
                className={ready ? "stage-card is-ready" : "stage-card"}
                key={stage.id}
              >
                <div className="stage-index">
                  {String(stage.order).padStart(2, "0")}
                </div>
                <div className="stage-content">
                  <span className="stage-kicker">{stage.shortTitle}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.summary}</p>
                  {stageLessons.map((lesson) => (
                    <Link
                      className="stage-lesson-link"
                      to={"/lesson/" + lesson.slug}
                      key={lesson.id}
                    >
                      <span>{completed.has(lesson.id) ? "✓" : "▶"}</span>
                      {lesson.title}
                      <small>{lesson.duration} min</small>
                    </Link>
                  ))}
                </div>
                <span
                  className={
                    ready ? "status status-ready" : "status"
                  }
                >
                  {ready ? "可学习" : "规划中"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
