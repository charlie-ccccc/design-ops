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
    viewport: {
      options: {
        desktop: {
          name: '電腦 1440px',
          styles: { width: '1440px', height: '900px' },
        },
        laptop: {
          name: '筆電 1280px',
          styles: { width: '1280px', height: '800px' },
        },
        tablet: {
          name: '平板 768px',
          styles: { width: '768px', height: '1024px' },
        },
        mobile: {
          name: '手機 390px',
          styles: { width: '390px', height: '844px' },
        },
        mobileSm: {
          name: '手機小 375px',
          styles: { width: '375px', height: '667px' },
        },
      },
      defaultViewport: 'desktop',
    },
  },
};

export default preview;
