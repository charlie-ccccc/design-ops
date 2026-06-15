# Panel

通用容器元件，提供一致的邊框、圓角與選用標頭。作為 KPI Card、表格區域、通知面板等複合元件的底層結構。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-PL01 | `src/components/ui/Panel/Panel.tsx` | Panel component | optional header (title + subtitle + actions); uses --md-comp-panel-* tokens |
| E-CO-PL02 | `src/components/ui/Panel/Panel.css` | CSS slots | border-bottom divider on header |
| E-CO-PL03 | `tokens/tokens-comp.css` | Panel section | comp tokens already extracted |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 頁面區塊容器；提供一致的 surface + 邊框 + 圓角；header 可選 |
| Anatomy | 容器（surface bg + border）· 選用 header（title + subtitle + actions slot）· body slot |
| Variants / states / modes | with-header vs. no-header；無互動狀態 |
| Token contract summary | container-color、border、radius from comp；header padding、title、sub from comp |
| Layout / density | 不固定尺寸，由父容器決定；header 有固定 padding |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | KPI Card（KPI Card 是 Panel 的具體應用，有固定 padding 和 data slot；Panel 是通用殼層）|

## Anatomy

```
<div class="ui-panel">
  <div class="ui-panel__header">   ← 可選
    <div class="ui-panel__title-wrap">
      <span class="ui-panel__title">{title}</span>
      <span class="ui-panel__sub">{subtitle}</span>   ← 可選
    </div>
    <div class="ui-panel__actions">{actions}</div>   ← slot
  </div>
  <div class="ui-panel__body">{children}</div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| no-header | 無 `title` prop | 僅顯示 body |
| with-header | 傳入 `title` | 顯示帶底線分隔的 header |

## States

僅作為殼層，本身無互動狀態。子元件的 hover/active 狀態與 Panel 無關。

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-panel-container-color` | `--md-sys-color-surface` | 背景 | all |
| `--md-comp-panel-container-border` | `--md-sys-color-outline` | 邊框 | all |
| `--md-comp-panel-container-radius` | `--md-sys-shape-corner-lg` | 圓角 | all |
| `--md-comp-panel-header-border` | `--md-sys-color-divider` | header 底線 | with-header |
| `--md-comp-panel-header-padding-block` | `--md-sys-spacing-inset-md` | header 垂直 padding | with-header |
| `--md-comp-panel-header-padding-inline` | `--md-sys-spacing-inset-lg` | header 水平 padding | with-header |
| `--md-comp-panel-header-title-size` | `--md-sys-typescale-body-semibold-size` | title 字體大小 | with-header |
| `--md-comp-panel-header-title-weight` | `--md-sys-typescale-body-semibold-weight` | title 字重 | with-header |
| `--md-comp-panel-header-sub-color` | `--md-sys-color-on-surface-muted` | subtitle 顏色 | with-header |
| `--md-comp-panel-header-sub-size` | `--md-sys-typescale-meta-size` | subtitle 字體 | with-header |

## Layout Rules

- 寬度由父容器決定，Panel 本身不設定 width
- `border-radius` 一致用 corner-lg（比 Button 和 Kanban Card 更大）
- Header 底線使用 `border-bottom: 1px solid var(--md-comp-panel-header-border)`
- `body` slot 的 padding 由使用方自行決定（Panel 不強制內部 padding）

## Content Rules

- `title`：短標題字串
- `subtitle`（可選）：次要描述文字
- `actions`（可選）：右側操作區 slot（通常放 Button ghost）

## Accessibility Rules

- Header `title` 通常設為 `<h2>` 或 `<h3>`，依頁面標題層級決定
- `actions` slot 中的按鈕需有 `aria-label`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 用 Panel 作為儀表板、抽屜、通知等區塊的容器 | 為單一文字段落套用 Panel（過度使用）|
| body padding 由子元件或使用方自行定義 | 在 Panel 本身加硬編碼 padding |

## Implementation Notes

`src/components/ui/Panel/Panel.tsx` 為參考實作。Panel 的 `body` 無預設 padding，以確保彈性（子元件如 Table 需要 edge-to-edge 佈局）。
