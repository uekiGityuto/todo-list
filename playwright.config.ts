import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, "e2e/.auth/user.json"),
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @todo-list/api dev",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: !isCI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
    },
    {
      command:
        "pnpm --filter @todo-list/web build && pnpm --filter @todo-list/web exec next start -p 3100",
      // 認証復元前の "/" は "/login" へリダイレクトされるため、公開ページで起動完了を待つ。
      url: "http://127.0.0.1:3100/login",
      reuseExistingServer: !isCI,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000,
    },
  ],
});
