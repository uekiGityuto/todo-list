import { expect, test } from "@playwright/test";
import { dismissRecoveryDialog, gotoAfterDismiss } from "../fixtures/recovery";

test("認証済みで主要ページを表示できる", async ({ page }) => {
  await page.goto("/");
  await dismissRecoveryDialog(page);
  await expect(page.getByTestId("home-page")).toBeVisible();

  await gotoAfterDismiss(page, "/tasks");
  await expect(page.getByTestId("tasks-page")).toBeVisible();

  await gotoAfterDismiss(page, "/calendar");
  await expect(page.getByTestId("calendar-page")).toBeVisible();

  await gotoAfterDismiss(page, "/settings");
  await expect(page.getByTestId("settings-page")).toBeVisible();
});
