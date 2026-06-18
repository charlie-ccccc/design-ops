# Component Inventory

## Component Similarity Review

No similarity conflicts detected during initial extraction. All extracted components have distinct purpose, anatomy, and behavior.

| New candidate | Similar existing component | Visual reference | Similarity reason | Suggested action | Developer decision | Rationale |
|---|---|---|---|---|---|---|
| KPI Card | Donut center lockup | [assets/component-review/kpi-vs-donut.svg](assets/component-review/kpi-vs-donut.svg) — schematic fallback, source preview unavailable (no Figma source or screenshot crop accessible) | Both show large numeric + muted caption | keep distinct | keep distinct | KPI Card is a full surface panel with border; donut lockup is absolutely positioned inside SVG canvas — different anatomy, role, layout |
| Button (default) | Month Pill prev/next buttons | [assets/component-review/button-vs-month-pill.svg](assets/component-review/button-vs-month-pill.svg) — schematic fallback, source preview unavailable (no Figma source or screenshot crop accessible) | Both are bordered controls 32px tall | keep distinct | keep distinct | Month pill is a composite navigation control with a value display slot; button is a standalone action trigger with no embedded display state |

## Extracted

| Component | File | Priority | Status | Required tokens | Missing states | Notes |
|---|---|---|---|---|---|---|
| Button | `components/button.md` | P0 | **extracted** | color, shape, density, typescale | loading | 3 variants: default/primary/ghost |
| Kanban Card | `components/kanban-card.md` | P0 | **extracted** | color, shape, density, typescale, status, categorical | focus-visible | Domain-specific; drag+drop; hours-over/overdue semantic modifiers |
| KPI Card | `components/kpi-card.md` | P0 | **extracted** | color, shape, typescale, status | not applicable (display-only) | Typographic lockup component; 3-slot: label + value + delta |
| Avatar | `components/avatar.md` | P1 | **extracted** | color, shape, typescale, categorical | not applicable (display-only) | 3 sizes: sm/md/lg; hue-based bg; photo fallback |
| BrandMark | `components/brand-mark.md` | P1 | **extracted** | shape | not applicable (display-only) | sm (26px) and lg (48px); gradient bg; dark mode reversal |
| Panel | `components/panel.md` | P1 | **extracted** | color, shape, typescale | not applicable (display-only) | Optional header (title + subtitle + actions slot) |
| Input / Select | `components/input.md` | P1 | **extracted** | color, shape, density, typescale, status | disabled | as="input" or as="select"; hasError state |
| Badge / Tag family | `components/badge.md` | P2 | **extracted** | color, shape, typescale, categorical | not applicable (display-only) | Chip + Tag + DeptPill; direct sys token use; no comp layer |
| SidebarItem | `components/sidebar-item.md` | P1 | **extracted** | color, shape, density, elevation, typescale | not applicable | SidebarGroup + SidebarItem; active: surface + elevation-sm + primary icon |
| KanbanColumn | `components/kanban-column.md` | P1 | **extracted** | color | drag-handle keyboard | 296px fixed; drag-over color-mix 6%; empty dashed border |
| DetailDrawer | `components/detail-drawer.md` | P1 | **extracted** | color, shape, typescale, motion | not applicable | 460px from right; backdrop blur; Escape close |
| Modal | `components/modal.md` | P2 | **extracted** | color, shape, typescale, motion | not applicable | Centered overlay; default 520px, lg 640px; corner-xl; footer surface-variant |
| MonthPillNavigator | `components/month-pill-navigator.md` | P2 | **extracted** | color, shape, typescale, motion | not applicable | Composite: prev + value + next; 30px height; divider borders |
| FormRow | `components/form-row.md` | P3 | **extracted** | color, typescale | not applicable | FormRow + FormGrid; uppercase label; no comp token layer |
| ArchiveCard | `components/archive-card.md` | P3 | **extracted** | color, shape, typescale, elevation, motion | not applicable | 3-col grid; month + 4-stats + action; live badge; hover border+shadow |
| DonutCenterLockup | `components/donut-center-lockup.md` | P3 | **extracted** | color, typescale | not applicable (display-only) | position: absolute inset: 0; value + uppercase label; tabular-nums; no comp layer |
| Timeline | `components/timeline.md` | P3 | **extracted** | color, typescale | not applicable (display-only) | dot + ::after vertical line; last-child hides line |
| LeaveCalendar | `components/leave-calendar.md` | P3 | **extracted** | color, categorical | not applicable | 7-col grid; global .cal-* classes; up to 4 leave dots |
| AppTopbar | `components/app-topbar.md` | P1 | **extracted** | color, typescale, density | not applicable | Multi-page tool variants (kanban/dashboard/capacity); global .topbar classes; no comp layer |
| MemberCell | `components/member-cell.md` | P1 | **extracted** | color, typescale | not applicable (display-only) | Avatar + name + optional sub; direct sys token use; no comp layer |
| Table | `components/table.md` | P2 | **extracted** | color, typescale | not applicable | Generic Table<T>; sticky header + optional sticky first col; footer; tabular-nums |
| NotificationPanel | `components/notification-panel.md` | P2 | **extracted** | color | not applicable | Bell trigger + dropdown; 4 notification types; unread badge; mark-read / delete |
| InfoTooltip | `components/tooltip.md` | P2 | **extracted** | color, typescale | not applicable | Portal + position:fixed；hover（桌面）/ click（手機）雙觸發；top / bottom 方向；箭頭指示 |
| DatePicker | `components/date-picker.md` | P2 | **extracted** | color | disabled | Controlled date input; fixed-position popup calendar; clear + today footer |

## Planned

| Component | CSS class(es) | Priority | Status | Observed sources | Notes |
|---|---|---|---|---|---|
| Crosstab Table | `.xtab` | P2 | **planned** | S01 S06 | Sticky col+row headers; heat cell overlay; tabular-nums |
| Capacity Table | `.cap-table` | P2 | **planned** | S01 S11 | Inline editable number inputs; cap bar inline |

## Out of Scope

| Component | Reason |
|---|---|
| Rich Text Editor (TipTap) | Third-party; `.ProseMirror` classes are library-owned; design-system governs prose-content colors only |
| Chart SVGs (CircleChart, BarsChart) | Recharts library; design-system governs legend colors and donut-center lockup only |
| Google Auth button | Third-party OAuth; governed by Google Brand Guidelines |
