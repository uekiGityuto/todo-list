import { expect, test } from "@playwright/test";
import { makeCategoryName } from "../fixtures/names";
import { dismissRecoveryDialog } from "../fixtures/recovery";

test("カテゴリを追加して編集して削除できる", async ({ page }) => {
  const categoryName = makeCategoryName();
  const updatedCategoryName = `${categoryName}-updated`;

  await page.goto("/settings");
  if (await dismissRecoveryDialog(page)) {
    await page.goto("/settings");
  }

  await page.getByRole("button", { name: "カテゴリを追加" }).click();
  await page.locator("#category-name").fill(categoryName);
  await page.getByRole("button", { name: "追加", exact: true }).click();

  await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

  const categoryRow = page
    .getByText(categoryName, { exact: true })
    .locator("..")
    .locator("..");
  await categoryRow.getByRole("button", { name: "編集" }).click();
  await page.locator("#category-name").fill(updatedCategoryName);
  await page.getByRole("button", { name: "保存" }).click();

  await expect(
    page.getByText(updatedCategoryName, { exact: true }),
  ).toBeVisible();

  const updatedRow = page
    .getByText(updatedCategoryName, { exact: true })
    .locator("..")
    .locator("..");
  await updatedRow.getByRole("button", { name: "削除" }).click();

  await expect(
    page.getByText(updatedCategoryName, { exact: true }),
  ).not.toBeVisible();
});
