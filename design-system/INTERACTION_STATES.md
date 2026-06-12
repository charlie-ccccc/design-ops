# Interaction States

Evidence source: `src/app/globals.css` (S01), component implementations (S03, S04, S10).

## Global State Tokens

| State | Visual behavior | Tokens used | Accessibility notes |
|---|---|---|---|
| **Default** | Component-native color; `--md-sys-color-outline` border on interactive surfaces | `--md-sys-color-surface`, `--md-sys-color-outline` | Contrast requirement: interactive text ≥ 4.5:1 vs bg |
| **Hover** | Background shifts to `--md-sys-color-surface-variant`; border may strengthen to `--md-sys-color-outline-strong`; transition `0.12s` | `--md-sys-color-surface-variant`, `--md-sys-color-outline-strong` | No color-only state change — hover is supplemental |
| **Pressed** | `transform: translateY(0.5px)` micro-press; transition `0.05s` | `--md-sys-motion-duration-sm` | Felt as click confirmation; no additional color change |
| **Focus-visible** | Not explicitly styled in current source; browser default outline applies. Recommended: 2px solid `--md-sys-color-primary` outline, offset 2px | `--md-sys-color-primary` | Required for keyboard accessibility; do not suppress `:focus-visible` |
| **Disabled** | Not explicitly styled in source for most components; infer: `opacity: 0.4`, `pointer-events: none`, `cursor: not-allowed` | `--md-ref-opacity-border` | `disabled` attribute required (not just CSS); `aria-disabled` for non-button elements |
| **Selected / Active** | Nav item: `background: var(--md-sys-color-surface)`, `box-shadow: var(--md-sys-elevation-sm)`, icon color → `--md-sys-color-primary`. Calendar: bg → `--md-sys-color-primary`. Layout picker: bg → `--md-sys-color-on-surface`, text → `--md-sys-color-background` | `--md-sys-color-primary`, `--md-sys-elevation-sm`, `--md-sys-color-on-surface` | `aria-selected` or `aria-current="page"` for nav |
| **Loading** | Not observed in production components; infer spinner + disabled state pattern | — | `aria-busy="true"` on container |
| **Error / Status** | `--md-sys-color-status-error` on affected text/icon (overdue due date, hours-over, delta-down, blocked column dot) | `--md-sys-color-status-error` | Error state must not rely on color alone; pair with icon or text label |
| **Drag (grab)** | `cursor: grab`; `.dragging` class: `opacity: 0.4`, `cursor: grabbing` | — | Keyboard drag requires DnD Kit keyboard sensor; `aria-grabbed` deprecated — use `aria-roledescription` |
| **Drag over (drop target)** | Column body: `background: color-mix(in oklab, var(--md-sys-color-primary) 6%, transparent)` | `--md-sys-color-primary`, `--md-ref-opacity-hover` | Visible drop target indication required for accessibility |

## Semantic State Modifiers (Data-Driven)

These states are set by business logic, not user interaction:

| Modifier | CSS class | Color | Trigger |
|---|---|---|---|
| Hours overrun | `.kcard-hours.over` | `--md-sys-color-status-error` | `actual > est` |
| Due overdue | `.kcard-due.overdue` | `--md-sys-color-status-error` | `dueDate < today` AND `status !== 'done'` |
| Capacity warning | `.cap-pct.warn` | `--md-sys-color-status-warning` | capacity 75–99% |
| Capacity over | `.cap-pct.over` | `--md-sys-color-status-error` | capacity ≥ 100% |
| Delta positive | `.kpi-delta.up` | `--md-sys-color-status-success` | value increase vs prior period |
| Delta negative | `.kpi-delta.down` | `--md-sys-color-status-error` | value decrease vs prior period |

## Overlay & Scrim States

| Pattern | Trigger | Behavior |
|---|---|---|
| Drawer scrim | `.drawer-scrim.open` | `opacity: 1`; `pointer-events: auto`; `backdrop-filter: blur(2px)` |
| Modal scrim | `.modal-scrim.open` | `opacity: 1`; `backdrop-filter: blur(2px)` |
| Drawer slide | `.drawer.open` | `transform: translateX(0)`; easing `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Modal slide | `.modal-scrim.open .modal` | `transform: translateY(0)` |

Both overlays start hidden (`opacity: 0; pointer-events: none`) and open by adding the `.open` class.

## Motion

| Token | Value | Usage |
|---|---|---|
| `--md-sys-motion-duration-sm` | `0.12s` | Button bg, card border, nav item bg, hover transitions |
| `--md-sys-motion-duration-md` | `0.18s` | Drawer scrim opacity, modal scrim opacity |
| `--md-sys-motion-duration-lg` | `0.28s` | Drawer slide-in, sidebar mobile slide |
| `--md-sys-motion-easing-standard` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Drawer transform |
| Press transform | `translateY(0.5px)` at `0.05s` | Button active feedback |

### Reduced-Motion

Not currently implemented in source. Recommendation: wrap drawer/modal transitions in:
```css
@media (prefers-reduced-motion: reduce) {
  .drawer, .modal-scrim .modal, .sidebar { transition: none; }
}
```

## Calendar State Combinations

`.cal-day` can combine multiple modifiers:

| Combination | Result |
|---|---|
| `.cal-day.today` | `color-mix(in oklab, primary 12%, transparent)` bg |
| `.cal-day.selected` | `--md-sys-color-primary` bg; white text |
| `.cal-day.holiday:not(.selected)` | `.cal-n` color → `--md-sys-color-status-error` |
| `.cal-day.weekend` | `.cal-n` weight 400, color muted-2 |
| `.cal-day.clickable:hover` | `--md-sys-color-surface-variant` bg |
