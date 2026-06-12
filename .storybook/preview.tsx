import type { Preview } from '@storybook/nextjs-vite';

// Design system token layers (ref → sys → comp)
import '../tokens/tokens-ref.css';
import '../tokens/tokens-sys.css';
import '../tokens/tokens-comp.css';

// Product base styles (Tailwind v4 + legacy token variables)
import '../src/app/globals.css';

// Figma export addon styles
import '@harrychuang/storybook-addon-figma-export/styles.css';
import '@harrychuang/storybook-addon-figma-export/review.css';

import {
  createFigmaExportGlobalTypes,
  createFigmaExportInitialGlobals,
  type FigmaExportAddonOptions,
} from '@harrychuang/storybook-addon-figma-export';
import { createFigmaExportReviewDecorator } from '@harrychuang/storybook-addon-figma-export/review';
import { getFigmaSourceUrl } from '@harrychuang/storybook-addon-figma-export/source';
import { figmaExportProjectConfig } from './figma-export.config';

const figmaExportOptions: FigmaExportAddonOptions = {
  tokenPrefix: figmaExportProjectConfig.addon.tokenPrefix,
  tokenLayers: { ref: 'ref', sys: 'sys', comp: 'comp' },
  storyTitlePrefix: figmaExportProjectConfig.addon.storyTitlePrefix,
  componentClassPrefixes: figmaExportProjectConfig.addon.componentClassPrefixes,
  absoluteFidelityComponents: figmaExportProjectConfig.addon.absoluteFidelityComponents,
};

const preview: Preview = {
  decorators: [
    createFigmaExportReviewDecorator(figmaExportOptions, {
      enabled: figmaExportProjectConfig.review.enabled,
      apiPath: figmaExportProjectConfig.review.apiPath,
      getFigmaSourceUrl: (context, componentTitle) =>
        getFigmaSourceUrl(
          context.parameters as Record<string, unknown>,
          componentTitle,
          {
            designSystemFileUrl: figmaExportProjectConfig.source.designSystemFileUrlFallback,
            nodeOverrides: figmaExportProjectConfig.source.nodeOverrides,
          },
        ),
    }),
  ],
  globalTypes: {
    ...createFigmaExportGlobalTypes(figmaExportOptions),
  },
  initialGlobals: {
    ...createFigmaExportInitialGlobals(figmaExportOptions),
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
