import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import * as ts from "typescript";
import { defineConfig, normalizePath, type Plugin } from "vite";

const lessonModulesId = "virtual:agent-path-lesson-modules";
const resolvedLessonModulesId = `\0${lessonModulesId}`;

type LessonStatus = "draft" | "review" | "ready";

function childDirectories(directory: string) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(directory, entry.name))
    .sort();
}

function readLessonStatus(file: string): LessonStatus {
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const defaultExport = sourceFile.statements.find(
    (statement): statement is ts.ExportAssignment =>
      ts.isExportAssignment(statement) && !statement.isExportEquals,
  );
  const call = defaultExport?.expression;
  const lessonObject = call && ts.isCallExpression(call)
    ? call.arguments[0]
    : undefined;
  if (!lessonObject || !ts.isObjectLiteralExpression(lessonObject)) {
    throw new Error(
      `${file} must default-export defineLessonMeta({ ... })`,
    );
  }

  const statusProperty = lessonObject.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === "status",
  );
  const status = statusProperty?.initializer;
  if (
    !status ||
    !ts.isStringLiteralLike(status) ||
    !["draft", "review", "ready"].includes(status.text)
  ) {
    throw new Error(`${file} must declare a literal lesson status`);
  }

  return status.text as LessonStatus;
}

function lessonModulesPlugin(includeUnpublished: boolean): Plugin {
  let root = "";
  let lessonsRoot = "";

  function scanLessonFiles() {
    const metaFiles: string[] = [];
    const indexFiles: string[] = [];

    for (const domainDirectory of childDirectories(lessonsRoot)) {
      const domainLessons = resolve(domainDirectory, "lessons");
      for (const lessonDirectory of childDirectories(domainLessons)) {
        const metaFile = resolve(lessonDirectory, "meta.ts");
        const indexFile = resolve(lessonDirectory, "index.tsx");
        if (existsSync(metaFile)) metaFiles.push(metaFile);
        if (existsSync(indexFile)) indexFiles.push(indexFile);
      }
    }

    return {
      metaFiles: metaFiles.sort(),
      indexFiles: indexFiles.sort(),
    };
  }

  function keyFor(file: string) {
    return normalizePath(
      relative(resolve(root, "src/content/curriculum"), file),
    );
  }

  function moduleIdFor(file: string) {
    return `/${normalizePath(relative(root, file))}`;
  }

  return {
    name: "agent-path-lesson-modules",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      lessonsRoot = resolve(root, "src/content/domains");
    },
    resolveId(id) {
      return id === lessonModulesId ? resolvedLessonModulesId : null;
    },
    load(id) {
      if (id !== resolvedLessonModulesId) return null;

      const { metaFiles, indexFiles } = scanLessonFiles();
      const publishedMetaFiles = includeUnpublished
        ? metaFiles
        : metaFiles.filter((file) => readLessonStatus(file) === "ready");
      const publishedIndexFiles = includeUnpublished
        ? indexFiles
        : publishedMetaFiles
            .map((file) => file.replace(/meta\.ts$/, "index.tsx"))
            .filter(existsSync);

      for (const file of [...metaFiles, ...indexFiles]) {
        this.addWatchFile(file);
      }

      return [
        ...publishedMetaFiles.map(
          (file, index) =>
            `import lessonMeta${index} from ${JSON.stringify(moduleIdFor(file))};`,
        ),
        "export const lessonMetaModules = {",
        ...publishedMetaFiles.map(
          (file, index) =>
            `${JSON.stringify(keyFor(file))}: { default: lessonMeta${index} },`,
        ),
        "};",
        "export const lessonComponentModules = {",
        ...publishedIndexFiles.map(
          (file) =>
            `${JSON.stringify(keyFor(file))}: () => import(${JSON.stringify(moduleIdFor(file))}),`,
        ),
        "};",
      ].join("\n");
    },
    configureServer(server) {
      const refreshLessonModules = (file: string) => {
        const normalizedFile = normalizePath(file);
        const normalizedLessonsRoot = normalizePath(lessonsRoot);
        if (
          !normalizedFile.startsWith(`${normalizedLessonsRoot}/`) ||
          !/(?:meta\.ts|index\.tsx)$/.test(normalizedFile)
        ) {
          return;
        }

        const module = server.moduleGraph.getModuleById(
          resolvedLessonModulesId,
        );
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", refreshLessonModules);
      server.watcher.on("unlink", refreshLessonModules);
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  base: "./",
  plugins: [
    lessonModulesPlugin(command === "serve" && !isPreview),
    react(),
  ],
  resolve: {
    alias: {
      "@": decodeURIComponent(new URL("./src", import.meta.url).pathname),
    },
  },
}));
