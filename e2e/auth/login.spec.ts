import { expect, test } from "../fixtures/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("ログイン画面からログインできる", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();

  await page.getByTestId("auth-email-input").fill("agent@example.com");
  await page.getByTestId("auth-password-input").fill("agent001");
  await page.getByTestId("auth-submit-button").click();

  await page.waitForURL(/\/$/);
  await expect(page.getByTestId("home-page")).toBeVisible();
});
