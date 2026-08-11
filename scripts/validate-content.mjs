import { readdirSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { createServer } from "vite";

let server;

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

function validateLowBurdenInputs() {
  const forbiddenPatterns = [
    { pattern: /<textarea\b/i, label: "textarea" },
    {
      pattern: /\bcontentEditable(?:\s*=|\s|>)/i,
      label: "contentEditable",
    },
  ];

  for (const path of sourceFiles(resolve(process.cwd(), "src"))) {
    if (![".tsx", ".jsx", ".html"].includes(extname(path))) continue;
    const source = readFileSync(path, "utf8");
    for (const { pattern, label } of forbiddenPatterns) {
      if (pattern.test(source)) {
        throw new Error(
          `${path} uses forbidden long-form learner input: ${label}`,
        );
      }
    }
  }
}

try {
  validateLowBurdenInputs();
  server = await createServer({
    appType: "custom",
    logLevel: "error",
    server: { hmr: false, middlewareMode: true },
  });

  const catalog = await server.ssrLoadModule(
    "/src/content/curriculum/catalog.ts",
  );

  if (!Array.isArray(catalog.domains) || !Array.isArray(catalog.lessons)) {
    throw new Error("Catalog did not export domains and lessons arrays");
  }

  for (const lesson of catalog.lessons) {
    const entryPath =
      `/src/content/domains/${lesson.domainId}` +
      `/lessons/${lesson.slug}/index.tsx`;
    const entryModule = await server.ssrLoadModule(entryPath);
    if (typeof entryModule.default !== "function") {
      throw new Error(
        `Lesson entry ${entryPath} must default-export a component`,
      );
    }
  }

  const entryLabel = catalog.lessons.length === 1
    ? "lesson entry"
    : "lesson entries";
  console.log(
    `Content validation passed: ${catalog.domains.length} domains, ${catalog.lessons.length} ${entryLabel}.`,
  );
} catch (error) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error("Content validation failed:\n" + message);
  process.exitCode = 1;
} finally {
  await server?.close();
}
