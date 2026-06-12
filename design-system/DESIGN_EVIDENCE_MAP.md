# Design Evidence Map

## Source Inventory

| Source ID | Type | Path | Source fingerprint | Screen or state | Notes | Confidence |
|---|---|---|---|---|---|---|
| S01 | project-code | `src/app/globals.css` | `project-code:src/app/globals.css` | All screens — CSS custom props + component classes | Primary token source; full design token vocabulary | High |
| S02 | project-code | `src/app/layout.tsx` | `project-code:src/app/layout.tsx` | All — font import, lang attribute | Noto Sans TC 400/500/600/700; `lang="zh-Hant"` | High |
| S03 | project-code | `src/components/kanban/card.tsx` | `project-code:src/components/kanban/card.tsx` | Kanban — card anatomy | KCard slots: id, category, priority flag, title, dept dot, due, hours, avatar | High |
| S04 | project-code | `src/components/kanban/board.tsx` | `project-code:src/components/kanban/board.tsx` | Kanban — column layout | Column header, empty state, droppable body, drag overlay | High |
| S05 | project-code | `src/components/auth/login-page.tsx` | `project-code:src/components/auth/login-page.tsx` | Auth — login screen | Brand mark "C", Google auth button, domain restriction, in-app warning | High |
| S06 | project-code | `src/components/dashboard/index.tsx` | `project-code:src/components/dashboard/index.tsx` | Dashboard — KPI/chart/crosstab | Crosstab table, drill-down, donut center lockup | High |
| S07 | project-code | `src/lib/types.ts` | `project-code:src/lib/types.ts` | Domain model | CardStatus, Cat, Priority, Card, Member, LeaveEntry | High |
| S08 | project-code | `src/lib/data.ts` | `project-code:src/lib/data.ts` | Data constants | 15 DEPTS, 6 MEMBERS, hue assignments, STATUSES | High |
| S09 | rendered-project | `http://localhost:3001/ · 1280×720 · unauthenticated` | `rendered:localhost:3001/#login·1280x720` | Login page screenshot | `/tmp/design-ops-login.png` | High |

## Source Duplicate Review

All 9 source fingerprints are distinct (unique file paths or routes). No candidate pairs require a reuse/ignore/keep-distinct decision.

| Candidate source | Duplicate of | Match type | Developer decision |
|---|---|---|---|

## Evidence Rows

### Color

| EID | Source | Region | Observed pattern | Design decision | Affected output | Confidence |
|---|---|---|---|---|---|---|
| E-C01 | S01 | `:root` `--bg` | `#FAFAF7` warm off-white | Page background is warm-tinted, never pure white | `--md-sys-color-background` | High |
| E-C02 | S01 | `:root` `--surface` | `#FFFFFF` pure white | Cards/panels use pure white to float above warm bg | `--md-sys-color-surface` | High |
| E-C03 | S01 | `:root` `--surface-2` | `#F7F6F2` warm off-white | Secondary surface: input fills, column headers, modal footers | `--md-sys-color-surface-variant` | High |
| E-C04 | S01 | `:root` `--bg-elev` | `#F4F3EE` | Elevated body (`.main`, `.body`) — between bg and surface | `--md-sys-color-background-elevated` | High |
| E-C05 | S01 | `:root` `--ink` | `#1A1A17` near-black warm | Primary text | `--md-sys-color-on-surface` | High |
| E-C06 | S01 | `:root` `--ink-2` | `#2E2D29` dark warm gray | Secondary text, icon default, drawer secondary title | `--md-sys-color-on-surface-secondary` | High |
| E-C07 | S01 | `:root` `--muted` | `#6B6864` mid warm gray | Tertiary text, metadata labels, sidebar group headers | `--md-sys-color-on-surface-muted` | High |
| E-C08 | S01 | `:root` `--muted-2` | `#9A9893` light warm gray | Placeholder, disabled text, faint icon | `--md-sys-color-on-surface-faint` | High |
| E-C09 | S01 | `:root` `--faint` | `#C7C5BF` | Zero-value table cells, column empty text | `--md-sys-color-outline-faint` | High |
| E-C10 | S01 S05 | `:root` `--accent` | `oklch(0.52 0.14 282)` violet | CTA bg, avatar, active nav icon, selected calendar, progress bar | `--md-sys-color-primary` | High |
| E-C11 | S01 | `:root` `--accent-soft` | `oklch(0.94 0.03 282)` | Soft accent fill: hover over drag column, calendar today | `--md-sys-color-primary-container` | High |
| E-C12 | S01 | `:root` `--accent-ink` | `#FFFFFF` | Text on accent bg in light mode | `--md-sys-color-on-primary` | High |
| E-C13 | S01 | `:root` `--border` | `rgba(28,25,23,0.08)` | All card/input/panel borders | `--md-sys-color-outline` | High |
| E-C14 | S01 | `:root` `--border-strong` | `rgba(28,25,23,0.16)` | Hover/active border, crosstab total row | `--md-sys-color-outline-strong` | High |
| E-C15 | S01 | `:root` `--divider` | `rgba(28,25,23,0.06)` | Internal separators (sidebar, panel-h, meta rows, card meta dashed) | `--md-sys-color-divider` | High |
| E-C16 | S01 S08 | `hue-c1..c8` | 8 oklch categorical colors, L≈0.62–0.72, C≈0.10–0.13 | Dept/member color coding; uniform perceptual weight across hues | `--md-ref-color-cat-1..8` | High |
| E-C17 | S01 S08 | `st-*` | 5 status oklch: todo/progress/review/done/block | Kanban status dot, hours-over, overdue, delta indicators | `--md-sys-color-status-*` | High |
| E-C18 | S01 | `[data-theme="dark"]` | Full dark override: bg `#0E0E10`, surface `#18181B`, ink `#EDEDE9` | Dark mode supported; neutrals shift to cool-dark family | Dark token overrides | High |

