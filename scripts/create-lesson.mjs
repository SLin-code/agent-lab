import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
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

const slugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
if (!slugPattern.test(domainId) || !slugPattern.test(slug)) {
  console.error(
    "Domain and slug must start with a letter and use lowercase kebab-case.",
  );
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
const domainsDirectory = resolve(
  repositoryRoot,
  "src",
  "content",
  "domains",
);
const lessonsDirectory = resolve(domainDirectory, "lessons");
const lessonDirectory = resolve(lessonsDirectory, slug);

if (!existsSync(resolve(domainDirectory, "domain.ts"))) {
  console.error(`Unknown domain: ${domainId}`);
  process.exit(1);
}

for (const domainEntry of readdirSync(domainsDirectory, {
  withFileTypes: true,
})) {
  if (!domainEntry.isDirectory()) continue;
  const candidate = resolve(
    domainsDirectory,
    domainEntry.name,
    "lessons",
    slug,
  );
  if (existsSync(candidate)) {
    console.error(`Lesson id/slug already exists: ${candidate}`);
    process.exit(1);
  }
}

const existingOrders = existsSync(lessonsDirectory)
  ? readdirSync(lessonsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => resolve(lessonsDirectory, entry.name, "meta.ts"))
      .filter(existsSync)
      .map((metaPath) => {
        const match = readFileSync(metaPath, "utf8").match(/\border:\s*(\d+)/);
        return match ? Number(match[1]) : 0;
      })
  : [];
const nextOrder = Math.max(0, ...existingOrders) + 1;

const componentName =
  slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("") + "Lesson";

mkdirSync(resolve(lessonDirectory, "labs"), { recursive: true });

writeFileSync(
  resolve(lessonDirectory, "meta.ts"),
  `import { defineLessonMeta } from "@/content/curriculum/types";

export default defineLessonMeta({
  schemaVersion: 1,
  revision: 1,
  id: "${slug}",
  slug: "${slug}",
  domainId: "${domainId}",
  order: ${nextOrder},
  title: ${JSON.stringify(title)},
  summary: "用一句话说明学习者将在这里理解什么。",
  durationMinutes: 20,
  audience: "all",
  stability: "converging",
  status: "draft",
  tags: ["replace-me"],
  objectives: [
    { id: "todo-understand", text: "TODO：写下一个可观察的理解目标" },
    { id: "todo-apply", text: "TODO：写下一个可以迁移应用的目标" },
  ],
  interactions: [
    {
      id: "todo-interaction",
      kind: "simulation",
      title: "TODO：选择最能解释概念的可视交互",
      objectiveIds: ["todo-understand"],
      resettable: false,
      deterministic: false,
    },
  ],
  prerequisites: [],
  thesis: {
    statement: "这一课最重要的判断是",
    emphasis: "替换成你的核心观点。",
  },
  claims: [],
  sources: [],
});
`,
  "utf8",
);

writeFileSync(
  resolve(lessonDirectory, "index.tsx"),
  `export { ${componentName} as default } from "./Lesson";\n`,
  "utf8",
);

writeFileSync(
  resolve(lessonDirectory, "Lesson.tsx"),
  `import { LessonSection } from "@/components/lesson/LessonSection";
import { LessonTakeaway } from "@/components/lesson/LessonTakeaway";
import type { LessonComponentProps } from "@/content/curriculum/types";

export function ${componentName}({ lesson: _lesson }: LessonComponentProps) {
  return (
    <>
      <LessonSection
        number="01"
        title="从一个真实问题开始"
        lead="先建立最小心智模型，再选择最适合概念的可视演示。"
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
  `# 本课交互实验\n\n将本课专属的数据、案例和状态放在这里。外框可复用 \`LabFrame\`；共享目标、观察、决定、行动、证据与继续/停止等学习语义，但应为本课选择最适合概念的可视模型，例如循环图、门控链、预算与证据覆盖、检查点路径或静态对比。不要默认套用统一流程图。\n`,
  "utf8",
);

console.log(`Created ${lessonDirectory}`);
console.log(
  "Next: fill metadata, build one interaction, then run pnpm typecheck and pnpm build.",
);
