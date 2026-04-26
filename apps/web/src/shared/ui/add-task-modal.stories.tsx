import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { storyCategories } from "@/shared/storybook/mock-data";
import { AddTaskModal } from "./add-task-modal";

const noop = async () => {};

const meta = {
  component: AddTaskModal,
  args: {
    open: true,
    categories: storyCategories,
    onClose: () => undefined,
    onSubmit: noop,
    onCreateCategory: async () => "new-category-id",
  },
} satisfies Meta<typeof AddTaskModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    editingTask: {
      id: "task-home-1",
      name: "Storybook の初期セットアップを入れる",
      categoryId: "cat-product",
      scheduledDate: "2026-04-26",
      estimatedMinutes: 60,
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
