import { expect, test } from "../fixtures/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("サインアップ画面から新規登録できる", async ({ page }) => {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e-signup-${nonce}@example.com`;

  await page.goto("/signup");
  await expect(page.getByTestId("signup-form")).toBeVisible();

  await page.getByTestId("auth-email-input").fill(email);
  await page.getByTestId("auth-password-input").fill("agent001");
  await page.getByTestId("auth-submit-button").click();

  await page.waitForURL(/\/$/);
  await expect(page.getByTestId("home-page")).toBeVisible();
});
