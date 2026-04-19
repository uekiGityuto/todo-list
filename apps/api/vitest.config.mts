import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

function loadDotenv(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");

  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) return null;

        const key = line.slice(0, separatorIndex).trim();
        if (!key) return null;

        const rawValue = line.slice(separatorIndex + 1);
        const value = rawValue.replace(/^['"]|['"]$/g, "");

        return [key, value];
      })
      .filter((entry): entry is [string, string] => entry !== null),
  );
}

export default defineConfig(() => {
  const env = loadDotenv(path.resolve(process.cwd(), ".env"));

  return {
    test: {
      fileParallelism: false,
      globals: true,
      env,
    },
  };
});
