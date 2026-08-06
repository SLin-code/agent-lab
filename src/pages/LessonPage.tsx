import { useParams } from "react-router-dom";
import { LessonShell } from "../components/layout/LessonShell";
import { LessonHero } from "../components/lesson/LessonHero";
import {
  domainById,
  lessonDefinitionBySlug,
} from "../content/curriculum/catalog";
import { NotFoundPage } from "./NotFoundPage";

export function LessonPage() {
  const { slug } = useParams();
  const definition = slug
    ? lessonDefinitionBySlug.get(slug)
    : undefined;
  const domain = definition
    ? domainById.get(definition.meta.domainId)
    : undefined;
  if (!definition || !domain) return <NotFoundPage />;

  const { meta: lesson, Component: LessonBody } = definition;

  return (
    <LessonShell lesson={lesson}>
      <LessonHero domain={domain} lesson={lesson} />
      <LessonBody lesson={lesson} />
    </LessonShell>
  );
}
