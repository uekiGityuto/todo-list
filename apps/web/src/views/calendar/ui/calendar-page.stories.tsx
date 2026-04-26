import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  storyCategories,
  storyTasks,
  storyWorkRecords,
} from "@/shared/storybook/mock-data";
import { CalendarPage } from "./calendar-page";

const meta = {
  component: CalendarPage,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/calendar",
      },
    },
  },
  args: {
    initialTasks: storyTasks,
    initialCategories: storyCategories,
    initialWorkRecords: storyWorkRecords,
  },
} satisfies Meta<typeof CalendarPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialWorkRecords: [],
  },
};
