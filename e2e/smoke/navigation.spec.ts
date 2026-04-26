import { expect, test } from "@playwright/test";
import { dismissRecoveryDialog, gotoAfterDismiss } from "../fixtures/recovery";

test("認証済みで主要ページを表示できる", async ({ page }) => {
  await page.goto("/");
  await dismissRecoveryDialog(page);
  await expect(page.getByText("今日もがんばろう")).toBeVisible();

  await gotoAfterDismiss(page, "/tasks");
  await expect(page.getByRole("heading", { name: "タスク" })).toBeVisible();

  await gotoAfterDismiss(page, "/calendar");
  await expect(page.getByRole("button", { name: "前の月" })).toBeVisible();

  await gotoAfterDismiss(page, "/settings");
  await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
});
