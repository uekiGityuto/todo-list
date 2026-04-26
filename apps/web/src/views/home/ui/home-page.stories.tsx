import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  storyCategories,
  storyTasks,
  storyWorkRecords,
} from "@/shared/storybook/mock-data";
import { HomePage } from "./home-page";

const meta = {
  component: HomePage,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
  args: {
    initialTasks: storyTasks,
    initialCategories: storyCategories,
    initialWorkRecords: storyWorkRecords,
  },
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialTasks: [],
    initialCategories: storyCategories,
    initialWorkRecords: [],
  },
};
