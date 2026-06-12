# Page Composition Rules

Evidence source: `src/app/globals.css` (S01), `src/app/page.tsx` (S01), `src/app/layout.tsx` (S02).

## Viewport And App Shell

- **Primary viewport**: desktop ≥ 768px; fixed app shell with sidebar + main content
- **App shell grid**: `grid-template-columns: 232px 1fr; height: 100vh`
- **Regions**:
  - `.sidebar` — 232px, fixed width, full viewport height, scrollable overflow
  - `.main` — fluid, min-width 0, flex column: `.topbar` (fixed 56px min-height) + `.body` (flex 1, scrollable)
  - `.body` — scrollable main content area; background `--md-sys-color-background-elevated` (`#F4F3EE`)
- **Mobile (≤768px)**: sidebar offscreen, slides in over content on hamburger tap; overlay scrim; main takes full width
- **`overflow: hidden`** on body — intentional; scroll is managed per-region, not at page level

## Layout Rhythm

- **Page gutter**: 22px horizontal, 18px vertical (all primary views: kanban, dash, history)
- **Section gap** (dashboard grid): 14px
- **Card stack gap** (kanban): 8px between cards within a column
- **Topbar height**: 56px min; padding 14px 22px

Every main view starts with `padding: 18px 22px` — do not vary this without a density-level reason.

## Section Rules

- Sections wrap in `.panel` (white surface, 12px radius, 1px border) when they contain multiple rows of structured data (table, chart, leave list)
- Sections that are primarily canvas-level (kanban board, dashboard grid) are NOT wrapped in panels — they live directly on the elevated body background
- Use `gap: 14px` for spacing between panels in a grid; use `gap: 8px` for spacing between cards in a kanban column

## Typographic Composition Rules

- **KPI metric lockup**: label → value → delta; vertical stack; always uppercase label; never break the label-value-delta hierarchy within one card
- **Panel header**: `font: 600 14px`; paired with an optional muted subtitle at 12px; both in a horizontal flex row with spacer for right-side tools
- **Topbar title**: `600 16px`; optional breadcrumb at 12px muted below
- **Drawer title**: 18px/600; id badge at 12px/500 above it
- **Table headers**: always `uppercase; letter-spacing: 0.06em; font-weight: 600; 12px; color: muted`
- **Display numerics (22–28px)**: always `tabular-nums; letter-spacing: -0.02em` — tight tracking at large sizes
- **Data labels adjacent to values**: always smaller than values (12px label → 18–28px value); never same size

## Navigation Regions

### Sidebar
- Width: 232px; background: `--md-sys-color-background` (same warm off-white as page bg, not white)
- Border right: 1px solid `--md-sys-color-divider`
- Structure: brand area → group labels + items → spacer → user avatar
- Group label (`.sb-group-h`): 12px/600/uppercase/+0.08em tracking; muted-2 color
- Nav item (`.sb-item`): 14px/500; icon 24px; gap 10px; radius 9px; hover bg surface-variant; active: surface bg + elevation-sm + primary icon color
- Bottom user block: avatar (28px hue circle) + name + role; always pinned at bottom

### Topbar
- Background: `--md-sys-color-background` (not surface — merges visually with sidebar bg)
- Border bottom: 1px solid `--md-sys-color-divider`
- Left: hamburger (mobile only) → title + breadcrumb
- Right: toolbar (search bar or icon buttons + action buttons + notification)
- Desktop: all toolbar items visible; mobile: collapses to icon buttons, search in secondary filter bar below topbar

## Cards And Surfaces

- **Do** use panels (`.panel`) for data tables, chart containers, and leave lists
- **Do not** wrap every screen section in a panel; kanban and dashboard use direct grid layout
- **Do not** nest outlined panels inside outlined panels (one level of surface lift max)
- Kanban cards: white surface on warm elevated body (`#F4F3EE`) — the contrast creates visual separation without needing additional shadows on default state
- Card hover: elevation-sm + stronger border (not a color change to the card body)

## Lists And Rows

- Table rows: `padding: 8–10px 14px`; `border-bottom: 1px solid var(--md-sys-color-divider)`
- Leave rows: `padding: 8px 16px`; hover bg → surface-variant
- No row uses an individual card/panel treatment — rows are lightweight, not boxed
- Sticky first column for wide tables (cap-table, xtab): `position: sticky; left: 0; z-index: 2`
- Table footers: `font-weight: 600; bg: surface-variant; border-top: 1px solid outline-strong`

## Scroll And Fixed Region Behavior

- Sidebar: independently scrollable (`overflow-y: auto`) — long nav lists scroll independently
- Kanban board: horizontal scroll at body level (`min-width: max-content`) — columns never wrap
- Dashboard: vertical scroll within `.body`
- Crosstab table: max-height 460px with internal scroll (`overflow: auto`)
- Drawer body: `overflow-y: auto`; header + footer are fixed inside the drawer
- App body: `overflow: hidden` — no document-level scroll

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| ≥769px (desktop) | Full sidebar (232px), toolbar with all controls visible |
| ≤768px (mobile) | Sidebar offscreen; hamburger + slide overlay; topbar simplified; filter bar below topbar |
| Kanban mobile | Column width: `min(280px, 85vw)`; horizontal scroll |
| Dashboard mobile | Grid collapses to 1- or 2-col; KPI val at 22px; legends go 1-col |
| Capacity mobile | Table wraps with sticky first column; cap-grid goes 1-col |
| History mobile | Archive card 2-col header + 2-col stat grid |

## Composition Patterns

| Pattern | Evidence | Layout rule | Components | Tokens |
|---|---|---|---|---|
| Kanban view | S01 S04 | Horizontal flex of 296px columns; elevated body bg; 22px gutter | KanbanColumn, KanbanCard, Button, Topbar | `--md-sys-size-kanban-col`, page gutter, density |
| Dashboard classic | S01 S06 | 2-col grid; section gap 14px; panels fill cells | KPI Card, Panel (chart), Panel (table), Layout picker | `--md-sys-spacing-section-gap`, `--md-sys-shape-corner-lg` |
| Dashboard focus | S01 S06 | 1.4fr/1fr asymmetric; left hero spans 2 rows; right has KPI sub-grid | same as classic | asymmetric grid fractions |
| Admin / Capacity | S01 S11 | 1.4fr/1fr grid; left = main table; right = side panels stack | Panel, cap-table, leave-list | page gutter, section gap |
| Auth screen | S01 S05 | Full-viewport centered; surface-variant bg; single surface card 360px | Brand Mark, input-like divider, Button | `--md-sys-color-background-elevated`, `--md-sys-shape-corner-xl` |
| Detail drawer | S01 S10 | Fixed right 460px; slides over content; backdrop scrim | Drawer, meta grid, Timeline, RTE | `--md-sys-size-drawer-width`, elevation-lg |
