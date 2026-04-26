import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { test as base, expect } from "@playwright/test";

const execFileAsync = promisify(execFile);
const API_DIRECTORY = path.resolve(process.cwd(), "apps/api");
const CLEAN_DATABASE_SCRIPT = `
  import "dotenv/config";
  import { prisma } from "./src/shared/lib/prisma";

  void (async () => {
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