### Typography

| EID | Source | Region | Observed | Decision | Affected | Confidence |
|---|---|---|---|---|---|---|
| E-T01 | S02 | `Noto_Sans_TC` import | Weights 400/500/600/700; `variable: --font-noto` | Primary typeface; CJK-first | `--md-ref-typeface-primary` | High |
| E-T02 | S01 | `body` | `14px / 1.45 / ls 0.005em` | Base body: 14px, airy leading, slight track | Body typescale | High |
| E-T03 | S01 | `.kpi-val` | `600 28px/1.1; ls -0.02em` | Display numeric: largest scale, tight leading, negative track | Display typescale | High |
| E-T04 | S01 | `.tb-title` `.drawer-h-title` | `600 16–18px; ls -0.01em` | UI title: 600 weight, slight negative track | Title typescale | High |
| E-T05 | S01 | `.kcard-title` | `500 14px/1.35` | Content body: 500 weight, tighter leading than base body | Content typescale | High |
| E-T06 | S01 | `.kpi-lbl` `.sb-group-h` `.xtab thead th` | `600 12px uppercase ls 0.06–0.08em` | Data label: 12px small-caps style, heavy tracking | Label typescale | High |
| E-T07 | S01 | `.kcard-id` `.kcard-hours` `.tl-time` | `500 12px; ls 0.04em` | Metadata: 12px slightly tracked, not uppercase | Metadata typescale | High |
| E-T08 | S01 | `.tnum` `.kcard-hours` `.cap-table` | `font-variant-numeric: tabular-nums` | All numeric data: tabular-nums required | Numeric feature | High |
| E-T09 | S01 | `body` | `font-feature-settings: "ss01","cv11"` | OpenType features for CJK glyph polish | Font feature rule | High |
| E-T10 | S01 | `.archive-card .month` | `600 22px/1 inherit; ls -0.02em` | Month display: large numeric with tight tracking | Month lockup | High |

### Spacing & Layout

| EID | Source | Region | Observed | Decision | Affected | Confidence |
|---|---|---|---|---|---|---|
| E-SP01 | S01 | `.app` | `grid: 232px 1fr` | Sidebar fixed 232px; content fluid | App shell layout | High |
| E-SP02 | S01 | `.topbar` | `min-height: 56px; padding: 14px 22px` | Topbar: 56px min, 22px horizontal gutter | Topbar sizing | High |
| E-SP03 | S01 | `.kanban` `.dash` `.history` | `padding: 18px 22px` | All main views: 22px page gutter | Page gutter token | High |
| E-SP04 | S01 | `--density-pad` | `16px` (compact: `10px`) | Component internal padding default | Density pad | High |
| E-SP05 | S01 | `--density-row` | `36px` (compact: `28px`) | Control/row target height | Density row | High |
| E-SP06 | S01 | `--density-card` | `14px` (compact: `10px`) | Kanban card internal padding | Card density | High |
| E-SP07 | S01 | `.dash` | `gap: 14px` | Dashboard section gap | Section gap | High |
| E-SP08 | S01 | `.kcol-body` | `gap: 8px; padding: 10px` | Kanban card stack gap 8px, body padding 10px | Stack gap | High |
| E-SP09 | S01 | `.drawer` | `width: 460px; max-width: 92vw` | Drawer: fixed 460px, responsive cap | Drawer width | High |

### Shape & Elevation

| EID | Source | Region | Observed | Decision | Affected | Confidence |
|---|---|---|---|---|---|---|
| E-SH01 | S01 | `--r-sm: 6px` | Chips, icon tool buttons, heat cells | `--md-ref-radius-6` | High |
| E-SH02 | S01 | `--r: 9px` | Buttons, inputs, nav items, kcard | `--md-ref-radius-9` | High |
| E-SH03 | S01 | `--r-md: 12px` | Panels, kanban columns, dept color picker | `--md-ref-radius-12` | High |
| E-SH04 | S01 | `--r-lg: 16px` | Modals, brand mark | `--md-ref-radius-16` | High |
| E-SH05 | S01 | `.chip` `.dept-pill` | `border-radius: 99px` | Pill/full radius badges | `--md-ref-radius-full` | High |
| E-SH06 | S01 | `--shadow-sm` | `0 1px 2px rgba(.04), 0 0 0 0.5px rgba(.04)` | Micro shadow + hairline ring | `--md-sys-elevation-sm` | High |
| E-SH07 | S01 | `--shadow` | `0 1px 2px rgba(.04), 0 4px 12px rgba(.06)` | Popover/floating card | `--md-sys-elevation-md` | High |
| E-SH08 | S01 | `--shadow-lg` | `0 4px 14px rgba(.08), 0 16px 40px rgba(.10)` | Modal/drawer | `--md-sys-elevation-lg` | High |
