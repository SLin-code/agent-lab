import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../../app/ProgressContext";
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
  const isComplete = readComplete(lesson.id, lesson.revision);
  const currentLessonIndex = readyLessons.findIndex(
    (item) => item.id === lesson.id,
  );
  const nextLesson =
    currentLessonIndex >= 0
      ? readyLessons[currentLessonIndex + 1]
      : undefined;
  const progressMessage =
    persistenceStatus === "memory-only"
      ? "浏览器未允许本地保存；本次状态仅在当前页面有效，刷新后可能丢失。"
      : persistenceStatus === "saving"
        ? "正在保存当前浏览器中的学习进度…"
        : isComplete
          ? "进度已保存在当前浏览器。"
          : "理解本课关键判断后即可记录进度，不需要提交文字作业。";

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
            onClick={() => toggleComplete(lesson.id, lesson.revision)}
            type="button"
          >
            {isComplete
              ? persistenceStatus === "memory-only"
                ? "✓ 本次已完成"
                : "✓ 已完成"
              : "标记为已学"}
          </button>
        </div>
        <nav className="lesson-next" aria-label="继续学习">
          {nextLesson ? (
            <Link className="button" to={`/lesson/${nextLesson.slug}`}>
              下一课 · {nextLesson.title} →
            </Link>
          ) : (
            <Link className="button" to="/">
              返回学习路径 →
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
