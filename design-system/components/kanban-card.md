# Kanban Card

## Purpose

Represents one work item in a Kanban column. Draggable between columns. Opens the detail drawer on click. Communicates task identity (id, title, category), requester dept, priority flag, time status (due date, hours tracked vs estimated), and assigned owner — all within a fixed 276px content width.

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO01 | S01 `globals.css` | `.kcard` and sub-classes | Full CSS spec: padding, gaps, border, radius, drag state |
| E-CO01 | S03 `kanban/card.tsx` | Full component | Slot structure: id, cat badge, prio flag, title, dept dot+name, meta row (due, hours, avatar) |
| E-CO01 | S08 `lib/data.ts` | `DEPT_HUE` mapping | Dept dot color sourced from hue mapping |
| E-CO01 | S07 `lib/types.ts` | `Card` interface | `prio: 'high'|'normal'|'low'`; `actual>est` triggers hours-over state |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior | Display + drag-and-drop; click opens detail drawer; dragging shows `.dragging` opacity state |
| Anatomy | container · [id + category-badge + priority-flag] row · title · dept-row · meta-row [due + hours + avatar] |
| Variants / states | default, hover, dragging; hours-over, due-overdue (semantic state modifiers) |
| Token contract summary | container: surface bg, outline border, corner-md, density-inner padding; title: body-medium; meta: meta size + status-error for over states |
| Layout / density | Width set by column (296px col − 20px body padding = 276px); padding from `--md-sys-density-inner` |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | No similar components in initial inventory |

## Anatomy

1. **container** — white surface card, 1px outline border, 9px radius, density-card padding, flex column, gap 8px
2. **header-row** — flex row, items center, gap 6px
   - **id** — task ID string (e.g. `D-042`), 12px/500/+0.04em tracking, muted-2 color
   - **category-badge** — `UIUX` or `平面視覺`; 12px/600; tinted bg + hue foreground via `data-cat`
   - **priority-flag** — shown only when `prio === 'high'`; `<Flag size={12}>` in status-error color; right-aligned via `margin-left: auto`
3. **title** — task title; 14px/500/1.35 leading/−0.003em tracking; ink color; allows 2–3 lines
4. **dept-row** — flex row, gap 5px; categorical hue dot (6px circle) + dept short name; 12px muted
5. **meta-row** — flex row, gap 10px; top padding 6px; separated from title by 1px dashed divider
   - **due** — `<Calendar size={12}>` + `MM/DD` date; 12px muted; overdue modifier: status-error color
   - **hours** — `<Clock size={12}>` + `actual`/`est`h; 12px ink-2; `ratio` in muted; over modifier: status-error color
   - **avatar** — 22px circle; hue bg; initial letter; right-aligned via `margin-left: auto`; shows photo if available

## Variants

| Variant | Trigger | Visual change |
|---|---|---|
| default | — | White surface, outline border |
| hover | `:hover` | border → `outline-strong`; elevation-sm appears |
| dragging | `isDragging` prop | opacity 0.4; `cursor: grabbing` |
| hours-over | `actual > est` | hours slot color → `status-error` |
| due-overdue | due < today AND status ≠ done | due slot color → `status-error` |
| no-owner | `owner` missing | avatar slot hidden |
| high-priority | `prio === 'high'` | priority flag icon visible |

## States

