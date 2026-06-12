# Token Architecture

## Prefixes

| Layer | Prefix | Responsibility |
|---|---|---|
| Reference | `--md-ref-*` | Raw values only — no semantic or component names |
| System | `--md-sys-*` | Shared semantic roles — references ref tokens only |
| Component | `--md-comp-*` | Component slots — references sys tokens only |

## Inheritance

```txt
component token -> system token -> reference value
```

No component token may skip a layer and point directly at a ref token.
No system token may include component-specific anatomy in its name.

## Reference Color Scale

```txt
100 (lightest) -> 0 (darkest)
```

- `100` is the lightest visible step (white or near-white).
- `0` is the darkest visible step (near-black).
- Warm-neutral palette: steps 100, 97, 95, 93, 75, 58, 42, 18, 10.
- Cool-dark palette (dark mode): steps 93, 79, 54, 37, 23, 14, 11, 9, 6.
- Accent (violet): steps 95, 74, 66, 52.
- Categorical colors: not a lightness progression — named by hue (cat-1..8).
- Status colors: not a lightness progression — named by semantic role.

## Layer Rules

| Layer | Allowed | Forbidden |
|---|---|---|
| Reference | raw color steps, raw sizes, raw radii, font family names, raw weights, raw opacity values | semantic names (primary, surface, error), component names (button, card, nav) |
| System | color roles with `on-*` pairs, spacing roles, shape roles, typescale roles, elevation roles, density roles | component anatomy (button-padding, card-header-gap), hardcoded values when ref tokens exist |
| Component | component slots: container, label, icon, meta, state layer | raw values, reference token references |

## Near Token Decisions

### Colors

| Candidate A | Candidate B | Difference | Decision | Rationale |
|---|---|---|---|---|
| `--divider: rgba(28,25,23,0.06)` | `--border: rgba(28,25,23,0.08)` | 2% alpha | **keep distinct** | Divider is a hairline content separator; border is a visible control outline. Different semantic weight and WCAG role. Evidence: divider used inside panels, border on interactive surfaces. |
| `--bg: #FAFAF7` | `--surface-2: #F7F6F2` | ~2 lightness units | **keep distinct** | Background is the page canvas (step 97); surface-2 is an elevated secondary surface (step 95) within components (input fills, column headers). Different stacking level. |
| `--hue-c3: oklch(0.66 0.11 200)` | `--hue-c7: oklch(0.62 0.10 220)` | ΔL=0.04 ΔH=20° | **keep distinct** | Both are categorical department colors. Merging would eliminate a color identity for a department team. Evidence: separate hue entries in DEPT_HUE. |
| `--hue-c8: oklch(0.66 0.10 110)` | `--hue-c4: oklch(0.66 0.10 140)` | ΔH=30° | **keep distinct** | Same as above — categorical identifiers for distinct departments. |

### Spacing / Size

| Candidate A | Candidate B | Difference | Decision | Rationale |
|---|---|---|---|---|
| `--density-card: 14px` | `--density-pad: 16px` | 2px | **keep distinct** | Card padding is intentionally tighter than component padding to maintain card compactness. Evidence: both tokens are explicit in globals.css and behave differently in compact mode (10px vs 10px — same in compact, differ only in default). |
| `6px` (inline icon gap) | `8px` (kcard-row gap, stack) | 2px | **keep distinct** | Represents xs vs sm gap step. Merging would unify icon-label tightness with stack gaps, changing visual rhythm. |

## Dark Mode

Dark mode overrides the same system token names under `[data-theme="dark"]`. Reference tokens for the cool-dark palette are defined separately and aliased in system tokens via the dark override block.

The accent token shifts: light `oklch(0.52 0.14 282)` → dark `oklch(0.74 0.14 282)` (lightened for contrast on dark surface). Accent-soft inverts: light `oklch(0.94 0.03 282)` → dark `oklch(0.28 0.05 282)`. On-primary shifts from `#FFFFFF` to `#0E0E10`.

## Density Mode

Density is driven by `[data-density="compact"]` overriding three tokens:

```css
[data-density="compact"] {
  --md-sys-density-pad: var(--md-ref-size-10);
  --md-sys-density-row: var(--md-ref-size-28);
  --md-sys-density-card: var(--md-ref-size-10);
}
```

Components that consume density tokens will automatically adapt. Do not hardcode padding values in component tokens; reference density system tokens.

## Required Audit

Run after each extraction or component pass:

```sh
node ~/.claude/skills/design-system-extractor/scripts/audit_tokens.mjs /Users/user/Work/design-ops --strict
```

Audit enforces:
- No `comp` token references a `ref` token directly
- No `sys` name includes component anatomy
- No `ref` name includes semantic role names
- `ref` color steps follow 100→0 (lightest→darkest)
- Near-color and near-numeric candidates have documented decisions
- Every background-like `sys` color has a matching `on-*` pair
