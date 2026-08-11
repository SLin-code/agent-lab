import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../../app/ProgressContext";
import {
  LearningOutput,
  type LearningOutputStorageStatus,
} from "../lesson/LearningOutput";
import { LessonSources } from "../lesson/LessonSources";
import {
  domains,
  readyLessons,
  type Lesson,
} from "../../content/curriculum/catalog";

export function LessonShell({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: ReactNode;
}) {
  const {
    isComplete: readComplete,
    persistenceStatus,
    toggleComplete,
  } = useProgress();
  const isComplete = readComplete(lesson.id, lesson.output.revision);
  const [outputReady, setOutputReady] = useState(false);
  const [outputStorageStatus, setOutputStorageStatus] =
    useState<LearningOutputStorageStatus>("saving");
  const progressMessage =
    persistenceStatus === "memory-only"
      ? "浏览器未允许本地保存；本次状态仅在当前页面有效，刷新后可能丢失。"
      : persistenceStatus === "saving"
        ? "正在保存当前浏览器中的学习进度…"
        : outputStorageStatus === "error"
          ? "完成状态可以记录，但学习输出未自动保存；请先复制输出。"
          : isComplete && outputStorageStatus === "saving"
            ? "完成状态已记录，学习输出仍在保存…"
            : isComplete
              ? "进度已保存在当前浏览器。"
              : outputReady
                ? "学习输出与自检已完成，可以记录进度。"
                : "完成学习输出和全部自检后，才能标记完成。";

  return (
    <main className="lesson-layout">
      <aside className="lesson-rail" aria-label="课程目录">
        <Link className="rail-back" to="/">
          ← 返回学习路径
        </Link>
        <ol className="rail-stages">
          {domains.map((domain) => {
            const stageLessons = readyLessons.filter(
              (item) => item.domainId === domain.id,
            );
            return (
              <li
                className={
                  domain.id === lesson.domainId ? "is-current" : ""
                }
                key={domain.id}
              >
                <span className="rail-stage-number">
                  {String(domain.order).padStart(2, "0")}
                </span>
                <span>{domain.shortTitle}</span>
                {stageLessons.map((item) => (
                  <Link
                    aria-current={
                      item.id === lesson.id ? "page" : undefined
                    }
                    className={
                      item.id === lesson.id
                        ? "rail-lesson is-active"
                        : "rail-lesson"
                    }
                    to={"/lesson/" + item.slug}
                    key={item.id}
                  >
                    {item.title}
                  </Link>
                ))}
              </li>
            );
          })}
        </ol>
      </aside>
      <article className="lesson-article">
        {children}
        <LearningOutput
          key={`${lesson.id}:${lesson.output.revision}`}
          lessonId={lesson.id}
          onReadyChange={setOutputReady}
          onStorageStatusChange={setOutputStorageStatus}
          output={lesson.output}
        />
        <LessonSources claims={lesson.claims} sources={lesson.sources} />
        <div className="lesson-complete">
          <div>
            <strong>
              {isComplete ? "这一课已完成" : "完成这一课了吗？"}
            </strong>
            <p aria-live="polite">{progressMessage}</p>
          </div>
          <button
            aria-pressed={isComplete}
            className={
              isComplete
                ? "button button-success"
                : "button button-primary"
            }
            disabled={!isComplete && !outputReady}
            onClick={() =>
              toggleComplete(lesson.id, lesson.output.revision)
            }
            type="button"
          >
            {isComplete
              ? persistenceStatus === "memory-only"
                ? "✓ 本次已完成"
                : "✓ 已完成"
              : outputReady
                ? "标记为完成"
                : "先完成本课输出"}
          </button>
        </div>
      </article>
    </main>
  );
}