| State | Behavior |
|---|---|
| default | `--md-comp-kanban-card-container-color` surface; `--md-comp-kanban-card-container-border` outline |
| hover | border → `--md-comp-kanban-card-hover-border`; box-shadow → `--md-comp-kanban-card-hover-elevation`; transition 0.12s |
| dragging | `opacity: 0.4`; `cursor: grabbing`; source card dims while drag overlay shows full opacity clone |
| focus-visible | not explicitly implemented in source; add 2px `--md-sys-color-primary` outline offset 2px |
| disabled / blocked | not applicable — blocked status is a column state, not a card state |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-kanban-card-container-color` | `--md-sys-color-surface` | Card bg | all |
| `--md-comp-kanban-card-container-border` | `--md-sys-color-outline` | Card border | default |
| `--md-comp-kanban-card-container-radius` | `--md-sys-shape-corner-md` | 9px radius | all |
| `--md-comp-kanban-card-container-padding` | `--md-sys-density-inner` | Inner padding (density-aware) | all |
| `--md-comp-kanban-card-stack-gap` | `--md-sys-spacing-gap-md` | Gap between cards in column | all |
| `--md-comp-kanban-card-hover-border` | `--md-sys-color-outline-strong` | Hover border emphasis | hover |
| `--md-comp-kanban-card-hover-elevation` | `--md-sys-elevation-sm` | Hover shadow | hover |
| `--md-comp-kanban-card-id-color` | `--md-sys-color-on-surface-faint` | Task ID text | all |
| `--md-comp-kanban-card-title-color` | `--md-sys-color-on-surface` | Title text | all |
| `--md-comp-kanban-card-title-size` | `--md-sys-typescale-body-medium-size` | 14px | all |
| `--md-comp-kanban-card-title-weight` | `--md-sys-typescale-body-medium-weight` | 500 | all |
| `--md-comp-kanban-card-dept-color` | `--md-sys-color-on-surface-muted` | Dept text | all |
| `--md-comp-kanban-card-meta-divider` | `--md-sys-color-divider` | Dashed meta separator | all |
| `--md-comp-kanban-card-due-color` | `--md-sys-color-on-surface-muted` | Due date default | default |
| `--md-comp-kanban-card-due-overdue-color` | `--md-sys-color-status-error` | Due date overdue | overdue modifier |
| `--md-comp-kanban-card-hours-color` | `--md-sys-color-on-surface-secondary` | Hours default | default |
| `--md-comp-kanban-card-hours-over-color` | `--md-sys-color-status-error` | Hours over-est | over modifier |
| `--md-comp-kanban-card-hours-ratio-color` | `--md-sys-color-on-surface-muted` | `/estH` ratio | all |
| `--md-comp-kanban-card-avatar-size` | `--md-sys-size-avatar-sm` | Avatar diameter (22px) | all |
| `--md-comp-kanban-card-avatar-radius` | `--md-sys-shape-corner-full` | Circle | all |

## Layout Rules

- Width: determined by parent column (296px); do not set explicit width on card
- `padding`: `--md-sys-density-inner` (14px default, 10px compact)
- Internal `gap` between major slots: 8px
- `cursor: grab`; `cursor: grabbing` during active drag
- Title: no truncation — allow multi-line wrapping, max ~3 lines before column layout breaks
- Meta row `border-top: 1px dashed var(--md-sys-color-divider)` — only a dashed divider, not solid
- Avatar: `margin-left: auto` — always right-aligned in meta row

## Content Rules

- **id**: format `D-NNN` or similar; always monospace-feature (`tabular-nums`)
- **category badge**: only `UIUX` or `平面視覺` — two categories only; no others introduced without extending the `data-cat` CSS
- **title**: required; 5–60 characters typical; zh-Hant text; do not truncate
- **dept**: must use `DEPT_SHORT` abbreviation; not the full department name
- **due**: `MM/DD` format only
- **hours**: integer or one decimal; ratio always shown as `actual/estH`

## Accessibility Rules

- Draggable card needs `role="listitem"` within `role="list"` column
- `aria-label` on the card container: include card id and title
- Drag handle affordance: the entire card is draggable; keyboard drag requires DnD kit keyboard sensor
- Hours and due date icons are decorative (`aria-hidden="true"`)
- Avatar image: `alt={owner.name}` when photo is used; initial-only spans do not need alt

## Do / Don't

| Do | Don't |
|---|---|
| Use `status-error` for BOTH overdue due AND hours-over — they share the same semantic | Use different colors for overdue and hours-over |
| Let title wrap naturally within the card | Truncate title with ellipsis |
| Use the `hue()` utility function for dept dot and avatar bg | Hardcode department colors as hex values |
| Show avatar only when an owner is assigned | Show a placeholder avatar when no owner |

## Implementation Notes

- Drag is handled by `@dnd-kit/sortable`; the `useSortable` hook provides `transform`, `transition`, and `isDragging`
- Category badge background uses `color-mix(in oklab, var(--hue-cN) 14%, transparent)` — requires `data-cat` attribute on the badge element
- Dept dot uses the `hue()` utility: `hue(DEPT_HUE[card.dept] || 1)` resolving to the corresponding categorical hue
- The `FIXED_SORT` set (`done`, `pending`) disables manual reordering within those columns
