# Design Elements

## Color System

### Warm-Neutral Palette (light mode)

| Step | Hex | Role | System token |
|---|---|---|---|
| 100 | `#FFFFFF` | Pure white — card/panel surface | `--md-sys-color-surface` |
| 97 | `#FAFAF7` | Page background | `--md-sys-color-background` |
| 95 | `#F7F6F2` | Secondary surface (input fill, column header, modal footer) | `--md-sys-color-surface-variant` |
| 93 | `#F4F3EE` | Elevated body region (`.main`, `.body` wrapper) | `--md-sys-color-background-elevated` |
| 75 | `#C7C5BF` | Faint — zero-value cells, empty state | `--md-sys-color-outline-faint` |
| 58 | `#9A9893` | Faint foreground — disabled, placeholder | `--md-sys-color-on-surface-faint` |
| 42 | `#6B6864` | Muted foreground — metadata, captions | `--md-sys-color-on-surface-muted` |
| 18 | `#2E2D29` | Secondary foreground — icons, secondary text | `--md-sys-color-on-surface-secondary` |
| 10 | `#1A1A17` | Primary foreground — body text | `--md-sys-color-on-surface` |

### Cool-Dark Palette (dark mode overrides)

| Step | Hex | Role |
|---|---|---|
| 93 | `#EDEDE9` | Primary text in dark (ink) |
| 79 | `#C9C8C3` | Secondary text (ink-2) |
| 54 | `#8B8985` | Muted text |
| 37 | `#5F5E5A` | Faint text |
| 23 | `#3C3B38` | Faint / empty state |
| 14 | `#1F1F23` | Surface-2 (slightly cooler than light surface-2) |
| 11 | `#18181B` | Surface |
| 9 | `#161618` | Bg-elev |
| 6 | `#0E0E10` | Page background |

### Accent / Primary (violet)

| Step | Value | Role |
|---|---|---|
| 95 | `oklch(0.94 0.03 282)` | Soft container (hover, calendar today) |
| 74 | `oklch(0.74 0.14 282)` | Accent in dark mode |
| 66 | `oklch(0.66 0.11 282)` | Categorical violet (UIUX dept, hue-c1) |
| 52 | `oklch(0.52 0.14 282)` | Primary accent (light mode) — CTA bg, avatar, active icon |

On accent foreground: `#FFFFFF` (light) / `#0E0E10` (dark).

### Categorical Colors (department/member hues)

Eight enumerated hues at uniform chroma ≈ 0.10–0.13, lightness ≈ 0.62–0.72:

| ID | oklch | Name | Default dept usage |
|---|---|---|---|
| cat-1 | `oklch(0.66 0.11 282)` | violet | 設計部-UIUX |
| cat-2 | `oklch(0.68 0.11 30)` | amber | 總經理室 |
| cat-3 | `oklch(0.66 0.11 200)` | cyan | 合作夥伴事業群-法人事業 |
| cat-4 | `oklch(0.66 0.10 140)` | green | 人力資源部 |
| cat-5 | `oklch(0.72 0.10 78)` | lime | 設計部-平面視覺 |
| cat-6 | `oklch(0.66 0.11 340)` | pink | 金融事業群-大眾事業(券商) |
| cat-7 | `oklch(0.62 0.10 220)` | blue | 金融事業群-大眾事業 |
| cat-8 | `oklch(0.66 0.10 110)` | chartreuse | 金融事業群-流量事業-同學會 |

Tinted badge bg: `color-mix(in oklab, <cat-N> 14–16%, transparent)`. Tinted column drop: 6%.

### Status Colors

| ID | oklch | Semantic role | Used on |
|---|---|---|---|
| status-neutral | `oklch(0.62 0.02 270)` | todo / default | Kanban column dot |
| status-info | `oklch(0.62 0.13 232)` | in progress (designing) | Column dot |
| status-warning | `oklch(0.66 0.13 78)` | review / caution | Column dot, cap-pct.warn |
| status-success | `oklch(0.58 0.12 145)` | done / positive delta | Column dot, kpi-delta.up, progress bar |
| status-error | `oklch(0.58 0.16 25)` | blocked / overrun / overdue | Column dot, kpi-delta.down, hours.over, due.overdue |

