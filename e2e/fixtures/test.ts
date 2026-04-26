import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { test as base, expect } from "@playwright/test";

const execFileAsync = promisify(execFile);
const API_DIRECTORY = path.resolve(process.cwd(), "apps/api");
const CLEAN_DATABASE_SCRIPT = `
  import "dotenv/config";
  import { prisma } from "./src/shared/lib/prisma";

  (async () => {
    // 誤って本番/開発 DB を消さないようローカル接続のみ許可する
    const databaseUrl = process.env.DATABASE_URL ?? "";
    if (
      !databaseUrl.includes("127.0.0.1") &&
      !databaseUrl.includes("localhost")
    ) {
      throw new Error(
        \`E2E cleanup はローカル DB でのみ実行できます。DATABASE_URL=\${databaseUrl}\`,
      );
    }

    try {
      await prisma.task.deleteMany();
      await prisma.category.deleteMany();
    } finally {
      await prisma.$disconnect();
    }
  })().catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

async function cleanDatabase() {
  await execFileAsync(
    "pnpm",
    ["exec", "tsx", "--eval", CLEAN_DATABASE_SCRIPT],
    {
      cwd: API_DIRECTORY,
    },
  );
}

export const test = base;

test.beforeAll(async () => {
  await cleanDatabase();
});

test.afterEach(async () => {
  await cleanDatabase();
});

export { expect };
