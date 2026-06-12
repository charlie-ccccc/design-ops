# Anti-AI Style Rules

Project-specific constraints for CMoneyDesign 設計部工作看板. Apply before generating any UI recommendation.

## Do Not Add Unless Evidenced

- Background gradients on any content surface (the sidebar brand mark uses a subtle gradient; that's the only occurrence)
- Glassmorphism or frosted glass on content surfaces (the only blur is the modal/drawer overlay scrim)
- Glow blobs, orbs, bokeh, SVG abstract waves, animated backgrounds
- Generic SaaS hero sections with marketing copy
- Decorative illustration panels
- Nested outlined cards — one surface layer maximum
- Row-as-card treatment — data rows are rows, not cards
- Extra whitespace beyond observed density (this is an operational tool; density is a feature)
- Additional border-radius steps beyond the 4 defined (6, 9, 12, 16px)
- Additional shadow levels beyond the 3 defined (sm, md, lg)
- Over-saturated tinted surfaces using accent (violet accent appears only on active states, avatars, and CTAs)

## Color Constraints

- Do not introduce a 9th categorical color without a new department entity to map it to
- Do not apply accent as a section-background tint (e.g. a violet hero band, tinted sidebar)
- Do not assume white foreground on custom bg colors — use `--md-sys-color-on-primary` (white) only on violet (`--md-sys-color-primary`) and confirmed dark surfaces
- Do not use `status-error` for anything other than: blocked/overrun hours, overdue due dates, negative delta, blocked column status
- Do not add semantic colors (amber warning, info blue, etc.) outside the 5-status system unless a new product state requires it
- Dark mode surface neutrals are cooler (slightly blueish) than light mode; do not use warm-neutral hex values for dark mode surfaces

## Typography Constraints

- Do not use display scale (28px) for any UI text that is not a primary metric value
- Do not make all text 600-weight — the weight hierarchy (400 body / 500 content / 600 label+heading) is intentional
- Do not reduce tracking on 12px labels — they require +0.06–0.08em at uppercase scale
- Do not add tracking to body text beyond the existing +0.005em baseline
- Do not remove `font-variant-numeric: tabular-nums` from any numeric data column, table cell, or metric value
- Do not use font sizes outside the defined scale (10, 11, 12, 13, 14, 15, 16, 18, 22, 28px) without evidence

## Layout Constraints

- Do not increase topbar height above 56px
- Do not reduce sidebar width below 232px on desktop
- Do not break the page-gutter uniformity (22px horizontal, 18px vertical) without a density-level override
- Do not add a bottom navigation bar — this is a desktop-first tool; mobile uses the sidebar overlay pattern
- Do not wrap every kanban column in a second panel — columns are already panels (`.kcol` uses surface bg + border)
- Do not add fixed-position floating action buttons other than the existing `.perm-info-btn` (a domain-specific permissions hint)

## Component Constraints

- Do not flatten kanban card slots — the id / category-badge / priority-flag / title / dept / meta structure is intentional and must be preserved
- Do not use the same border radius for the modal (16px) and the kanban column (12px) — the hierarchy is deliberate
- Do not add card hover animations beyond the current border-color + shadow transition
- Do not replace the dashed meta-row divider in kanban cards with a solid divider — the dashed style signals metadata, not a section boundary
- Do not add a thumbnail/image slot to kanban cards — the product model has no visual attachments on cards (attachments are a count only)
- Do not invent a "compact variant" for the KPI card — density is already handled at the system level via `--md-sys-density-*` tokens; the KPI card uses fixed padding

## Realistic Content Rules

- Use realistic zh-Hant department names from `DEPTS` constant — do not use placeholder names like "Department A"
- Use realistic member aliases from `MEMBERS` — do not use "User 1", "Admin", "John"
- Card titles must be product/design task language (e.g. `金融大眾首頁改版`, `保險商品頁 Banner`) — not generic lorem ipsum
- KPI labels must use product vocabulary: `本月工時`, `完成率`, `任務總數`, `產能` — not generic `Revenue`, `Users`, `Growth`
- Status names use zh-Hant (待辦 / 設計中 / 審查中 / 完成 / 暫停) — not English status labels in UI
