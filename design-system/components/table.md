# Table

泛型資料表格元件，支援黏性標頭、可選黏性第一欄、頁尾合計列、行 highlight 與 hover 狀態。標頭背景使用 surface-variant。全面使用等寬數字排版。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-TB01 | `src/components/ui/Table/Table.tsx` | Table<T> generic component | sticky header + optional sticky first col; footer/totals row; row highlight |
| E-CO-TB02 | `src/components/ui/Table/Table.css` | CSS classes | header: 12px/uppercase/+0.06em/surface-variant; hover: primary 4% tint; highlight: primary 8% tint; empty state; tabular-nums |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 容量、跨表等資料密集視圖的資料表；泛型 `Table<T>` 接受 columns 和 data props |
| Anatomy | 標頭行（surface-variant bg）· 資料行 · 可選頁尾合計行 · 空態訊息 |
| Variants / states / modes | default；sticky-col（可選）；有 / 無 footer；行 highlight |
| Token contract summary | header: surface-variant；hover: primary 4%；highlight: primary 8%；全面 tabular-nums |
| Layout / density | `display: table`（原生 HTML table）；無固定高度，由父容器決定；header sticky |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Panel（Panel 是容器殼層；Table 是資料展示元件，通常放置於 Panel 的 body slot 中）|

## Anatomy

```
<div class="ui-table-wrap">
  <table class="ui-table">
    <thead class="ui-table__head">
      <tr>
        <th class="ui-table__th [ui-table__th--sticky]">{colLabel}</th>
        …
      </tr>
    </thead>
    <tbody>
      <tr class="ui-table__row [ui-table__row--highlight]">
        <td class="ui-table__td [ui-table__td--sticky]">{value}</td>
        …
      </tr>
    </tbody>
    <tfoot class="ui-table__foot">   ← 可選
      <tr>
        <td class="ui-table__td">{total}</td>
        …
      </tr>
    </tfoot>
  </table>
  <!-- empty state: 無資料時顯示 -->
  <div class="ui-table__empty">{emptyMessage}</div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| default | 常態 | 黏性標頭，無黏性第一欄 |
| sticky-col | `stickyFirstCol={true}` | 第一欄也 sticky（適合跨表/容量表）|
| with-footer | `footer` prop 存在 | 顯示頁尾合計列 |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | 無特殊色 |
| hover | `tr:hover` | primary 4% tint（`color-mix`）|
| highlight | `isHighlighted={true}` | primary 8% tint |
| empty | 無 data | 顯示 emptyMessage 文字 |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-table-header-bg` | `--md-sys-color-surface-variant` | 標頭背景 | all |
| `--md-comp-table-header-size` | `--md-sys-typescale-meta-size`（12px）| 標頭字體 | all |
| `--md-comp-table-header-weight` | `--md-sys-typescale-label-weight` | 標頭字重 | all |
| `--md-comp-table-header-tracking` | `--md-sys-typescale-label-tracking`（+0.06em）| 標頭字間距 | all |
| `--md-comp-table-header-color` | `--md-sys-color-on-surface-muted` | 標頭文字色 | all |
| `--md-comp-table-border` | `--md-sys-color-divider` | 行分隔線 | all |
| `--md-comp-table-cell-padding-block` | `--md-sys-spacing-inset-sm` | 儲存格垂直 padding | all |
| `--md-comp-table-cell-padding-inline` | `--md-sys-spacing-inset-md` | 儲存格水平 padding | all |
| `--md-comp-table-hover-bg` | `color-mix(in oklab, var(--md-sys-color-primary) 4%, transparent)` | hover 背景 | hover |
| `--md-comp-table-highlight-bg` | `color-mix(in oklab, var(--md-sys-color-primary) 8%, transparent)` | highlight 背景 | highlight |
| `--md-comp-table-footer-bg` | `--md-sys-color-surface-variant` | 頁尾背景 | with-footer |

## Layout Rules

- `overflow: auto`（父容器）；table `min-width: max-content` 確保不自動截斷
- 標頭 `position: sticky; top: 0; z-index: 1`
- sticky 第一欄：`position: sticky; left: 0; z-index: 2`（需高於標頭）
- `font-variant-numeric: tabular-nums` 全表適用

## Content Rules

- 標頭：全大寫、12px（CSS `text-transform: uppercase`）
- 數字儲存格：`text-align: right`
- 文字儲存格：`text-align: left`
- emptyMessage：說明性文字（如「本月尚無資料」）

## Accessibility Rules

- `<th scope="col">` 標示欄標頭；`<th scope="row">` 標示列標頭
- 黏性第一欄通常是列標頭（`<th scope="row">`）
- `<caption>` 或 `aria-label` 描述表格用途

## Do / Don't

| 應做 | 不應做 |
|---|---|
| hover 和 highlight 使用 `color-mix` 而非 opacity，保持文字可讀性 | 用 `opacity: 0.5` 做 hover（影響文字可讀性）|
| 全表 `tabular-nums` 確保數字對齊 | 在每個數字儲存格單獨設字體 |
| `stickyFirstCol` 用於需要橫向滾動的跨表 | 所有表格都啟用 sticky 第一欄（增加複雜度）|

## Implementation Notes

`src/components/ui/Table/Table.tsx` 使用 TypeScript 泛型 `Table<T>`，`columns` prop 定義欄位名稱、取值函式和對齊方式。hover 和 highlight 均使用 `color-mix(in oklab, ...)` 以避免 `opacity` 導致子元素半透明問題。
