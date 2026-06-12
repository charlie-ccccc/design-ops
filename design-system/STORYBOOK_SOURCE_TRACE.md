# Storybook Source Trace

- Design-system root: `/Users/user/Work/design-ops/design-system`
- Package root: `/Users/user/Work/design-ops`
- Sources found: 12
- Figma: 0
- Images: 2
- Frontend folders: 8
- Rendered routes: 2
- Unresolved local sources: 0

## Source Index

| Source IDs | Type | Location | Resolved path | Components | Seen in | Status |
|---|---|---|---|---|---|---|
| S01 | frontend-folder | src/app/globals.css | - | button, kanban-card, kpi-card | design-system/DESIGN_EVIDENCE_MAP.md:7, design-system/components/button.md:11, design-system/components/button.md:12, design-system/components/button.md:13, design-system/components/kanban-card.md:11, design-system/components/kpi-card.md:11 | remote |
| S02 | frontend-folder | src/app/layout.tsx | - | - | design-system/DESIGN_EVIDENCE_MAP.md:8 | remote |
| S05 | frontend-folder | src/components/auth/login-page.tsx | - | - | design-system/DESIGN_EVIDENCE_MAP.md:11 | remote |
| S06 | frontend-folder | src/components/dashboard/index.tsx | - | kpi-card | design-system/DESIGN_EVIDENCE_MAP.md:12, design-system/components/kpi-card.md:12 | remote |
| S04 | frontend-folder | src/components/kanban/board.tsx | - | - | design-system/DESIGN_EVIDENCE_MAP.md:10 | remote |
| S03 | frontend-folder | src/components/kanban/card.tsx | - | kanban-card | design-system/DESIGN_EVIDENCE_MAP.md:9, design-system/components/kanban-card.md:12 | remote |
| S08 | frontend-folder | src/lib/data.ts | - | kanban-card | design-system/DESIGN_EVIDENCE_MAP.md:14, design-system/components/kanban-card.md:13 | remote |
| S07 | frontend-folder | src/lib/types.ts | - | kanban-card | design-system/DESIGN_EVIDENCE_MAP.md:13, design-system/components/kanban-card.md:14 | remote |
| - | image | assets/component-review/button-vs-month-pill.svg | - | - | design-system/COMPONENT_INVENTORY.md:10 | remote |
| - | image | assets/component-review/kpi-vs-donut.svg | - | - | design-system/COMPONENT_INVENTORY.md:9 | remote |
| - | rendered-route | http://localhost:3001/ | - | - | design-system/DESIGN_EVIDENCE_MAP.md:15 | remote |
| S09 | rendered-route | http://localhost:3001/ · 1280×720 · unauthenticated | - | - | design-system/DESIGN_EVIDENCE_MAP.md:15 | remote |

## Figma MCP Targets

| Location | File key | Node or page | Suggested read |
|---|---|---|---|
| - | - | - | - |

## Component Source Links

| Component | Source IDs / locations |
|---|---|
| button | S01 |
| kanban-card | S01; S03; S08; S07 |
| kpi-card | S01; S06 |

## Story Source URL Parameters

| Component | Preferred URL | Story parameter | Source IDs |
|---|---|---|---|
| - | - | - | - |

## Missing Or Ambiguous Sources

- None detected.

## Usage Notes

- Inspect Figma sources with Figma MCP before implementing components that reference those sources.
- Inspect image/crop sources directly and use them for Storybook visual checks.
- Inspect frontend-folder sources for behavior and existing implementation patterns, but keep extracted tokens and component specs normative.
- If a source contradicts the extracted spec, update the implementation map and ask whether to revise the extraction.

