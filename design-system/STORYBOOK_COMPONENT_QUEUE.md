# Storybook Component Queue

## Context

- Design-system package: /Users/user/Work/design-ops/design-system
- Product repo: /Users/user/Work/design-ops
- Framework: Next.js 16 / React 19 / TypeScript 5
- Storybook/catalog: @storybook/nextjs-vite 10.4.3
- Source trace: /Users/user/Work/design-ops/design-system/STORYBOOK_SOURCE_TRACE.md
- Component build plan: /Users/user/Work/design-ops/design-system/STORYBOOK_COMPONENT_PLAN.md
- Figma export addon: @harrychuang/storybook-addon-figma-export@0.1.0 — ✅ installed
- Package manager: npm
- Token import strategy: import token CSS files directly in .storybook/preview.tsx
- Target layout: shared UI in `src/components/ui/<ComponentName>/`, foundation docs in `src/stories/Foundations/`
- Typographic components: implement text lockups as editable shared components in `src/components/ui/<ComponentName>/`
- Current batch: B00 (Foundations) + B01 (Avatar, Button, KPI Card, Kanban Card)

## Status Values

- `queued`: ready for a future batch
- `in-progress`: selected for the current batch
- `done`: implemented, documented, and verified
- `reused`: existing product component accepted as the implementation
- `blocked`: cannot continue without a decision or missing source
- `deferred`: intentionally postponed
- `needs-extraction`: missing design-system evidence or component spec
- `needs-source`: extractor source evidence exists but the Figma node, image, route, or frontend folder cannot be resolved
- `needs-token`: missing token at the required layer
- `needs-api-decision`: shared component API needs a product decision
- `needs-existing-component-review`: similar product component needs review first
- `needs-addon-compatibility`: Storybook, React, or addon setup requirement is missing
- `out-of-scope`: not part of this Storybook rollout

## Source Trace

| Source ID / location | Type | Resolved file / Figma node / route | Story source URL | Components | Status | Notes |
|---|---|---|---|---|---|---|
| - | - | - | - | Avatar | needs-source | synced from component plan |
| - | - | - | - | Rich Text Editor (TipTap) | needs-source | synced from component plan |
| - | - | - | - | Donut Center Lockup | needs-source | synced from component plan |
| - | - | - | - | Input / Select | needs-source | synced from component plan |
| - | - | - | - | Form Row | needs-source | synced from component plan |
| - | - | - | - | Kanban Column | needs-source | synced from component plan |
| - | - | - | - | Sidebar Item | needs-source | synced from component plan |
| - | - | - | - | Badge / Tag family | needs-source | synced from component plan |
| - | - | - | - | Capacity Table | needs-source | synced from component plan |
| - | - | - | - | Crosstab Table | needs-source | synced from component plan |
| - | - | - | - | Archive Card | needs-source | synced from component plan |
| - | - | - | - | Chart SVGs (CircleChart, BarsChart) | needs-source | synced from component plan |
| - | - | - | - | Modal | needs-source | synced from component plan |
| S01 | - | design-system/components/button.md | - | Button | resolved | synced from component plan |
| - | - | - | - | Google Auth button | needs-source | synced from component plan |
| - | - | - | - | Detail Drawer | needs-source | synced from component plan |
| - | - | - | - | Panel | needs-source | synced from component plan |
| - | - | - | - | Notification Panel | needs-source | synced from component plan |
| - | - | - | - | Component | needs-source | synced from component plan |
| S01; S03; S08; S07 | - | design-system/components/kanban-card.md | - | Kanban Card | resolved | synced from component plan |
| S01; S06 | - | design-system/components/kpi-card.md | - | KPI Card | resolved | synced from component plan |
| - | - | - | - | Brand Mark | needs-source | synced from component plan |
| - | - | - | - | Month Pill Navigator | needs-source | synced from component plan |
| - | - | - | - | Leave Calendar | needs-source | synced from component plan |
| - | - | - | - | Timeline | needs-source | synced from component plan |

## Current Component Checkpoint

| Field | Value |
|---|---|
| Active component |  |
| Queue order / batch |  |
| Dependency status |  |
| Source inspected |  |
| Existing component review |  |
| Token decision |  |
| Product files |  |
| Story files |  |
| Target layout |  |
| Verification |  |
| Blocker / next action |  |

## Dependency Plan

