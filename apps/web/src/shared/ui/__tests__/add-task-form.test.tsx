import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { API_ERROR_CODES } from "@todo-list/schema";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/lib/api/errors";
import type { Category } from "@/shared/types/task";
import { AddTaskModal } from "../add-task-modal";

const categories: Category[] = [
  { id: "category-1", name: "開発", color: "#3B82F6" },
];

function renderAddTaskForm(
  props: Partial<ComponentProps<typeof AddTaskModal>> = {},
) {
  const onClose = props.onClose ?? vi.fn();
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue(undefined);
  const onCreateCategory =
    props.onCreateCategory ?? vi.fn().mockResolvedValue("created-category-id");

  render(
    <AddTaskModal
      open
      onClose={onClose}
      onSubmit={onSubmit}
      onCreateCategory={onCreateCategory}
      categories={categories}
      {...props}
    />,
  );

  return { onClose, onSubmit, onCreateCategory };
}

describe("AddTaskForm", () => {
  it("空のタスク名では送信せずエラーを表示する", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderAddTaskForm();

    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByText("タスク名を入力してください")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("成功時に整形した値を送信して閉じる", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderAddTaskForm();

    await user.type(
      screen.getByPlaceholderText("タスク名を入力"),
      "  記事を書く  ",
    );
    await user.selectOptions(screen.getByRole("combobox"), "30");
    await user.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: "記事を書く",
        categoryId: "",
        scheduledDate: null,
        estimatedMinutes: 30,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("API の field error を表示して閉じない", async () => {
    const user = userEvent.setup();
    const { onClose } = renderAddTaskForm({
      onSubmit: vi.fn().mockRejectedValue(
        new ApiError("Failed to create task", 400, {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: "入力内容に誤りがあります",
          errors: [{ field: "name", message: "同名のタスクは作成できません" }],
        }),
      ),
    });

    await user.type(
      screen.getByPlaceholderText("タスク名を入力"),
      "記事を書く",
    );
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("同名のタスクは作成できません"),
    ).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });
});
