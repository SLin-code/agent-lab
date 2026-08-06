import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../../app/ProgressContext";
import { LearningOutput } from "../lesson/LearningOutput";
import { LessonSources } from "../lesson/LessonSources";
import {
  domains,
  lessons,
  type Lesson,
} from "../../content/curriculum/catalog";

export function LessonShell({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: ReactNode;
}) {
  const { completed, toggleComplete } = useProgress();
  const isComplete = completed.has(lesson.id);

  return (
    <main className="lesson-layout">
      <aside className="lesson-rail" aria-label="课程目录">
        <Link className="rail-back" to="/">
          ← 返回学习路径
        </Link>
        <ol className="rail-stages">
          {domains.map((domain) => {
            const stageLessons = lessons.filter(
              (item) =>
                item.domainId === domain.id && item.status === "ready",
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
        <LearningOutput lessonId={lesson.id} output={lesson.output} />
        <LessonSources sources={lesson.sources} />
        <div className="lesson-complete">
          <div>
            <strong>
              {isComplete ? "这一课已完成" : "完成这一课了吗？"}
            </strong>
            <p>
              {isComplete
                ? "进度已保存在当前浏览器。"
                : "标记后可以在学习路径中看到进度。"}
            </p>
          </div>
          <button
            aria-pressed={isComplete}
            className={
              isComplete
                ? "button button-success"
                : "button button-primary"
            }
            onClick={() => toggleComplete(lesson.id)}
            type="button"
          >
            {isComplete ? "✓ 已完成" : "标记为完成"}
          </button>
        </div>
      </article>
    </main>
  );
}
