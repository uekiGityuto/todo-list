import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { storyCategories, storyTasks } from "@/shared/storybook/mock-data";
import { TasksPage } from "./tasks-page";

const meta = {
  component: TasksPage,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/tasks",
      },
    },
  },
  args: {
    initialTasks: storyTasks,
    initialCategories: storyCategories,
  },
} satisfies Meta<typeof TasksPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialTasks: [],
  },
};
