import type { StorybookConfig } from '@storybook/nextjs-vite';
import { createFigmaReviewStatusPlugin } from '@harrychuang/storybook-addon-figma-export/review-server';

const REVIEW_STATUS_FILE = 'design-system/figma-export-review-status.json';
const REVIEW_API_PATH = '/__figma_export_review_status';
const REVIEW_PLUGIN_NAME = 'figma-export-review-status-api';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@harrychuang/storybook-addon-figma-export',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        createFigmaReviewStatusPlugin({
          filePath: REVIEW_STATUS_FILE,
          apiPath: REVIEW_API_PATH,
          name: REVIEW_PLUGIN_NAME,
        }),
      ],
    };
  },
};
export default config;
