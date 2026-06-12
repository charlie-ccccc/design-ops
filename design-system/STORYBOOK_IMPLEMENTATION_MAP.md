# Storybook Implementation Map

- Design-system package: `/Users/user/Work/design-ops/design-system/`
- Product repo: `/Users/user/Work/design-ops/`
- Source trace: `design-system/STORYBOOK_SOURCE_TRACE.md`
- Dependency plan: `design-system/STORYBOOK_COMPONENT_PLAN.md`
- Component queue: `design-system/STORYBOOK_COMPONENT_QUEUE.md`
- Last updated: 2026-06-10

## Runtime

| Property | Value |
|---|---|
| Framework | Next.js 16 / React 19 / TypeScript 5 |
| Storybook | 10.4.3 (`@storybook/nextjs-vite` — Vite builder) |
| Package manager | npm |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + CSS custom properties |
| Token system | `--md-ref-*` / `--md-sys-*` / `--md-comp-*` (tokens/ directory) |

## Figma Export Addon

| Property | Value |
|---|---|
| Status | ✅ installed |
| Version | `@harrychuang/storybook-addon-figma-export@0.1.0` |
| Vendor path | `.storybook/vendor/figma-export-addon/` |
| Config | `.storybook/figma-export.config.ts` |
| Token prefix | `md` |
| Token layers | ref / sys / comp |
| Story title prefix | `false` (no namespace) |
| Component class prefixes | `md-` |
| Absolute fidelity components | donut-center-lockup, notification-panel, panel |
| Review overlay | ✅ configured via `createFigmaExportReviewDecorator` |
| Open source action | ✅ configured via `getFigmaSourceUrl` in decorator |
| Design system file URL | empty (no Figma source available) |

## Target Layout

| Content type | Root |
|---|---|
| Shared UI components | `src/components/ui/<ComponentName>/` |
| Foundation docs | `src/stories/Foundations/` |
| Component stories | co-located: `src/components/ui/<ComponentName>/<ComponentName>.stories.tsx` |

## Token Integration

| Token layer | Source file | Storybook import |
|---|---|---|
| Reference | `tokens/tokens-ref.css` | `.storybook/preview.tsx` |
| System | `tokens/tokens-sys.css` | `.storybook/preview.tsx` |
| Component | `tokens/tokens-comp.css` | `.storybook/preview.tsx` |
| Product base | `src/app/globals.css` | `.storybook/preview.tsx` |

## Planner Corrections

The component planner inferred "Modal" as a dependency of Button (from spec text "modal footers"). This is **incorrect** — Button is a primitive; Modal uses Button, not the reverse. Corrected in queue: Button has no extracted dependencies.

The planner also created an "unknown Component" entry from spec text fragments. This is a parser artifact; no real "Component" component exists. Excluded from queue.

## Implementation Table