### Transparency Tokens

| Name | Value | Role |
|---|---|---|
| divider opacity | `rgba(28,25,23,0.06)` | Hairline separators — never use as border |
| border opacity | `rgba(28,25,23,0.08)` | Card/input/panel border |
| border-strong opacity | `rgba(28,25,23,0.16)` | Hover/active emphasis border |
| modal scrim | `rgba(10,10,8,0.36)` | Modal backdrop |
| drawer scrim | `rgba(10,10,8,0.32)` | Drawer backdrop |

---

## Typography

| Role | Font | Weight | Size | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|---|
| display-numeric | Noto Sans TC | 600 | 28px | 1.1 | −0.02em | KPI value, large stat number |
| title-lg | Noto Sans TC | 600 | 22px | 1.1 | −0.02em | Archive month, drawer hours value |
| title | Noto Sans TC | 600 | 18px | auto | −0.01em | Drawer card title |
| title-sm | Noto Sans TC | 600 | 16px | auto | −0.01em | Topbar page title |
| body | Noto Sans TC | 400 | 14px | 1.45 | +0.005em | Base body; prose content |
| body-medium | Noto Sans TC | 500 | 14px | 1.35 | −0.003em | Kanban card title, nav item, button |
| body-semibold | Noto Sans TC | 600 | 14px | auto | −0.005em | Panel header, sidebar brand name |
| label | Noto Sans TC | 600 | 12px | auto | +0.06–0.08em | Data column headers, KPI label — uppercase |
| meta | Noto Sans TC | 500 | 12px | auto | +0.04em | Card ID, hours, badges — not uppercase |
| meta-sm | Noto Sans TC | 500 | 10–11px | auto | auto | Avatar initial, mini badge |

**Global rules:**
- Font stack: `var(--font-noto), "PingFang TC", -apple-system, BlinkMacSystemFont, sans-serif`
- OpenType: `font-feature-settings: "ss01","cv11"` on body
- Numeric data: always `font-variant-numeric: tabular-nums`
- Display size (22px+): always negative letter-spacing (−0.01 to −0.02em)
- Labels/headers (12px): always positive letter-spacing (+0.06–0.08em) when uppercase
- Weights used: 400, 500, 600, 700 (700 only for bold emphasis within rich text)

---

## Typographic Composition / Text Lockups

| Pattern | Slots | Composition rule | Evidence | Component candidate |
|---|---|---|---|---|
| **KPI metric** | [LABEL uppercase] / [VALUE large numeric] / [DELTA indicator] | Label 12px/600/uppercase/+0.08em tracking; value 28px/600/−0.02em tight leading; delta 12px with semantic color; vertical stack, gap 4–6px | `.kpi` in globals.css, dashboard view | `kpi-card.md` — extracted |
| **Archive month** | [YEAR small muted] [MONTH large] / [4 × STAT columns] / [VIEW BUTTON] | Month 22px/600 with year at 14px/muted prefix; stats in 4-col grid: label uppercase 12px + value 18px/600; button right-aligned | `.archive-card` in globals.css | planned: `archive-card.md` |
| **Donut center** | [VALUE large] / [CAPTION uppercase] | Value 22px/600/−0.02em; caption 12px/muted/uppercase/+0.08em; centered absolutely over SVG | `.donut-center` in globals.css | planned: `chart-center-lockup.md` |
| **Drawer hours cell** | [LABEL small] / [VALUE editable large] / [DELTA note] | Label 12px/muted; value 22px/600/−0.02em (editable input, no border); delta 12px/semantic color | `.drawer-hours .cell` in globals.css | part of drawer-card spec |
| **Card meta row** | [DUE DATE] / [HOURS used/est] / [AVATAR] | All 12px; due with calendar icon; hours with clock icon + ratio `/estH` in muted; avatar right-aligned; separated by dashed divider | `.kcard-meta` in globals.css | part of `kanban-card.md` |

