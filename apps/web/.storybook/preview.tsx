import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import { STORYBOOK_API_BASE_URL } from "./constants";
import { StorybookProvider } from "./storybook-provider";
import "../src/app/globals.css";

initialize({
  onUnhandledRequest: ({ method, url }) => {
    const requestUrl = new URL(url);

    if (requestUrl.origin !== STORYBOOK_API_BASE_URL) {
      return;
    }

    throw new Error(`Unhandled ${method} request to ${url} in Storybook.`);
  },
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <StorybookProvider>
        <Story />
      </StorybookProvider>
    ),
  ],
  loaders: [mswLoader],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
    controls: {
      expanded: true,
    },
  },
};

export default preview;
