import { lazy } from "react";
import {
  lessonComponentModules,
  lessonMetaModules,
} from "virtual:agent-path-lesson-modules";
import type {
  KnowledgeDomain,
  Lesson,
  LessonDefinition,
} from "./types";

type DomainModule = { default: KnowledgeDomain };

const domainModules = import.meta.glob<DomainModule>(
  "../domains/*/domain.ts",
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

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const identifierPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const placeholderPatterns = [
  /^TODO(?:[：:]|$)/i,
  /^replace-me$/i,
  /^替换成你的核心观点[。.]*$/,
];

function assertText(value: string, label: string) {
  const normalized = value.trim();
  if (
    !normalized ||
    placeholderPatterns.some((pattern) => pattern.test(normalized))
  ) {
    throw new Error(`${label} must contain reviewed content`);
  }
}

function assertIsoDate(value: string | undefined, label: string) {
  const parsed = value ? new Date(`${value}T00:00:00Z`) : undefined;
  if (
    !value ||
    !isoDatePattern.test(value) ||
    !parsed ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${label} must use a valid YYYY-MM-DD date`);
  }
}

function assertIdentifier(value: string, label: string) {
  if (!identifierPattern.test(value)) {
    throw new Error(`${label} must use lowercase kebab-case`);
  }
}

function assertPositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
}

function assertKnownIds(
  ids: readonly string[],
  knownIds: ReadonlySet<string>,
  label: string,
) {
  if (ids.length === 0) {
    throw new Error(`${label} must reference at least one id`);
  }
  for (const id of ids) {
    if (!knownIds.has(id)) {
      throw new Error(`${label} references unknown id ${id}`);
    }
  }
}

function validateLessonContract(lesson: Lesson) {
  assertIdentifier(lesson.id, `Lesson id ${lesson.id}`);
  assertIdentifier(lesson.slug, `Lesson slug ${lesson.slug}`);
  assertIdentifier(lesson.domainId, `Domain id for ${lesson.id}`);
  assertPositiveInteger(lesson.order, `Order for ${lesson.id}`);
  assertPositiveInteger(
    lesson.durationMinutes,
    `Duration for ${lesson.id}`,
  );
  assertPositiveInteger(
    lesson.output.revision,
    `Output revision for ${lesson.id}`,
  );
  assertUnique(
    lesson.objectives,
    (objective) => objective.id,
    `objective id in ${lesson.id}`,
  );
  assertUnique(
    lesson.interactions,
    (interaction) => interaction.id,
    `interaction id in ${lesson.id}`,
  );
  assertUnique(
    lesson.claims,
    (claim) => claim.id,
    `claim id in ${lesson.id}`,
  );
  assertUnique(
    lesson.sources,
    (source) => source.id,
    `source id in ${lesson.id}`,
  );
  assertUnique(
    lesson.tags,
    (tag) => tag,
    `tag in ${lesson.id}`,
  );
  assertUnique(
    lesson.output.criteria,
    (criterion) => criterion.id,
    `output criterion id in ${lesson.id}`,
  );
  assertUnique(
    lesson.output.criteria.filter(
      (criterion) => criterion.legacyIndex !== undefined,
    ),
    (criterion) => String(criterion.legacyIndex),
    `legacy output criterion index in ${lesson.id}`,
  );

  const objectiveIds = new Set(
    lesson.objectives.map((objective) => objective.id),
  );
  const claimIds = new Set(lesson.claims.map((claim) => claim.id));

  for (const interaction of lesson.interactions) {
    assertKnownIds(
      interaction.objectiveIds,
      objectiveIds,
      `Interaction ${interaction.id}`,
    );
  }
  assertKnownIds(
    lesson.output.objectiveIds,
    objectiveIds,
    `Output in lesson ${lesson.id}`,
  );
  for (const source of lesson.sources) {
    assertKnownIds(
      source.supportsClaimIds,
      claimIds,
      `Source ${source.id}`,
    );
  }

  if (lesson.status !== "ready") return;

  if (lesson.objectives.length < 2 || lesson.objectives.length > 4) {
    throw new Error(`Ready lesson ${lesson.id} must define 2–4 objectives`);
  }
  if (lesson.interactions.length === 0) {
    throw new Error(`Ready lesson ${lesson.id} must define interactions`);
  }
  for (const interaction of lesson.interactions) {
    assertIdentifier(
      interaction.id,
      `Interaction id ${interaction.id} in ${lesson.id}`,
    );
    assertText(
      interaction.title,
      `Interaction title ${interaction.id} in ${lesson.id}`,
    );
  }
  if (!lesson.interactions.some((item) => item.kind === "prediction")) {
    throw new Error(`Ready lesson ${lesson.id} must include a prediction`);
  }
  if (
    lesson.interactions.some(
      (item) => !item.resettable || !item.deterministic,
    )
  ) {
    throw new Error(
      `Every interaction in ready lesson ${lesson.id} must be resettable and deterministic`,
    );
  }

  const coveredObjectives = new Set([
    ...lesson.interactions.flatMap((item) => item.objectiveIds),
    ...lesson.output.objectiveIds,
  ]);
  for (const objective of lesson.objectives) {
    assertIdentifier(
      objective.id,
      `Objective id ${objective.id} in ${lesson.id}`,
    );
    assertText(objective.text, `Objective ${objective.id}`);
    if (!coveredObjectives.has(objective.id)) {
      throw new Error(
        `Objective ${objective.id} in ${lesson.id} has no interaction or output`,
      );
    }
  }

  assertText(lesson.title, `Title for ${lesson.id}`);
  assertText(lesson.summary, `Summary for ${lesson.id}`);
  assertText(lesson.thesis.statement, `Thesis for ${lesson.id}`);
  assertText(lesson.thesis.emphasis, `Thesis emphasis for ${lesson.id}`);
  assertText(lesson.output.title, `Output title for ${lesson.id}`);
  assertText(lesson.output.description, `Output description for ${lesson.id}`);
  assertText(lesson.output.prompt, `Output prompt for ${lesson.id}`);
  assertText(lesson.output.transferPrompt, `Transfer prompt for ${lesson.id}`);
  if (lesson.tags.length === 0) {
    throw new Error(`Ready lesson ${lesson.id} must define tags`);
  }
  lesson.tags.forEach((tag) => {
    assertIdentifier(tag, `Tag ${tag} in ${lesson.id}`);
    assertText(tag, `Tag in ${lesson.id}`);
  });
  if (lesson.output.criteria.length < 2) {
    throw new Error(
      `Ready lesson ${lesson.id} must define at least two output criteria`,
    );
  }
  lesson.output.criteria.forEach((criterion, index) => {
    assertIdentifier(
      criterion.id,
      `Output criterion id ${criterion.id} in ${lesson.id}`,
    );
    assertText(
      criterion.text,
      `Output criterion ${index + 1} for ${lesson.id}`,
    );
    if (
      criterion.legacyIndex !== undefined &&
      (!Number.isInteger(criterion.legacyIndex) || criterion.legacyIndex < 0)
    ) {
      throw new Error(
        `Legacy output criterion index ${criterion.id} in ${lesson.id} must be a non-negative integer`,
      );
    }
  });

  if (lesson.claims.length === 0 || lesson.sources.length === 0) {
    throw new Error(`Ready lesson ${lesson.id} must declare claims and sources`);
  }
  const supportedClaimIds = new Set(
    lesson.sources.flatMap((source) => source.supportsClaimIds),
  );
  for (const claim of lesson.claims) {
    assertIdentifier(claim.id, `Claim id ${claim.id} in ${lesson.id}`);
    assertText(claim.statement, `Claim ${claim.id}`);
    if (!supportedClaimIds.has(claim.id)) {
      throw new Error(`Claim ${claim.id} in ${lesson.id} has no source`);
    }
  }
  for (const source of lesson.sources) {
    assertIdentifier(source.id, `Source id ${source.id} in ${lesson.id}`);
    assertText(source.title, `Source title ${source.id}`);
    assertText(source.publisher, `Source publisher ${source.id}`);
    assertIsoDate(source.verifiedAt, `Source ${source.id} verifiedAt`);
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error();
      }
    } catch {
      throw new Error(`Source ${source.id} must use a valid HTTP(S) URL`);
    }
  }
  assertIsoDate(lesson.lastVerified, `Lesson ${lesson.id} lastVerified`);
}

export const domains = Object.values(domainModules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order);

export const lessonDefinitions: LessonDefinition[] = Object.entries(
  lessonMetaModules,
)
  .map(([metaPath, module]) => {
    const pathMatch = metaPath.match(
      /\/domains\/([^/]+)\/lessons\/([^/]+)\/meta\.ts$/,
    );
    if (!pathMatch) {
      throw new Error(`Unexpected lesson metadata path: ${metaPath}`);
    }
    const [, pathDomainId, pathSlug] = pathMatch;
    if (
      module.default.domainId !== pathDomainId ||
      module.default.id !== pathSlug ||
      module.default.slug !== pathSlug
    ) {
      throw new Error(
        `Lesson metadata ${metaPath} must match domain ${pathDomainId} and id/slug ${pathSlug}`,
      );
    }
    const componentPath = metaPath.replace(/meta\.ts$/, "index.tsx");
    const loadComponent = lessonComponentModules[componentPath];
    if (!loadComponent) {
      throw new Error(`Lesson metadata ${metaPath} has no index.tsx component`);
    }

    return {
      meta: module.default,
      Component: lazy(async () => {
        const componentModule = await loadComponent();
        return { default: componentModule.default };
      }),
    };
  })
  .sort((a, b) => {
    const domainOrder =
      domains.find((domain) => domain.id === a.meta.domainId)?.order ?? 0;
    const otherDomainOrder =
      domains.find((domain) => domain.id === b.meta.domainId)?.order ?? 0;
    return domainOrder - otherDomainOrder || a.meta.order - b.meta.order;
  });

for (const componentPath of Object.keys(lessonComponentModules)) {
  const metaPath = componentPath.replace(/index\.tsx$/, "meta.ts");
  if (!lessonMetaModules[metaPath]) {
    throw new Error(`Lesson component ${componentPath} has no meta.ts metadata`);
  }
}

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

for (const domain of domains) {
  assertIdentifier(domain.id, `Domain id ${domain.id}`);
  assertPositiveInteger(domain.order, `Order for domain ${domain.id}`);
  assertText(domain.shortTitle, `Short title for domain ${domain.id}`);
  assertText(domain.title, `Title for domain ${domain.id}`);
  assertText(domain.summary, `Summary for domain ${domain.id}`);
}

for (const lesson of lessons) {
  if (!domains.some((domain) => domain.id === lesson.domainId)) {
    throw new Error(
      `Lesson ${lesson.id} references unknown domain ${lesson.domainId}`,
    );
  }
  validateLessonContract(lesson);
}

for (const lesson of lessons) {
  for (const prerequisite of lesson.prerequisites) {
    const prerequisiteLesson = lessons.find(
      (candidate) => candidate.id === prerequisite,
    );
    if (!prerequisiteLesson) {
      throw new Error(
        `Lesson ${lesson.id} references unknown prerequisite ${prerequisite}`,
      );
    }
    if (
      lesson.status === "ready" &&
      prerequisiteLesson.status !== "ready"
    ) {
      throw new Error(
        `Ready lesson ${lesson.id} requires unpublished prerequisite ${prerequisite}`,
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

export const readyLessonDefinitions = lessonDefinitions.filter(
  (definition) => definition.meta.status === "ready",
);

export const readyLessons = readyLessonDefinitions.map(
  (definition) => definition.meta,
);

export const readyLessonDefinitionBySlug = new Map(
  readyLessonDefinitions.map((definition) => [
    definition.meta.slug,
    definition,
  ]),
);

export type {
  Claim,
  KnowledgeDomain,
  Lesson,
  LessonDefinition,
  LearningInteraction,
  LearningObjective,
  LearningOutput,
  OutputCriterion,
  Source,
  Stability,
} from "./types";
