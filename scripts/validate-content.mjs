import { createServer } from "vite";

let server;

try {
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
