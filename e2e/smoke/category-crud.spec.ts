import { makeCategoryName } from "../fixtures/names";
import { gotoAfterDismiss } from "../fixtures/recovery";
import { expect, test } from "../fixtures/test";

test("カテゴリを追加して編集して削除できる", async ({ page }) => {
  const categoryName = makeCategoryName();
  const updatedCategoryName = `${categoryName}-updated`;

  await gotoAfterDismiss(page, "/settings");
  await expect(page.getByTestId("settings-page")).toBeVisible();

  await page.getByTestId("add-category-button").click();
  await page.getByTestId("category-name-input").fill(categoryName);
  await page.getByTestId("category-submit-button").click();

  const categoryRow = page.getByTestId(`category-row-${categoryName}`);
  await expect(categoryRow).toBeVisible();

  await categoryRow.getByTestId("category-edit-button").click();
  await page.getByTestId("category-name-input").fill(updatedCategoryName);
  await page.getByTestId("category-submit-button").click();

  const updatedRow = page.getByTestId(`category-row-${updatedCategoryName}`);
  await expect(updatedRow).toBeVisible();

  await updatedRow.getByTestId("category-delete-button").click();

  await expect(updatedRow).not.toBeVisible();
});
