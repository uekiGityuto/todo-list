import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { API_ERROR_CODES } from "@todo-list/schema";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/api/errors";
import type { Category } from "@/shared/types/task";
import { CategoryForm } from "../category-form";

const baseCategory: Category = {
  id: "category-1",
  name: "開発",
  color: "#3B82F6",
};

function renderCategoryForm(
  props: Partial<ComponentProps<typeof CategoryForm>> = {},
) {
  const addCategory =
    props.addCategory ?? vi.fn().mockResolvedValue("created-category-id");
  const updateCategory =
    props.updateCategory ?? vi.fn().mockResolvedValue(undefined);
  const onSuccess = props.onSuccess ?? vi.fn();
  const onCancel = props.onCancel ?? vi.fn();

  render(
    <CategoryForm
      editingCategory={null}
      addCategory={addCategory}
      updateCategory={updateCategory}
      onSuccess={onSuccess}
      onCancel={onCancel}
      {...props}
    />,
  );

  return {
    addCategory,
    onCancel,
    onSuccess,
    updateCategory,
  };
}

describe("CategoryForm", () => {
  it("空のカテゴリ名では送信せずエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    const { addCategory, onSuccess } = renderCategoryForm();

    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("カテゴリ名を入力してください"),
    ).toBeVisible();
    expect(addCategory).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("追加成功時にカテゴリ名をトリムして保存する", async () => {
    const user = userEvent.setup();
    const { addCategory, onSuccess } = renderCategoryForm();

    await user.type(screen.getByLabelText("カテゴリ名 *"), "  会議  ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() =>
      expect(addCategory).toHaveBeenCalledWith("会議", "#3B82F6"),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("API の field error をフォームに表示し、成功扱いにしない", async () => {
    const user = userEvent.setup();
    const { addCategory, onSuccess } = renderCategoryForm({
      addCategory: vi.fn().mockRejectedValue(
        new ApiError("Failed to create category", 400, {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: "入力内容に誤りがあります",
          errors: [
            { field: "name", message: "同名のカテゴリは作成できません" },
          ],
        }),
      ),
    });

    await user.type(screen.getByLabelText("カテゴリ名 *"), "開発");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("同名のカテゴリは作成できません"),
    ).toBeVisible();
    expect(addCategory).toHaveBeenCalledWith("開発", "#3B82F6");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("編集モードでは updateCategory を呼ぶ", async () => {
    const user = userEvent.setup();
    const { updateCategory, onSuccess } = renderCategoryForm({
      editingCategory: baseCategory,
    });

    const input = screen.getByLabelText("カテゴリ名 *");
    await user.clear(input);
    await user.type(input, "レビュー");
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() =>
      expect(updateCategory).toHaveBeenCalledWith(
        baseCategory.id,
        "レビュー",
        baseCategory.color,
      ),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
