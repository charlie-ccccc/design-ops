# Storybook Component Build Plan

- Design-system root: `/Users/user/Work/design-ops/design-system`
- Package root: `/Users/user/Work/design-ops`
- Source trace: `/Users/user/Work/design-ops/design-system/STORYBOOK_SOURCE_TRACE.md`
- Components ordered: 25
- Batches: 7
- Skipped components: 0
- Dependency cycles: 0

## Recommended Build Order

| Order | Batch | Component | Category | Depends on | Used by | Story source URL | Build reason |
|---|---|---|---|---|---|---|---|
| 1 | B01 | Avatar | primitive | - | Kanban Card | - | core dependency tier; used by 1 component |
| 2 | B01 | Rich Text Editor (TipTap) | primitive | - | - | - | core dependency tier |
| 3 | B01 | Donut Center Lockup | typographic | - | KPI Card | - | core dependency tier; used by 1 component |
| 4 | B01 | Input / Select | form-control | - | - | - | no dependencies detected |
| 5 | B02 | Form Row | form-control | - | - | - | no dependencies detected |
| 6 | B02 | Kanban Column | layout | - | - | - | no dependencies detected |
| 7 | B02 | Sidebar Item | navigation | - | - | - | no dependencies detected |
| 8 | B02 | Badge / Tag family | data-display | - | - | - | no dependencies detected |
| 9 | B03 | Capacity Table | data-display | - | - | - | no dependencies detected |
| 10 | B03 | Crosstab Table | data-display | - | - | - | no dependencies detected |
| 11 | B03 | Archive Card | data-display | - | - | - | no dependencies detected |
| 12 | B03 | Chart SVGs (CircleChart, BarsChart) | data-display | - | - | - | no dependencies detected |
| 13 | B04 | Modal | overlay | - | Button | - | used by 1 component |
| 14 | B04 | Button | primitive | Modal | Google Auth button | - | core dependency tier; used by 1 component; after 1 dependency |
| 15 | B04 | Google Auth button | primitive | Button | - | - | core dependency tier; after 1 dependency |
| 16 | B04 | Detail Drawer | overlay | - | - | - | no dependencies detected |
| 17 | B05 | Panel | composite | - | KPI Card, Notification Panel | - | used by 2 components |
| 18 | B05 | Notification Panel | composite | Panel | - | - | after 1 dependency |
| 19 | B05 | Component | unknown | - | KPI Card, Kanban Card | - | used by 2 components |
| 20 | B05 | Kanban Card | data-display | Avatar, Component | - | - | after 2 dependencies |
| 21 | B06 | KPI Card | data-display | Component, Donut Center Lockup, Panel | - | - | after 3 dependencies |
| 22 | B06 | Brand Mark | unknown | - | - | - | no dependencies detected |
| 23 | B06 | Month Pill Navigator | unknown | - | - | - | no dependencies detected |
| 24 | B06 | Leave Calendar | unknown | - | - | - | no dependencies detected |
| 25 | B07 | Timeline | unknown | - | - | - | no dependencies detected |

## Batch Plan

| Batch | Components | Shared dependencies | Tiers | Rationale | Exit criteria |
|---|---|---|---|---|---|
| B01 | Avatar, Rich Text Editor (TipTap), Donut Center Lockup, Input / Select | - | primitive, typographic, form-control | Establish primitive components before composed patterns. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B02 | Form Row, Kanban Column, Sidebar Item, Badge / Tag family | - | form-control, layout, navigation, data-display | Continue dependency-ordered form-control implementation. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B03 | Capacity Table, Crosstab Table, Archive Card, Chart SVGs (CircleChart, BarsChart) | - | data-display | Continue dependency-ordered data-display implementation. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B04 | Modal, Button, Google Auth button, Detail Drawer | - | overlay, primitive | Establish overlay components before composed patterns. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B05 | Panel, Notification Panel, Component, Kanban Card | Avatar | composite, unknown, data-display | Build composed patterns after their lower-level dependencies are available. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B06 | KPI Card, Brand Mark, Month Pill Navigator, Leave Calendar | Component, Donut Center Lockup, Panel | data-display, unknown | Build composed patterns after their lower-level dependencies are available. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |
| B07 | Timeline | - | unknown | Build composed patterns after their lower-level dependencies are available. | component/page folder, co-located story, source URL parameters, queue status, and verification log updated |

## Dependency Details

| Component | Depends on | Dependency reason | Source refs | Spec file |
|---|---|---|---|---|
| Avatar | - | - | - | - |
| Rich Text Editor (TipTap) | - | - | - | - |
| Donut Center Lockup | - | - | - | - |
| Input / Select | - | - | - | - |
| Form Row | - | - | - | - |
| Kanban Column | - | - | - | - |
| Sidebar Item | - | - | - | - |
| Badge / Tag family | - | - | - | - |
| Capacity Table | - | - | - | - |
| Crosstab Table | - | - | - | - |
| Archive Card | - | - | - | - |
| Chart SVGs (CircleChart, BarsChart) | - | - | - | - |
| Modal | - | - | - | - |
| Button | Modal | Modal: dependency phrase in component spec | S01 | design-system/components/button.md |
| Google Auth button | Button | Button: component name composition | - | - |
| Detail Drawer | - | - | - | - |
| Panel | - | - | - | - |
| Notification Panel | Panel | Panel: component name composition | - | - |
| Component | - | - | - | - |
| Kanban Card | Avatar, Component | Component: dependency phrase in component spec; Avatar: explicit dependency/composition section; dependency phrase in component spec | S01; S03; S08; S07 | design-system/components/kanban-card.md |
| KPI Card | Component, Donut Center Lockup, Panel | Donut Center Lockup: dependency phrase in component spec; Component: dependency phrase in component spec; Panel: explicit dependency/composition section | S01; S06 | design-system/components/kpi-card.md |
| Brand Mark | - | - | - | - |
| Month Pill Navigator | - | - | - | - |
| Leave Calendar | - | - | - | - |
| Timeline | - | - | - | - |

## Dependency Cycles

- None detected.

## Skipped Components

- None.

## Usage Notes

- Implement components in the recommended order unless product discovery proves an existing component can be reused first.
- Do not build a composed component before its listed dependencies are implemented, reused, or explicitly marked blocked with a reason.
- Implement typographic/text-lockup components as editable, token-backed display components; do not flatten them into generic heading/subheading styles.
- After each component, update the queue/implementation map before starting the next component.
- Put new component stories beside their component files; reserve root `stories/` or `src/stories/` for foundation guides/docs.
- Put requested page/screen implementations in dedicated page folders with co-located page stories.
- If a dependency is inferred incorrectly, record the correction in the implementation map and update the queue ordering.

