# Button

## Purpose

Triggers an action. Three variants cover the full emphasis range: default (neutral bordered), primary (filled ink), ghost (no visible border). Used in topbar toolbar, modal footers, drawer forms, and admin actions.

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO02 | S01 `globals.css` | `.btn` `.btn-primary` `.btn-ghost` | All three variants defined; 32px height; border-radius `var(--r)` (9px) |
| E-CO02 | S01 `globals.css` | `.btn:active` | `transform: translateY(0.5px)` — micro press feedback |
| E-CO02 | S01 `globals.css` | `.tb-icon-btn` | Icon-only variant: `width: 32px; padding: 0; justify-content: center` |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior | Action trigger; taps/clicks fire a handler |
| Anatomy | container · optional leading icon · label · optional trailing icon |
| Variants / states | default, primary, ghost; disabled (inferred); icon-only |
| Token contract summary | container-color, border, radius, height from sys; label-color, size, weight from sys typescale |
| Layout / density | Height = `--md-sys-density-row` (36px default, 28px compact); padding-inline 12px; gap 6px |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | None — first button extraction |

## Props API

```tsx
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'ghost';   // default: 'default'
  icon?: boolean;                               // icon-only mode: 32px square, no padding
  leadingIcon?: ReactNode;                      // icon before label
  trailingIcon?: ReactNode;                     // icon after label
  children?: ReactNode;
};
```

## Anatomy

1. **container** — bordered surface, height from density token
2. **leading-icon** (optional) — `leadingIcon` prop; 14–16px lucide icon, inherits label color
3. **label** — `children` — 14px/500 body-medium
4. **trailing-icon** (optional) — `trailingIcon` prop; same as leading-icon
5. **icon-only mode** — `icon={true}`; no label; 32px square, no padding-inline

## Variants

| Variant | container-color | border | label-color | hover |
|---|---|---|---|---|
| **default** | `--md-sys-color-surface` | `--md-sys-color-outline` | `--md-sys-color-on-surface` | bg → `surface-variant` |
| **primary** | `--md-sys-color-on-surface` | `--md-sys-color-on-surface` | `--md-sys-color-background` | bg → `on-surface-secondary` |
| **ghost** | `transparent` | `transparent` | `--md-sys-color-on-surface-secondary` | bg → `surface-variant` |
| **icon-only** | 同 variant 色 | 同 variant | — | `icon={true}` 觸發；width 32px；padding 0 |

## States

| State | Behavior |
|---|---|
| default | `--md-comp-button-container-color` bg, `--md-comp-button-container-border` border |
| hover | `--md-comp-button-hover-container-color` bg transition 0.12s |
| pressed | `transform: translateY(0.5px)` |
| focus-visible | browser default outline; supplement with 2px solid `--md-sys-color-primary` offset 2px if restyling |
| disabled | opacity 0.4 (inferred — no explicit disabled class in source); `pointer-events: none` |
| loading | not observed; treat as disabled with spinner if needed |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-button-container-color` | `--md-sys-color-surface` | Default bg | default |
| `--md-comp-button-container-border` | `--md-sys-color-outline` | Default border | default |
| `--md-comp-button-container-radius` | `--md-sys-shape-corner-md` | Radius (9px) | all |
| `--md-comp-button-container-height` | `--md-sys-density-row` | Height (density-aware) | all |
| `--md-comp-button-label-color` | `--md-sys-color-on-surface` | Label text | default |
| `--md-comp-button-label-size` | `--md-sys-typescale-body-medium-size` | 14px | all |
| `--md-comp-button-label-weight` | `--md-sys-typescale-body-medium-weight` | 500 | all |
| `--md-comp-button-padding-inline` | `--md-sys-spacing-inset-md` | 12px horizontal | all |
| `--md-comp-button-gap` | `--md-sys-spacing-gap-sm` | 6px icon gap | all |
| `--md-comp-button-hover-container-color` | `--md-sys-color-surface-variant` | Hover bg | hover |
| `--md-comp-button-primary-container-color` | `--md-sys-color-on-surface` | Primary bg | primary/default |
| `--md-comp-button-primary-label-color` | `--md-sys-color-background` | Primary text | primary/default |
| `--md-comp-button-ghost-label-color` | `--md-sys-color-on-surface-secondary` | Ghost text | ghost/default |

## Layout Rules

- Height: `--md-sys-density-row` — automatically responds to compact density override
- `min-width`: not set; allow label to determine width; icon-only pins width at 32px
- `padding-inline`: 12px (default); 0 for icon-only
- `gap`: 6px between icon and label
- Text: `white-space: nowrap`; do not truncate button labels
- `flex-shrink: 0` — buttons must not compress in toolbar rows

## Content Rules

- Label: 1–4 words; prefer imperative verbs in zh-Hant (「新增」「下載」「登入」)
- Icon: optional, never repeated with a redundant label symbol
- No emoji in button labels

## Accessibility Rules

- Semantic element: `<button>` required; do not implement as `<div>` or `<a>`
- `disabled` attribute must be set when the action is unavailable (not just `opacity`)
- Icon-only buttons: require `aria-label` or `title`
- Focus: `focus-visible` style required; do not suppress `:focus-visible` outline entirely
- Contrast: primary variant ink-on-surface meets WCAG AA (≥4.5:1 at 14px)

## Do / Don't

| Do | Don't |
|---|---|
| Use `btn-primary` for the single most important CTA per context | Use multiple `btn-primary` in one toolbar row |
| Use `btn-ghost` for secondary/cancel actions in modal footers | Use ghost for primary CTAs |
| Match height to `--md-sys-density-row` for layout alignment | Hardcode height to 32px bypassing density token |
| Group related actions with `gap: 8px` | Stack buttons vertically unless the viewport forces it |

## Implementation Notes

- The existing `.btn` CSS in `globals.css` implements this spec. Token CSS in `tokens-comp.css` maps slots to system tokens for agent consumption.
- `font-family: inherit` is explicitly set on `button` in globals.css — do not omit when re-implementing.
- `transition: background 0.12s, transform 0.05s` drives the hover + press animation.
