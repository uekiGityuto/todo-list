import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test as base, expect } from "@playwright/test";

const execFileAsync = promisify(execFile);
const CLEAN_DATABASE_SCRIPT = `
  import "dotenv/config";
  import { prisma } from "./src/shared/lib/prisma";

  void (async () => {
    await prisma.workRecord.deleteMany();
    await prisma.timerSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  })();
`;

async function cleanDatabase() {
  await execFileAsync(
    "pnpm",
    ["exec", "tsx", "--eval", CLEAN_DATABASE_SCRIPT],
    {
      cwd: "/Users/ueki/ghq/github.com/uekiGityuto/todo-list/apps/api",
    },
  );
}

export const test = base;

test.beforeEach(async () => {
  await cleanDatabase();
});

test.afterEach(async () => {
  await cleanDatabase();
});

export { expect };
