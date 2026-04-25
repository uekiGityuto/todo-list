import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const webSrcDir = path.join(rootDir, "apps/web/src");

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function toRepoPath(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function isTestFile(repoPath) {
  return /\.test\.(ts|tsx)$/.test(repoPath);
}

function isInTestsDir(repoPath) {
  return repoPath.includes("/__tests__/");
}

function isFormComponent(repoPath) {
  if (!repoPath.endsWith("-form.tsx")) return false;
  if (repoPath.includes("/__tests__/")) return false;
  if (repoPath.includes("/shared/ui/shadcn/")) return false;
  return (
    repoPath.startsWith("apps/web/src/shared/ui/") ||
    repoPath.includes("/views/") ||
    repoPath.startsWith("apps/web/src/views/")
  );
}

function checkTestPlacement(files, violations) {
  for (const filePath of files) {
    const repoPath = toRepoPath(filePath);

    if (!isTestFile(repoPath)) continue;
    if (isInTestsDir(repoPath)) continue;

    violations.push(
      `テストファイルは __tests__/ 配下に置いてください: ${repoPath}`,
    );
  }
}

function checkFormFileConventions(files, violations) {
  for (const filePath of files) {
    const repoPath = toRepoPath(filePath);
    if (!isFormComponent(repoPath)) continue;

    const dir = path.dirname(filePath);
    const stem = path.basename(filePath, ".tsx");
    const schemaPath = path.join(dir, `${stem}-schema.ts`);
    const submitHookPath = path.join(dir, `use-${stem}-submit.ts`);

    if (!existsSync(schemaPath)) {
      violations.push(
        `フォームコンポーネントには同ディレクトリの schema が必要です: ${repoPath} -> ${toRepoPath(schemaPath)}`,
      );
    }

    if (!existsSync(submitHookPath)) {
      violations.push(
        `フォームコンポーネントには同ディレクトリの submit hook が必要です: ${repoPath} -> ${toRepoPath(submitHookPath)}`,
      );
    }
  }
}

function main() {
  if (!statSync(webSrcDir).isDirectory()) {
    throw new Error(`apps/web/src が見つかりません: ${webSrcDir}`);
  }

  const files = walk(webSrcDir);
  const violations = [];

  checkTestPlacement(files, violations);
  checkFormFileConventions(files, violations);

  if (violations.length === 0) {
    console.log("web conventions: ok");
    return;
  }

  console.error("web conventions: failed");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}

main();
