import type { ComponentType } from "react";

export type Stability = "stable" | "converging" | "frontier";
export type LessonStatus = "draft" | "review" | "ready";
export type Audience = "all" | "beginner" | "developer";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verifiedAt: string;
  supports: string;
}

export interface KnowledgeDomain {
  id: string;
  order: number;
  shortTitle: string;
  title: string;
  summary: string;
}

export interface LearningOutput {
  title: string;
  description: string;
  prompt: string;
  criteria: readonly string[];
  placeholder?: string;
}

export interface Lesson {
  schemaVersion: 1;
  id: string;
  slug: string;
  domainId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  audience: Audience;
  stability: Stability;
  status: LessonStatus;
  tags: readonly string[];
  objectives: readonly string[];
  prerequisites: readonly string[];
  thesis: {
    statement: string;
    emphasis: string;
  };
  output: LearningOutput;
  sources: readonly Source[];
  lastVerified: string;
}

export interface LessonDefinition {
  meta: Lesson;
  Component: ComponentType<{ lesson: Lesson }>;
}

export function defineDomain(domain: KnowledgeDomain) {
  return domain;
}

export function defineLesson(definition: LessonDefinition) {
  return definition;
}
