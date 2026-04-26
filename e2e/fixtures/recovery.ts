import { expect, type Page } from "@playwright/test";

export async function dismissRecoveryDialog(page: Page) {
  const dialog = page.getByRole("dialog", { name: "前回の作業が未完了です" });

  await dialog.waitFor({ state: "visible", timeout: 1_500 }).catch(() => null);

  if (!(await dialog.isVisible().catch(() => false))) {
    return false;
  }

  await dialog.getByRole("button", { name: "中断にする" }).click();
  await expect(dialog).not.toBeVisible();
  return true;
}
