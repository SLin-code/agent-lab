import type { ComponentType, LazyExoticComponent } from "react";

export type Stability = "stable" | "converging" | "frontier";
export type LessonStatus = "draft" | "review" | "ready";
export type Audience = "all" | "beginner" | "developer";
export type InteractionKind =
  | "prediction"
  | "trace"
  | "simulation"
  | "debugger"
  | "builder";

export interface LearningObjective {
  id: string;
  text: string;
}

export interface LearningInteraction {
  id: string;
  kind: InteractionKind;
  title: string;
  objectiveIds: readonly string[];
  resettable: boolean;
  deterministic: boolean;
}

export interface Claim {
  id: string;
  statement: string;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verifiedAt: string;
  supportsClaimIds: readonly string[];
}

export interface KnowledgeDomain {
  id: string;
  order: number;
  shortTitle: string;
  title: string;
  summary: string;
}

export interface OutputCriterion {
  id: string;
  text: string;
  legacyIndex?: number;
}

export interface LearningOutput {
  revision: number;
  title: string;
  description: string;
  prompt: string;
  transferPrompt: string;
  objectiveIds: readonly string[];
  criteria: readonly OutputCriterion[];
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
  objectives: readonly LearningObjective[];
  interactions: readonly LearningInteraction[];
  prerequisites: readonly string[];
  thesis: {
    statement: string;
    emphasis: string;
  };
  output: LearningOutput;
  claims: readonly Claim[];
  sources: readonly Source[];
  lastVerified?: string;
}

export interface LessonComponentProps {
  lesson: Lesson;
}

export type LessonComponent = ComponentType<LessonComponentProps>;

export interface LessonDefinition {
  meta: Lesson;
  Component: LazyExoticComponent<LessonComponent>;
}

export function defineDomain(domain: KnowledgeDomain) {
  return domain;
}

export function defineLessonMeta(meta: Lesson) {
  return meta;
}
