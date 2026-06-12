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

## Planned

| Component | CSS class(es) | Priority | Status | Observed sources | Notes |
|---|---|---|---|---|---|
| Sidebar Item | `.sb-item` `.sb-group-h` | P1 | **planned** | S01 | Nav item with icon+label; active state with elevation-sm; group header variant |
| Brand Mark | `.sb-mark` + login mark | P1 | **planned** | S01 S05 | Square monogram mark; 26px (sidebar) and 48px (login) sizes |
| Panel | `.panel` `.panel-h` | P1 | **planned** | S01 | Surface container with optional header + divider |
| Input / Select | `.input` | P1 | **planned** | S01 | 32px height; same radius+border as button; focus border on ink-2 |
| Avatar | `.av` `.av-sm` `.av-md` | P1 | **planned** | S01 S03 | Letter-based circle; hue bg; 22px and 28px |
| Badge / Tag family | `.chip` `.tag` `.dept-pill` `.kcard-cat` | P2 | **planned** | S01 S03 | Pill (chip), square (tag), data category badge — 3 sub-variants |
| Kanban Column | `.kcol` `.kcol-h` `.kcol-body` | P1 | **planned** | S01 S04 | 296px fixed; droppable; drag-over tinted bg |
| Detail Drawer | `.drawer` `.drawer-h` `.drawer-body` | P1 | **planned** | S01 S10 | 460px slide-in from right; backdrop scrim with blur |
| Modal | `.modal` `.modal-h` `.modal-body` `.modal-f` | P2 | **planned** | S01 | Centered overlay max 520px; footer bg surface-variant |
| Month Pill Navigator | `.month-pill` | P2 | **planned** | S01 | Composite: prev chevron + value + next chevron |
| Crosstab Table | `.xtab` | P2 | **planned** | S01 S06 | Sticky col+row headers; heat cell overlay; tabular-nums |
| Capacity Table | `.cap-table` | P2 | **planned** | S01 S11 | Inline editable number inputs; cap bar inline |
| Timeline | `.timeline` `.tl-row` | P3 | **planned** | S01 S10 | Activity feed: dot + vertical line + content |
| Donut Center Lockup | `.donut-center` | P3 | **planned** | S01 S06 | Typographic: 22px numeric + uppercase caption; absolute-centered over SVG |
| Archive Card | `.archive-card` | P3 | **planned** | S01 | Month summary: large month + 4-stat grid + view button |
| Leave Calendar | `.cal-grid` `.cal-day` | P3 | **planned** | S01 S11 | 7-col grid; today/selected/holiday/weekend states |
| Form Row | `.form-row` `.form-grid` | P3 | **planned** | S01 | Uppercase label + input, 1- or 2-col layout |

## Out of Scope

| Component | Reason |
|---|---|
| Rich Text Editor (TipTap) | Third-party; `.ProseMirror` classes are library-owned; design-system governs prose-content colors only |
| Chart SVGs (CircleChart, BarsChart) | Recharts library; design-system governs legend colors and donut-center lockup only |
| Google Auth button | Third-party OAuth; governed by Google Brand Guidelines |
| Notification Panel | Planned after drawer spec is complete |