| Design-system item | Spec / token path | Product target | Decision | Status |
|---|---|---|---|---|
| Storybook setup | — | `.storybook/` | create | ✅ done |
| Figma export addon | `assets/figma-export-addon/` | `.storybook/vendor/` | install (bundled) | ✅ done |
| Token foundations: ref | `tokens/tokens-ref.css` | imported in preview | reuse | ✅ done |
| Token foundations: sys | `tokens/tokens-sys.css` | imported in preview | reuse | ✅ done |
| Token foundations: comp | `tokens/tokens-comp.css` | imported in preview | reuse | ✅ done |
| Foundations — Colors | `DESIGN_ELEMENTS.md` | `src/stories/Foundations/Colors.stories.tsx` | create | ✅ done |
| Foundations — Typography | `DESIGN_ELEMENTS.md` | `src/stories/Foundations/Typography.stories.tsx` | create | ✅ done |
| Foundations — Spacing & Shape | `DESIGN_ELEMENTS.md` | `src/stories/Foundations/Spacing.stories.tsx` | create | ✅ done |
| Foundations — Motion | `DESIGN_ELEMENTS.md` | `src/stories/Foundations/Motion.stories.tsx` | create | ✅ done |
| Avatar (primitive) | planned component | `src/components/ui/Avatar/` | create (minimal, dependency of KanbanCard) | ✅ done |
| Button | `components/button.md` | `src/components/ui/Button/` | create | ✅ done |
| KPI Card | `components/kpi-card.md` | `src/components/ui/KpiCard/` | create | ✅ done |
| Kanban Card | `components/kanban-card.md` | `src/components/ui/KanbanCard/` | create (pure display; no dnd-kit; DnD stays in existing `src/components/kanban/card.tsx`) | ✅ done |
| Input / Select | globals.css `.input`, `tokens-comp.css --md-comp-input-*` | `src/components/ui/Input/` | create | ✅ done |
| SidebarItem | globals.css `.sb-item`, `.sb-group-h` | `src/components/ui/SidebarItem/` | create (sys tokens only; no comp tokens) | ✅ done |
| Panel | globals.css `.panel`, `tokens-comp.css --md-comp-panel-*` | `src/components/ui/Panel/` | create | ✅ done |
| Badge (Chip / Tag / DeptPill) | globals.css `.chip`, `.tag`, `.dept-pill` | `src/components/ui/Badge/` | create (sys tokens only; no comp tokens) | ✅ done |
| Page — Dashboard | `src/components/dashboard/index.tsx` | `src/components/dashboard/Dashboard.stories.tsx` | create (wraps existing component with mock data) | ✅ done |
| Page — KanbanBoard | `src/components/kanban/board.tsx` | `src/components/kanban/KanbanBoard.stories.tsx` | create (wraps existing DnD board with mock data) | ✅ done |
| KanbanColumn | globals.css `.kcol .kcol-h .kcol-body` | `src/components/ui/KanbanColumn/` | create (pure display; DnD stays in board.tsx) | ✅ done |
| BrandMark | globals.css `.sb-mark` | `src/components/ui/BrandMark/` | create (sm 26px / lg 48px; gradient; dark-mode invert) | ✅ done |
| Modal | globals.css `.modal .modal-scrim .modal-h .modal-body .modal-f` | `src/components/ui/Modal/` | create | ✅ done |
| DetailDrawer | globals.css `.drawer .drawer-scrim .drawer-h .drawer-body` | `src/components/ui/DetailDrawer/` | create | ✅ done |
| Timeline | globals.css `.timeline .tl-row .tl-dot` | `src/components/ui/Timeline/` | create | ✅ done |
| MonthPillNavigator | globals.css `.month-pill` | `src/components/ui/MonthPillNavigator/` | create | ✅ done |
| FormRow | globals.css `.form-row .form-grid` | `src/components/ui/FormRow/` | create | ✅ done |
| ArchiveCard | globals.css `.archive-card` | `src/components/ui/ArchiveCard/` | create | ✅ done |
| DonutCenterLockup | globals.css `.donut-center` | `src/components/ui/DonutCenterLockup/` | create (typographic lockup; renders inside SVG donut) | ✅ done |
| CrosstabTable | `src/components/dashboard/crosstab.tsx` | `src/components/dashboard/Crosstab.stories.tsx` | stories added to existing component (reuse) | ✅ done |
| Page — History | `src/components/history/index.tsx` | `src/components/history/History.stories.tsx` | create (wraps existing component with mock data) | ✅ done |
| NotificationPanel | `src/components/ui/notification-panel.tsx` | `src/components/ui/notification-panel.stories.tsx` | stories added to existing flat-file component | ✅ done |
| DatePicker | `src/components/ui/date-picker.tsx` | `src/components/ui/date-picker.stories.tsx` | stories added to existing flat-file component | ✅ done |
| LeaveCalendar | globals.css `.cal-grid .cal-day .cal-n .cal-dots` | `src/components/ui/LeaveCalendar/` | create (pure display; extracted from MiniCalendar in admin/index.tsx; adds `LeaveCalendarControlled` wrapper with nav) | ✅ done |
| Page — Admin (CapacityTable) | `src/components/admin/index.tsx` | `src/components/admin/Admin.stories.tsx` | create (wraps existing Admin with mock data; 3 tab stories: Capacity Overview, Members Table, Leave Calendar) | ✅ done |

## Verification Log

| Batch | Command | Result | Notes |
|---|---|---|---|
| B00 + B01 | `npm run build-storybook` | ✅ Pass — build completed, `storybook-static/` generated | 2026-06-10 |
| B02 | `npm run build-storybook` | ✅ Pass — Input, SidebarItem, Panel, Badge, Dashboard+KanbanBoard page stories all compile | 2026-06-11 |
| B03 | `npm run build-storybook` | ✅ Pass — KanbanColumn, BrandMark, Modal, DetailDrawer, Timeline all compile | 2026-06-11 |
| B04 | `npm run build-storybook` | ✅ Pass — MonthPillNavigator, FormRow, ArchiveCard, DonutCenterLockup, CrosstabTable stories, History page story | 2026-06-11 |
| B05 | `npm run build-storybook` | ✅ Pass — NotificationPanel, DatePicker, LeaveCalendar, Admin page stories all compile | 2026-06-11 |

## Open Questions

- No Figma file URL available; source URL parameters will be omitted from stories
- `main.ts` cannot import local `.ts` files via ESM — resolved by inlining review plugin constants directly in `main.ts`; `figma-export.config.ts` used only from `preview.tsx` (Vite handles `.ts` imports there)
