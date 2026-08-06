import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const [domainId, slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ").trim();

function usage() {
  console.log(
    'Usage: pnpm new:lesson <domain-id> <lesson-slug> "中文标题"',
  );
}

if (!domainId || !slug || !title || domainId === "--help") {
  usage();
  process.exit(domainId === "--help" ? 0 : 1);
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
if (!slugPattern.test(domainId) || !slugPattern.test(slug)) {
  console.error("Domain and slug must use lowercase kebab-case.");
  process.exit(1);
}

const repositoryRoot = process.cwd();
const domainDirectory = resolve(
  repositoryRoot,
  "src",
  "content",
  "domains",
  domainId,
);
const lessonDirectory = resolve(domainDirectory, "lessons", slug);

if (!existsSync(resolve(domainDirectory, "domain.ts"))) {
  console.error(`Unknown domain: ${domainId}`);
  process.exit(1);
}

if (existsSync(lessonDirectory)) {
  console.error(`Lesson already exists: ${lessonDirectory}`);
  process.exit(1);
}

const componentName =
  slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("") + "Lesson";

mkdirSync(resolve(lessonDirectory, "labs"), { recursive: true });

writeFileSync(
  resolve(lessonDirectory, "index.tsx"),
  `import { defineLesson } from "@/content/curriculum/types";
import { ${componentName} } from "./Lesson";

export default defineLesson({
  meta: {
    schemaVersion: 1,
    id: "${slug}",
    slug: "${slug}",
    domainId: "${domainId}",
    order: 1,
    title: ${JSON.stringify(title)},
    summary: "用一句话说明学习者将在这里理解什么。",
    durationMinutes: 20,
    audience: "all",
    stability: "converging",
    status: "draft",
    tags: ["replace-me"],
    objectives: ["写下一个可观察、可验证的学习目标"],
    prerequisites: [],
    thesis: {
      statement: "这一课最重要的判断是",
      emphasis: "替换成你的核心观点。",
    },
    output: {
      title: "本课作品",
      description: "说明为什么这个输出能够证明学习发生了。",
      prompt: "给学习者一个具体、可完成、可复查的输出任务。",
      criteria: ["写下至少一条明确的自检标准"],
      placeholder: "从这里开始……",
    },
    sources: [],
    lastVerified: "${new Date().toISOString().slice(0, 10)}",
  },
  Component: ${componentName},
});
`,
  "utf8",
);

writeFileSync(
  resolve(lessonDirectory, "Lesson.tsx"),
  `import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { Lesson } from "@/content/curriculum/catalog";

export function ${componentName}({ lesson: _lesson }: { lesson: Lesson }) {
  return (
    <>
      <LessonSection
        number="01"
        title="从一个真实问题开始"
        lead="让学习者先预测，再看到解释。"
      >
        <p>在这里编排课程内容和交互实验。</p>
      </LessonSection>

      <LessonTakeaway>
        一句话回收概念；<strong>再强调它在系统中的工程边界。</strong>
      </LessonTakeaway>
    </>
  );
}
`,
  "utf8",
);

writeFileSync(
  resolve(lessonDirectory, "labs", "README.md"),
  `# Lesson labs\n\nPut lesson-specific interaction state, fixtures and data here. Reuse \`LabFrame\` for presentation chrome.\n`,
  "utf8",
);

console.log(`Created ${lessonDirectory}`);
console.log("Next: fill metadata, build one interaction, then run pnpm typecheck.");