| Order | Component | Category | Depends on | Used by | Core reason | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Avatar | primitive | - | Kanban Card | core dependency tier; used by 1 component | queued | - |
| 2 | Rich Text Editor (TipTap) | primitive | - | - | core dependency tier | queued | - |
| 3 | Donut Center Lockup | typographic | - | KPI Card | core dependency tier; used by 1 component | queued | - |
| 4 | Input / Select | form-control | - | - | no dependencies detected | queued | - |
| 5 | Form Row | form-control | - | - | no dependencies detected | queued | - |
| 6 | Kanban Column | layout | - | - | no dependencies detected | queued | - |
| 7 | Sidebar Item | navigation | - | - | no dependencies detected | queued | - |
| 8 | Badge / Tag family | data-display | - | - | no dependencies detected | queued | - |
| 9 | Capacity Table | data-display | - | - | no dependencies detected | queued | - |
| 10 | Crosstab Table | data-display | - | - | no dependencies detected | queued | - |
| 11 | Archive Card | data-display | - | - | no dependencies detected | queued | - |
| 12 | Chart SVGs (CircleChart, BarsChart) | data-display | - | - | no dependencies detected | queued | - |
| 13 | Modal | overlay | - | Button | used by 1 component | queued | - |
| 14 | Button | primitive | Modal | Google Auth button | core dependency tier; used by 1 component; after 1 dependency | queued | - |
| 15 | Google Auth button | primitive | Button | - | core dependency tier; after 1 dependency | queued | - |
| 16 | Detail Drawer | overlay | - | - | no dependencies detected | queued | - |
| 17 | Panel | composite | - | KPI Card, Notification Panel | used by 2 components | queued | - |
| 18 | Notification Panel | composite | Panel | - | after 1 dependency | queued | - |
| 19 | Component | unknown | - | KPI Card, Kanban Card | used by 2 components | queued | - |
| 20 | Kanban Card | data-display | Avatar, Component | - | after 2 dependencies | queued | - |
| 21 | KPI Card | data-display | Component, Donut Center Lockup, Panel | - | after 3 dependencies | queued | - |
| 22 | Brand Mark | unknown | - | - | no dependencies detected | queued | - |
| 23 | Month Pill Navigator | unknown | - | - | no dependencies detected | queued | - |
| 24 | Leave Calendar | unknown | - | - | no dependencies detected | queued | - |
| 25 | Timeline | unknown | - | - | no dependencies detected | queued | - |

## Component Queue

