import { makeCategoryName, makeTaskName } from "../fixtures/names";
import { dismissRecoveryDialog, gotoAfterDismiss } from "../fixtures/recovery";
import { expect, test } from "../fixtures/test";

test("タスクを開始してタイマー画面を表示できる", async ({ page }) => {
  const categoryName = makeCategoryName();
  const taskName = makeTaskName();

  await gotoAfterDismiss(page, "/tasks");
  await expect(page.getByTestId("tasks-page")).toBeVisible();

  await page.getByTestId("add-task-button").click();
  const dialog = page.getByTestId("add-task-dialog");

  await dialog.getByTestId("task-name-input").fill(taskName);
  await dialog.getByTestId("category-select-trigger").click();
  await dialog.getByTestId("create-category-option").click();
  await dialog.getByTestId("create-category-name-input").fill(categoryName);
  await dialog.getByTestId("create-category-submit-button").click();
  await dialog.getByTestId("estimated-minutes-select").selectOption("15");
  await dialog.getByTestId("task-form-submit-button").click();

  const taskCard = page.getByTestId(`task-card-${taskName}`);
  await expect(taskCard).toBeVisible();

  await page.getByTestId(`task-card-${taskName}-toggle`).click();
  await page.getByTestId(`task-${taskName}-start-work-button`).click();

  await page.waitForURL(/\/timer\?taskId=/);
  await expect(page.getByRole("button", { name: "中断" })).toBeVisible();
  await expect(page.getByRole("button", { name: "完了" })).toBeVisible();

  await page.goto("/");
  await dismissRecoveryDialog(page);
});
