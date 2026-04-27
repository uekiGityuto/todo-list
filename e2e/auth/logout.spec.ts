import { dismissRecoveryDialog } from "../fixtures/recovery";
import { expect, test } from "../fixtures/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("ログアウトでき、保護ページへ戻れない", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();

  await page.getByTestId("auth-email-input").fill("agent@example.com");
  await page.getByTestId("auth-password-input").fill("agent001");
  await page.getByTestId("auth-submit-button").click();

  await page.waitForURL(/\/$/);
  await dismissRecoveryDialog(page);
  await expect(page.getByTestId("home-page")).toBeVisible();

  await page.getByRole("button", { name: "ログアウト" }).click();

  await page.waitForURL(/\/login$/);
  await expect(page.getByTestId("login-form")).toBeVisible();

  await page.goto("/settings");
  await page.waitForURL(/\/login$/);
  await expect(page.getByTestId("login-form")).toBeVisible();
});
