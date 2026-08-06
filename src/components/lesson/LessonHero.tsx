import type {
  KnowledgeDomain,
  Lesson,
} from "../../content/curriculum/catalog";

const audienceLabels = {
  all: "面向所有人",
  beginner: "面向初学者",
  developer: "面向开发者",
} as const;

export function LessonHero({
  lesson,
  domain,
}: {
  lesson: Lesson;
  domain: KnowledgeDomain;
}) {
  return (
    <header className="lesson-hero">
      <div className="lesson-meta">
        <span>
          阶段 {String(domain.order).padStart(2, "0")} · {domain.shortTitle}
        </span>
        <span className={`stability stability-${lesson.stability}`}>
          {lesson.stability}
        </span>
        <span>{lesson.durationMinutes} 分钟</span>
        <span>{audienceLabels[lesson.audience]}</span>
      </div>
      <h1>{lesson.title}</h1>
      <p>{lesson.summary}</p>
      <div className="lesson-thesis">
        {lesson.thesis.statement}
        <strong>{lesson.thesis.emphasis}</strong>
      </div>
      <ul className="lesson-objectives" aria-label="本课学习目标">
        {lesson.objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
    </header>
  );
}
