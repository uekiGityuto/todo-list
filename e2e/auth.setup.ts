import fs from "node:fs/promises";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const AUTH_DIR = path.join(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");
const TEST_EMAIL = "agent@example.com";
// ローカル Supabase 専用。存在しなければ自動で作成する。
const TEST_PASSWORD = "agent001";

async function submitAuthForm(page: Page) {
  await page.getByTestId("auth-email-input").fill(TEST_EMAIL);
  await page.getByTestId("auth-password-input").fill(TEST_PASSWORD);
  await page.getByTestId("auth-submit-button").click();
}

test("認証済み状態を作成する", async ({ context, page }) => {
  await fs.mkdir(AUTH_DIR, { recursive: true });

  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();

  await submitAuthForm(page);

  const loginErrorMessage = page.getByText(
    "メールアドレスまたはパスワードが正しくありません",
  );

  if (await loginErrorMessage.isVisible().catch(() => false)) {
    await page.goto("/signup");
    await expect(page.getByTestId("signup-form")).toBeVisible();
    await submitAuthForm(page);
  }

  await page.waitForURL(/\/$/);
  await expect(page.getByTestId("home-page")).toBeVisible();
  await context.storageState({ path: AUTH_FILE });
});
