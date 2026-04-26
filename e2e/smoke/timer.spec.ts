import { expect, test } from "@playwright/test";
import { makeCategoryName, makeTaskName } from "../fixtures/names";
import { dismissRecoveryDialog } from "../fixtures/recovery";

test("タスクを開始してタイマー画面を表示できる", async ({ page }) => {
  const categoryName = makeCategoryName();
  const taskName = makeTaskName();

  await page.goto("/tasks");
  if (await dismissRecoveryDialog(page)) {
    await page.goto("/tasks");
  }

  await page.getByRole("button", { name: "追加", exact: true }).click();
  const dialog = page.getByRole("dialog");

  await dialog.locator("#task-name").fill(taskName);
  await dialog.getByRole("button", { name: "選択してください" }).click();
  await dialog.getByRole("button", { name: "新規作成" }).click();
  await dialog.getByPlaceholder("カテゴリ名").fill(categoryName);
  await dialog.getByRole("button", { name: "作成" }).click();
  await dialog.locator("select").selectOption("15");
  await dialog.getByRole("button", { name: "追加" }).click();

  await expect(page.getByText(taskName, { exact: true })).toBeVisible();

  const taskCard = page.getByRole("button", { name: new RegExp(taskName) });
  await taskCard.click();
  await page.getByRole("button", { name: "作業を始める" }).click();

  await page.waitForURL(/\/timer\?taskId=/);
  await expect(page.getByRole("button", { name: "中断" })).toBeVisible();
  await expect(page.getByRole("button", { name: "完了" })).toBeVisible();

  await page.goto("/");
  await dismissRecoveryDialog(page);
});