---

## Shape And Corners

| Token | Value | Role |
|---|---|---|
| `--md-ref-radius-6` | 6px | Small: chip, icon tool button, heat cell bg |
| `--md-ref-radius-9` | 9px | Default: button, input, nav item, kanban card |
| `--md-ref-radius-12` | 12px | Medium: panel, kanban column, dept color picker |
| `--md-ref-radius-16` | 16px | Large: modal, brand mark 48px variant |
| `--md-ref-radius-full` | 99px | Pill: chip, dept-pill, avatar, month-pill, progress bar tracks |

---

## Spacing And Density

### Fixed tokens

| Token | Value | Role |
|---|---|---|
| `--md-ref-size-4` | 4px | Minimum gap (cal dots, chip-dot) |
| `--md-ref-size-6` | 6px | Icon-label gap (kcard-row, kpi-delta) |
| `--md-ref-size-8` | 8px | Card stack gap, small section gap |
| `--md-ref-size-10` | 10px | Sidebar item padding / icon gap |
| `--md-ref-size-12` | 12px | Section internal padding (panel-h, modal-body rows) |
| `--md-ref-size-14` | 14px | Card internal padding (density-card default) |
| `--md-ref-size-16` | 16px | Component pad default (density-pad), topbar vertical |
| `--md-ref-size-18` | 18px | Page body top padding |
| `--md-ref-size-20` | 20px | Drawer horizontal padding |
| `--md-ref-size-22` | 22px | Page horizontal gutter (topbar, kanban, dash, history) |
| `--md-ref-size-28` | 28px | Compact row height |
| `--md-ref-size-36` | 36px | Default row/control height |
| `--md-ref-size-56` | 56px | Topbar min-height |
| `--md-ref-size-232` | 232px | Sidebar fixed width |
| `--md-ref-size-296` | 296px | Kanban column fixed width |
| `--md-ref-size-460` | 460px | Detail drawer fixed width |

### Density variants

| Context | Default | Compact |
|---|---|---|
| Component inner padding | 16px | 10px |
| Row / control height | 36px | 28px |
| Card inner padding | 14px | 10px |

### Near-token decisions

See `TOKEN_ARCHITECTURE.md → Near Token Decisions`.

---

## Elevation And Depth

| Token | Box-shadow | Role |
|---|---|---|
| `--md-sys-elevation-sm` | `0 1px 2px rgba(15,14,12,0.04), 0 0 0 0.5px rgba(15,14,12,0.04)` | Active nav item, floating surface micro-lift |
| `--md-sys-elevation-md` | `0 1px 2px rgba(15,14,12,0.04), 0 4px 12px rgba(15,14,12,0.06)` | Card hover, popover, dropdown |
| `--md-sys-elevation-lg` | `0 4px 14px rgba(15,14,12,0.08), 0 16px 40px rgba(15,14,12,0.10)` | Drawer, modal, floating action |

Dark mode shadows use higher base opacity (0.32–0.50) on pure black rgba.

---

## Iconography And Imagery

- **Library:** Lucide icons — `stroke` style, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`
- **Sizes used:** 12px (inline meta icons: clock, calendar, flag), 20px (topbar actions), 24px (sidebar nav), variable for logo area
- **Color:** inherits `currentColor`; active/accent states set `color: var(--accent)` on the icon slot
- **Label pairing:** all icon-only toolbar buttons (`.tb-icon-btn`, `.kcol-tool`) require accessible labels or `title` attributes
- **Imagery:** no photography or illustration observed; product is purely data/text-driven
- **Avatars:** letter-based (`initial` field), hue-color bg, optional `photo?` field for real photo override
- **Brand mark:** single uppercase letter "C", square with rounded corners, accent bg (light mode) or gradient (dark mode)
