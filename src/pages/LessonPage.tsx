import { Component, Suspense, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { LessonShell } from "../components/layout/LessonShell";
import { LessonHero } from "../components/lesson/LessonHero";
import {
  domainById,
  lessonDefinitionBySlug,
  readyLessonDefinitionBySlug,
} from "../content/curriculum/catalog";
import { NotFoundPage } from "./NotFoundPage";

class LessonLoadBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="lesson-loading" role="alert">
          <strong>课程内容加载失败</strong>
          <p>网络中断或网站刚刚更新。重新加载后会获取最新课程文件。</p>
          <button
            className="button button-primary"
            onClick={() => window.location.reload()}
            type="button"
          >
            重新加载课程
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function LessonPage() {
  const { slug } = useParams();
  const availableLessons = import.meta.env.DEV
    ? lessonDefinitionBySlug
    : readyLessonDefinitionBySlug;
  const definition = slug ? availableLessons.get(slug) : undefined;
  const domain = definition
    ? domainById.get(definition.meta.domainId)
    : undefined;
  if (!definition || !domain) return <NotFoundPage />;

  const { meta: lesson, Component: LessonBody } = definition;

  return (
    <LessonShell key={lesson.id} lesson={lesson}>
      <LessonHero domain={domain} lesson={lesson} />
      <LessonLoadBoundary>
        <Suspense
          fallback={
            <div className="lesson-loading" role="status">
              课程内容加载中…
            </div>
          }
        >
          <LessonBody lesson={lesson} />
        </Suspense>
      </LessonLoadBoundary>
    </LessonShell>
  );
}
