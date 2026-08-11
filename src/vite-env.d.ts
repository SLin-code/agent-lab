/// <reference types="vite/client" />

declare module "virtual:agent-path-lesson-modules" {
  import type {
    Lesson,
    LessonComponent,
  } from "./content/curriculum/types";

  export const lessonMetaModules: Record<
    string,
    { default: Lesson }
  >;
  export const lessonComponentModules: Record<
    string,
    () => Promise<{ default: LessonComponent }>
  >;
}
