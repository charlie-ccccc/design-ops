# Badge / Tag Family

三種行內標籤元件：Chip（膠囊形，可選狀態點）、Tag（方形標籤）、DeptPill（帶部門色點的膠囊）。全部直接使用 sys token，無 comp token 層。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-BA01 | `src/components/ui/Badge/Badge.tsx` | Badge exports | Chip, Tag, DeptPill; sys tokens used directly |
| E-CO-BA02 | `src/components/ui/Badge/Badge.css` | CSS classes | .ui-chip, .ui-tag, .ui-dept-pill; shape, color, dot |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 行內分類標籤；display-only（無點擊）；用於卡片分類、部門標識、狀態標記 |
| Anatomy | 膠囊/方形容器 · 可選色點 · 標籤文字 |
| Variants / states / modes | Chip（pill, 可選 dot）、Tag（square, 6px radius）、DeptPill（pill + 部門色點）|
| Token contract summary | 直接使用 sys color、shape、typescale token；無 comp token 層 |
| Layout / density | 行內元素，高度由 line-height 決定；不固定寬度 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Kanban Card category badge（功能類似，但 kcard-cat 是 kanban card 的子槽位，Badge 是獨立元件）|

## Anatomy

```
<!-- Chip -->
<span class="ui-chip [ui-chip--dot]">
  <span class="ui-chip__dot"></span>   ← 可選
  {label}
</span>

<!-- Tag -->
<span class="ui-tag">{label}</span>

<!-- DeptPill -->
<span class="ui-dept-pill">
  <span class="ui-dept-pill__dot" style="background: var(--md-sys-color-cat-{N})"></span>
  {label}
</span>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| Chip | `<Chip>` | 膠囊形（99px radius），border，可選色點 |
| Chip + dot | `<Chip dot>` | 同上 + 左側小色點 |
| Tag | `<Tag>` | 6px radius 方形，填充 surface-variant 背景 |
| DeptPill | `<DeptPill hue={N}>` | 膠囊形 + 部門色點（cat-N）|

## States

僅顯示元件，無互動狀態。DeptPill 的 dot 顏色隨 `hue` prop 動態設定。

## Token Contract

這些元件直接引用 sys token，不透過 comp token 層（因為無需元件級複寫）。

| Slot | Sys token used | Purpose |
|---|---|---|
| Chip container bg | `--md-sys-color-surface` | 底色 |
| Chip border | `--md-sys-color-outline` | 邊框 |
| Chip radius | `--md-sys-shape-corner-full` | 膠囊圓角（99px）|
| Chip text | `--md-sys-color-on-surface-secondary` | 文字 |
| Chip text size | `--md-sys-typescale-meta-size` | 字體大小 |
| Tag bg | `--md-sys-color-surface-variant` | 背景 |
| Tag radius | `--md-sys-shape-corner-sm` | 6px 圓角 |
| Tag text | `--md-sys-color-on-surface-secondary` | 文字 |
| DeptPill dot | `--md-sys-color-cat-{1–8}` | 部門色（inline style）|
| DeptPill text | `--md-sys-color-on-surface-secondary` | 文字 |

## Layout Rules

- 行內（`display: inline-flex`）；不佔滿整行
- Chip / DeptPill padding：4px 8px（垂直/水平）
- Tag padding：2px 6px
- dot 大小：6px 圓形（`border-radius: 50%`）

## Content Rules

- 標籤文字保持簡短（2–6 字）
- DeptPill `hue`：整數 1–8，與 Avatar `hue` 使用相同來源（`DEPT_HUE`）

## Accessibility Rules

- 如 Chip 有語意（例如類別篩選），需 `role="status"` 或包在 `<ul>` 中
- DeptPill dot 為裝飾性，`aria-hidden="true"`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| Chip 用於可移除或狀態類標籤（但本身不實作移除）| 混用 Chip 和 Tag 表示同一種資料 |
| Tag 用於靜態分類（技術棧、類型）| 對 Tag 加 hover 效果暗示可點擊 |
| DeptPill 用於部門識別，hue 來自 DEPT_HUE | 為 DeptPill dot 硬編碼顏色 |

## Implementation Notes

`src/components/ui/Badge/Badge.tsx` 匯出三個元件。無 comp token 層是刻意設計——這些元件足夠簡單，直接使用 sys token 即可，引入 comp token 只會增加無謂的間接層。
