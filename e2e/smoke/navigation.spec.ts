import { expect, test } from "@playwright/test";
import { dismissRecoveryDialog } from "../fixtures/recovery";

test("認証済みで主要ページを表示できる", async ({ page }) => {
  await page.goto("/");
  await dismissRecoveryDialog(page);
  await expect(page.getByText("今日もがんばろう")).toBeVisible();

  await page.goto("/tasks");
  if (await dismissRecoveryDialog(page)) {
    await page.goto("/tasks");
  }
  await expect(page.getByRole("heading", { name: "タスク" })).toBeVisible();

  await page.goto("/calendar");
  if (await dismissRecoveryDialog(page)) {
    await page.goto("/calendar");
  }
  await expect(page.getByRole("button", { name: "前の月" })).toBeVisible();

  await page.goto("/settings");
  if (await dismissRecoveryDialog(page)) {
    await page.goto("/settings");
  }
  await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
});
