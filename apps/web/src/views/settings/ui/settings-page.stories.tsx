import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { storyCategories, storyTasks } from "@/shared/storybook/mock-data";
import { SettingsPage } from "./settings-page";

const meta = {
  component: SettingsPage,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
      },
    },
  },
  args: {
    initialTasks: storyTasks,
    initialCategories: storyCategories,
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialCategories: [],
  },
};
