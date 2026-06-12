# KPI Card

## Purpose

Displays a single key performance indicator as a titled metric panel. Surfaces 3 slots: an uppercase category label, a large numeric value with optional unit, and a directional delta indicator. Used in the Dashboard view to show aggregate stats such as total cards, estimated hours, capacity usage, and completion rate.

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO03 | S01 `globals.css` | `.kpi` `.kpi-lbl` `.kpi-val` `.kpi-delta` | Full slot CSS: 28px value, 12px/600/uppercase label, 12px delta with directional colors |
| E-CO03 | S06 `dashboard/index.tsx` | KPI panel rendering | Used in `layout-classic` and `layout-focus` grid; renders via `.kpi` class with 4 stat variants |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior | Display-only; no interaction; renders a metric snapshot |
| Anatomy | container · label · value (+ optional unit) · delta indicator |
| Variants / states | default; delta-up (success color); delta-down (error color); no-delta |
| Token contract summary | container: surface, outline border, corner-lg; label: 12px/600/uppercase/+0.08em; value: 28px/600/−0.02em; delta: 12px + semantic color |
| Layout / density | `padding: 16px 18px`; flex-column; gap 4px between slots; value has `margin-top: 6px` from label |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Donut center lockup has similar numeric+caption structure but lives inside SVG canvas; kept distinct |

## Anatomy

1. **container** — white surface panel, 1px outline border, 12px radius (corner-lg)
2. **label** — uppercase category name; 12px/600/+0.08em tracking; muted color
3. **value** — primary metric number; 28px/600/1.1 leading/−0.02em tracking; ink color; `font-variant-numeric: tabular-nums`
   - **unit** (optional) — appended after value; 14px/500 muted; `margin-left: 4px`
4. **delta** — directional change indicator; 12px; flex row with optional arrow/chevron icon; gap 4px
   - default: muted color
   - `.up`: `--md-sys-color-status-success`
   - `.down`: `--md-sys-color-status-error`

## Variants

| Variant | Trigger | Delta color |
|---|---|---|
| default | no delta class | `--md-sys-color-on-surface-muted` |
| delta-up | `.kpi-delta.up` | `--md-sys-color-status-success` |
| delta-down | `.kpi-delta.down` | `--md-sys-color-status-error` |
| no-delta | delta slot omitted | — |
| with-unit | `unit` span present | unit shown at smaller size beside value |

## States

Interactive states: `not applicable` — display-only component.

Observed modes:
- **with-unit**: `<span class="unit">H</span>` or `%` appended inline in value slot
- **delta-up / delta-down**: CSS class applied by data logic
- **no-delta**: delta slot may be omitted entirely

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-kpi-card-container-color` | `--md-sys-color-surface` | Card bg | all |
| `--md-comp-kpi-card-container-border` | `--md-sys-color-outline` | Card border | all |
| `--md-comp-kpi-card-container-radius` | `--md-sys-shape-corner-lg` | 12px radius | all |
| `--md-comp-kpi-card-label-color` | `--md-sys-color-on-surface-muted` | Label text | all |
| `--md-comp-kpi-card-label-size` | `--md-sys-typescale-label-size` | 12px | all |
| `--md-comp-kpi-card-label-weight` | `--md-sys-typescale-label-weight` | 600 | all |
| `--md-comp-kpi-card-label-tracking` | `--md-sys-typescale-label-tracking` | +0.08em | all |
| `--md-comp-kpi-card-value-color` | `--md-sys-color-on-surface` | Value text | all |
| `--md-comp-kpi-card-value-size` | `--md-sys-typescale-display-size` | 28px | all |
| `--md-comp-kpi-card-value-weight` | `--md-sys-typescale-display-weight` | 600 | all |
| `--md-comp-kpi-card-value-leading` | `--md-sys-typescale-display-leading` | 1.1 | all |
| `--md-comp-kpi-card-value-tracking` | `--md-sys-typescale-display-tracking` | −0.02em | all |
| `--md-comp-kpi-card-value-top-gap` | `--md-sys-spacing-gap-sm` | 6px label→value gap | all |
| `--md-comp-kpi-card-unit-color` | `--md-sys-color-on-surface-muted` | Unit text | with-unit |
| `--md-comp-kpi-card-unit-size` | `--md-sys-typescale-body-medium-size` | 14px | with-unit |
| `--md-comp-kpi-card-delta-color` | `--md-sys-color-on-surface-muted` | Delta neutral | default |
| `--md-comp-kpi-card-delta-up-color` | `--md-sys-color-status-success` | Delta positive | delta-up |
| `--md-comp-kpi-card-delta-down-color` | `--md-sys-color-status-error` | Delta negative | delta-down |
| `--md-comp-kpi-card-delta-size` | `--md-sys-typescale-meta-size` | 12px | all |
| `--md-comp-kpi-card-delta-gap` | `--md-sys-spacing-gap-xs` | 4px icon gap | all |

## Layout Rules

- Container padding: `16px 18px` (asymmetric: 16px top/bottom, 18px left/right; uses ref sizes)
- Flex direction: column; `gap: 4px` between label, value, delta
- `margin-top: 6px` on `.kpi-val` (value slot) — extra breathing room after label
- Value and unit are inline-flex in the same visual row; unit at `margin-left: 4px`
- Delta row: flex row, `align-items: center`, `gap: 4px`
- Card does not have fixed height — height driven by content

## Content Rules

- **label**: ALL CAPS in zh-Hant or English; maximum 16 characters; must communicate the metric category, not the value (e.g. `本月工時`, `完成率`, `任務數`)
- **value**: integer or up to 1 decimal; always `font-variant-numeric: tabular-nums`; no thousands separator in current usage
- **unit**: optional suffix string: `H` (hours), `%`, `件` (items) — no space between value and unit
- **delta**: short description: e.g. `↑ +12%`, `較上月 −3H`; keep under 20 characters

## Accessibility Rules

- Semantic role: `<div>` with no ARIA role required for display-only stat panels
- Screen-reader: the value must be readable in sequence — label + value + unit; do not separate them with decorative elements
- Numeric: `font-variant-numeric: tabular-nums` is visual only; ensure the underlying text is readable numeric characters
- Delta icon (arrow/chevron): if used, mark `aria-hidden="true"`; convey direction via text color alone is insufficient — add visually-hidden text describing the direction

## Do / Don't

| Do | Don't |
|---|---|
| Use display-numeric scale (28px) for the primary value only | Use 28px for labels or secondary metrics |
| Apply uppercase + wide tracking to the label slot | Uppercase the value itself |
| Use `status-success` for positive delta, `status-error` for negative | Use accent color for deltas |
| Group KPI cards in a 2- or 4-column dashboard grid | Place a KPI card inline with body text |
| Apply `tabular-nums` to the value at all times | Use proportional numerics — number alignment breaks in data tables |

## Implementation Notes

- The existing `.kpi`, `.kpi-lbl`, `.kpi-val`, `.kpi-delta` classes in `globals.css` are the reference implementation.
- In the `layout-focus` dashboard, KPI cards appear in a `focus-kpis` sub-grid (`1fr 1fr`, gap 14px).
- Unit is a `<span class="unit">` inside `.kpi-val` — not a separate block element.
- The `.up` / `.down` class on `.kpi-delta` is set by data logic in `dashboard/index.tsx`.
