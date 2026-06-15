# MonthPillNavigator

行內月份選擇器，顯示當前月份並提供前 / 後切換按鈕。固定 30px 高度，以分隔邊框區分三個區段。數值使用等寬數字排版。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-MPN01 | `src/components/ui/MonthPillNavigator/MonthPillNavigator.tsx` | MonthPillNavigator component | prev chevron + value + next chevron; 30px height |
| E-CO-MPN02 | `src/components/ui/MonthPillNavigator/MonthPillNavigator.css` | CSS classes | corner-md; divider borders; tabular-nums |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 容量/排班視圖的月份導覽；行內複合控制；不是獨立的導覽元件 |
| Anatomy | 左箭頭 · 月份值 · 右箭頭；三段以垂直分隔線區分 |
| Variants / states / modes | 無 size variant；prev/next 按鈕有 hover/active 狀態 |
| Token contract summary | corner-md；height 固定 30px；分隔色用 outline；數值 tabular-nums |
| Layout / density | 行內 flex，固定 30px 高；寬度由內容決定 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Button（Button 是單獨操作觸發；MonthPillNavigator 是帶 display slot 的複合導覽控制，功能和結構不同）|

## Anatomy

```
<div class="ui-month-pill">
  <button class="ui-month-pill__prev">‹</button>
  <span class="ui-month-pill__value">{year}年{month}月</span>
  <button class="ui-month-pill__next">›</button>
</div>
```

## Variants

無獨立 variant。left/right 按鈕有 hover 狀態，value slot 無互動。

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | outline 邊框，surface 背景 |
| prev/next hover | `:hover` on button | surface-variant 背景 |
| prev/next active | `:active` | press transform |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-month-pill-height` | *(raw: 30px)* | 固定高度 | all |
| `--md-comp-month-pill-radius` | `--md-sys-shape-corner-md` | 整體圓角 | all |
| `--md-comp-month-pill-bg` | `--md-sys-color-surface` | 背景 | all |
| `--md-comp-month-pill-border` | `--md-sys-color-outline` | 外框 | all |
| `--md-comp-month-pill-divider` | `--md-sys-color-outline` | 段落分隔 | all |
| `--md-comp-month-pill-value-size` | `--md-sys-typescale-body-medium-size` | 月份文字大小 | all |
| `--md-comp-month-pill-value-color` | `--md-sys-color-on-surface` | 月份文字色 | all |
| `--md-comp-month-pill-btn-hover-bg` | `--md-sys-color-surface-variant` | 箭頭 hover | hover |
| `--md-comp-month-pill-transition` | `--md-sys-motion-duration-sm` | 動畫 | all |

## Layout Rules

- 整體 `display: inline-flex; align-items: center`
- 三段以 `border-right` / `border-left` 垂直分隔線分隔
- value slot 有固定最小寬度（如 7–8 字元寬），避免切換月份時抖動
- `font-variant-numeric: tabular-nums` 確保數字等寬

## Content Rules

- value 格式：`{year}年{month}月`（如「2026年6月」）
- 月份不補零（6月而非06月）
- 箭頭使用 chevron SVG 圖示，不使用文字 `<` `>`

## Accessibility Rules

- prev/next `<button>` 需有 `aria-label="上個月"` / `aria-label="下個月"`
- value slot `aria-live="polite"` 以通知螢幕閱讀器月份變更

## Do / Don't

| 應做 | 不應做 |
|---|---|
| value slot 固定最小寬度，防止版面跳動 | 讓 pill 寬度隨月份字數增減 |
| tabular-nums 確保數字等寬 | 使用比例數字字體（會造成數字寬度不一致）|

## Implementation Notes

`src/components/ui/MonthPillNavigator/MonthPillNavigator.tsx` 為參考實作。元件為受控（controlled），需外部傳入 `value` 和 `onChange`。
