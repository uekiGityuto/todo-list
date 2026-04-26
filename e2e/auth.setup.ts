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

async function getAuthErrorMessage(page: Page) {
  const errorMessage = page.getByTestId("auth-server-error");
  return (await errorMessage.isVisible().catch(() => false))
    ? ((await errorMessage.textContent())?.trim() ?? null)
    : null;
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

    const signupErrorMessage = await getAuthErrorMessage(page);
    if (signupErrorMessage) {
      throw new Error(
        `E2E auth setup failed for ${TEST_EMAIL}: signup did not complete. ` +
          `The local Supabase user may already exist with a different password or auth state. ` +
          `Reset the user or update the test credentials. Original error: ${signupErrorMessage}`,
      );
    }
  }

  await page.waitForURL(/\/$/);
  await expect(page.getByTestId("home-page")).toBeVisible();
  await context.storageState({ path: AUTH_FILE });
});