| Batch | Order | Component | Category | Source spec | Design sources | Story source URL | Depends on | Used by | Product target | Story target | Decision | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B01 | 1 | Avatar | primitive | - | - | - | - | Kanban Card | src/components/Avatar/Avatar.tsx | src/components/Avatar/Avatar.stories.tsx | - | queued |
| B01 | 2 | Rich Text Editor (TipTap) | primitive | - | - | - | - | - | src/components/RichTextEditorTipTap/RichTextEditorTipTap.tsx | src/components/RichTextEditorTipTap/RichTextEditorTipTap.stories.tsx | - | queued |
| B01 | 3 | Donut Center Lockup | typographic | - | - | - | - | KPI Card | src/components/DonutCenterLockup/DonutCenterLockup.tsx | src/components/DonutCenterLockup/DonutCenterLockup.stories.tsx | - | queued |
| B01 | 4 | Input / Select | form-control | - | - | - | - | - | src/components/InputSelect/InputSelect.tsx | src/components/InputSelect/InputSelect.stories.tsx | - | queued |
| B02 | 5 | Form Row | form-control | - | - | - | - | - | src/components/FormRow/FormRow.tsx | src/components/FormRow/FormRow.stories.tsx | - | queued |
| B02 | 6 | Kanban Column | layout | - | - | - | - | - | src/components/KanbanColumn/KanbanColumn.tsx | src/components/KanbanColumn/KanbanColumn.stories.tsx | - | queued |
| B02 | 7 | Sidebar Item | navigation | - | - | - | - | - | src/components/SidebarItem/SidebarItem.tsx | src/components/SidebarItem/SidebarItem.stories.tsx | - | queued |
| B02 | 8 | Badge / Tag family | data-display | - | - | - | - | - | src/components/BadgeTagFamily/BadgeTagFamily.tsx | src/components/BadgeTagFamily/BadgeTagFamily.stories.tsx | - | queued |
| B03 | 9 | Capacity Table | data-display | - | - | - | - | - | src/components/CapacityTable/CapacityTable.tsx | src/components/CapacityTable/CapacityTable.stories.tsx | - | queued |
| B03 | 10 | Crosstab Table | data-display | - | - | - | - | - | src/components/CrosstabTable/CrosstabTable.tsx | src/components/CrosstabTable/CrosstabTable.stories.tsx | - | queued |
| B03 | 11 | Archive Card | data-display | - | - | - | - | - | src/components/ArchiveCard/ArchiveCard.tsx | src/components/ArchiveCard/ArchiveCard.stories.tsx | - | queued |
| B03 | 12 | Chart SVGs (CircleChart, BarsChart) | data-display | - | - | - | - | - | src/components/ChartSVGsCircleChartBarsChart/ChartSVGsCircleChartBarsChart.tsx | src/components/ChartSVGsCircleChartBarsChart/ChartSVGsCircleChartBarsChart.stories.tsx | - | queued |
| B04 | 13 | Modal | overlay | - | - | - | - | Button | src/components/Modal/Modal.tsx | src/components/Modal/Modal.stories.tsx | - | queued |
| B04 | 14 | Button | primitive | design-system/components/button.md | S01 | - | Modal | Google Auth button | src/components/Button/Button.tsx | src/components/Button/Button.stories.tsx | - | queued |
| B04 | 15 | Google Auth button | primitive | - | - | - | Button | - | src/components/GoogleAuthButton/GoogleAuthButton.tsx | src/components/GoogleAuthButton/GoogleAuthButton.stories.tsx | - | queued |
| B04 | 16 | Detail Drawer | overlay | - | - | - | - | - | src/components/DetailDrawer/DetailDrawer.tsx | src/components/DetailDrawer/DetailDrawer.stories.tsx | - | queued |
| B05 | 17 | Panel | composite | - | - | - | - | KPI Card, Notification Panel | src/components/Panel/Panel.tsx | src/components/Panel/Panel.stories.tsx | - | queued |
| B05 | 18 | Notification Panel | composite | - | - | - | Panel | - | src/components/NotificationPanel/NotificationPanel.tsx | src/components/NotificationPanel/NotificationPanel.stories.tsx | - | queued |
| B05 | 19 | Component | unknown | - | - | - | - | KPI Card, Kanban Card | src/components/Component/Component.tsx | src/components/Component/Component.stories.tsx | - | queued |
| B05 | 20 | Kanban Card | data-display | design-system/components/kanban-card.md | S01; S03; S08; S07 | - | Avatar, Component | - | src/components/KanbanCard/KanbanCard.tsx | src/components/KanbanCard/KanbanCard.stories.tsx | - | queued |
| B06 | 21 | KPI Card | data-display | design-system/components/kpi-card.md | S01; S06 | - | Component, Donut Center Lockup, Panel | - | src/components/KPICard/KPICard.tsx | src/components/KPICard/KPICard.stories.tsx | - | queued |
| B06 | 22 | Brand Mark | unknown | - | - | - | - | - | src/components/BrandMark/BrandMark.tsx | src/components/BrandMark/BrandMark.stories.tsx | - | queued |
| B06 | 23 | Month Pill Navigator | unknown | - | - | - | - | - | src/components/MonthPillNavigator/MonthPillNavigator.tsx | src/components/MonthPillNavigator/MonthPillNavigator.stories.tsx | - | queued |
| B06 | 24 | Leave Calendar | unknown | - | - | - | - | - | src/components/LeaveCalendar/LeaveCalendar.tsx | src/components/LeaveCalendar/LeaveCalendar.stories.tsx | - | queued |
| B07 | 25 | Timeline | unknown | - | - | - | - | - | src/components/Timeline/Timeline.tsx | src/components/Timeline/Timeline.stories.tsx | - | queued |

## Batch Plan

| Batch | Components | Shared dependencies | Design sources | Dependency exit criteria | Validation | Status |
|---|---|---|---|---|---|---|
| B01 | Avatar, Rich Text Editor (TipTap), Donut Center Lockup, Input / Select | - | - | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B02 | Form Row, Kanban Column, Sidebar Item, Badge / Tag family | - | - | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B03 | Capacity Table, Crosstab Table, Archive Card, Chart SVGs (CircleChart, BarsChart) | - | - | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B04 | Modal, Button, Google Auth button, Detail Drawer | - | S01 | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B05 | Panel, Notification Panel, Component, Kanban Card | Avatar | S01; S03; S08; S07 | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B06 | KPI Card, Brand Mark, Month Pill Navigator, Leave Calendar | Component, Donut Center Lockup, Panel | S01; S06 | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |
| B07 | Timeline | - | - | all listed dependencies are done, reused, or accepted blocked decisions | co-located stories, source URLs, verification log | queued |

## Decisions

| Date | Item | Decision | Reason | Follow-up |
|---|---|---|---|---|
|  |  |  |  |  |

## Figma Export Addon

| Requirement | Detected value | Status | Notes |
|---|---|---|---|
| Storybook `^10` |  |  |  |
| React |  |  |  |
| Bundled addon asset | `assets/figma-export-addon/` |  |  |
| Product vendor path | `.storybook/vendor/figma-export-addon/` |  |  |
| Project config | `.storybook/figma-export.config.ts` |  |  |
| `@storybook/icons` |  |  |  |
| Addon package |  |  |  |
| `.storybook/main.*` registration |  |  |  |
| `.storybook/preview.*` decorator/globals |  |  |  |
| Review helper / status API |  |  |  |
| Token prefix/options |  |  |  |

## Verification Log

| Batch | Command or check | Result | Notes |
|---|---|---|---|
|  |  |  |  |

