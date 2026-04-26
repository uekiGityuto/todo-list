import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  storyCategories,
  storyTasks,
  storyTimerSession,
} from "@/shared/storybook/mock-data";
import { TimerPage } from "./timer-page";

const meta = {
  component: TimerPage,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/timer",
        query: {
          taskId: "task-next",
        },
      },
    },
  },
  args: {
    initialTasks: storyTasks,
    initialCategories: storyCategories,
    initialTimerSession: storyTimerSession,
  },
} satisfies Meta<typeof TimerPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {};

export const NoSession: Story = {
  args: {
    initialTimerSession: null,
  },
};
