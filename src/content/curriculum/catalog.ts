import type {
  KnowledgeDomain,
  Lesson,
  LessonDefinition,
} from "./types";

type DomainModule = { default: KnowledgeDomain };
type LessonModule = { default: LessonDefinition };

const domainModules = import.meta.glob<DomainModule>(
  "../domains/*/domain.ts",
  { eager: true },
);

const lessonModules = import.meta.glob<LessonModule>(
  "../domains/*/lessons/*/index.tsx",
  { eager: true },
);

function assertUnique<T>(
  items: readonly T[],
  readKey: (item: T) => string,
  label: string,
) {
  const seen = new Set<string>();
  for (const item of items) {
    const key = readKey(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`);
    }
    seen.add(key);
  }
}

export const domains = Object.values(domainModules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order);

export const lessonDefinitions = Object.values(lessonModules)
  .map((module) => module.default)
  .sort((a, b) => {
    const domainOrder =
      domains.find((domain) => domain.id === a.meta.domainId)?.order ?? 0;
    const otherDomainOrder =
      domains.find((domain) => domain.id === b.meta.domainId)?.order ?? 0;
    return domainOrder - otherDomainOrder || a.meta.order - b.meta.order;
  });

export const lessons: Lesson[] = lessonDefinitions.map(
  (definition) => definition.meta,
);

assertUnique(domains, (domain) => domain.id, "domain id");
assertUnique(domains, (domain) => String(domain.order), "domain order");
assertUnique(lessons, (lesson) => lesson.id, "lesson id");
assertUnique(lessons, (lesson) => lesson.slug, "lesson slug");
assertUnique(
  lessons,
  (lesson) => `${lesson.domainId}:${lesson.order}`,
  "lesson order within domain",
);

for (const lesson of lessons) {
  if (!domains.some((domain) => domain.id === lesson.domainId)) {
    throw new Error(
      `Lesson ${lesson.id} references unknown domain ${lesson.domainId}`,
    );
  }
  if (lesson.status === "ready" && lesson.sources.length === 0) {
    throw new Error(`Ready lesson ${lesson.id} must declare sources`);
  }
  if (lesson.status === "ready" && lesson.output.criteria.length === 0) {
    throw new Error(`Ready lesson ${lesson.id} must define a learning output`);
  }
  assertUnique(
    lesson.sources,
    (source) => source.id,
    `source id in lesson ${lesson.id}`,
  );
}

for (const lesson of lessons) {
  for (const prerequisite of lesson.prerequisites) {
    if (!lessons.some((candidate) => candidate.id === prerequisite)) {
      throw new Error(
        `Lesson ${lesson.id} references unknown prerequisite ${prerequisite}`,
      );
    }
  }
}

export const domainById = new Map(
  domains.map((domain) => [domain.id, domain]),
);

export const lessonBySlug = new Map(
  lessons.map((lesson) => [lesson.slug, lesson]),
);

export const lessonDefinitionBySlug = new Map(
  lessonDefinitions.map((definition) => [
    definition.meta.slug,
    definition,
  ]),
);

export type {
  KnowledgeDomain,
  Lesson,
  LessonDefinition,
  LearningOutput,
  Source,
  Stability,
} from "./types";
