import { useParams } from "react-router-dom";
import { LessonShell } from "../components/layout/LessonShell";
import { lessonBySlug } from "../content/course-manifest";
import { AgentOrNotLesson } from "../content/lessons/AgentOrNotLesson";
import { NotFoundPage } from "./NotFoundPage";

const lessonRegistry = {
  "agent-or-not": AgentOrNotLesson,
};

export function LessonPage() {
  const { slug } = useParams();
  const lesson = slug ? lessonBySlug.get(slug) : undefined;
  if (!lesson) return <NotFoundPage />;

  const LessonBody =
    lessonRegistry[lesson.id as keyof typeof lessonRegistry];
  if (!LessonBody) return <NotFoundPage />;

  return (
    <LessonShell lesson={lesson}>
      <LessonBody lesson={lesson} />
    </LessonShell>
  );
}
