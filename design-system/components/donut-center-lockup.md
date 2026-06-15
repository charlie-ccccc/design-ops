# DonutCenterLockup

絕對定位於圓環圖中心的文字排版元件，顯示大數值 + 小型全大寫說明標籤。不含圓環本身（由 Recharts 提供）。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-DCL01 | `src/components/ui/DonutCenterLockup/DonutCenterLockup.tsx` | DonutCenterLockup component | position: absolute; inset: 0; value 22px/600/-0.02em; label 12px/muted/uppercase/+0.08em |
| E-CO-DCL02 | `src/components/ui/DonutCenterLockup/DonutCenterLockup.css` | CSS classes | tabular-nums on value |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 圓環圖的文字中心點；絕對定位覆蓋在 SVG 容器上；display-only |
| Anatomy | 值（22px/600）· 說明標籤（12px/uppercase/muted）|
| Variants / states / modes | 無；單一排版 |
| Token contract summary | value 使用 display scale；label 使用 meta scale + uppercase；無 comp token 層 |
| Layout / density | `position: absolute; inset: 0`；flex center 居中 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | KPI Card value slot（KPI Card 有完整面板殼層；DonutCenterLockup 是絕對定位的文字 overlay，純排版元件）|

## Anatomy

```
<div class="ui-donut-center">
  <span class="ui-donut-center__value">{value}</span>
  <span class="ui-donut-center__label">{label}</span>
</div>
```

## Variants

無 variant，固定排版。父容器（圓環圖 wrapper）需設 `position: relative`。

## States

Display-only，無互動狀態。

## Token Contract

直接使用 sys token，無 comp token 層（元件過小，引入 comp 層無實質效益）。

| Slot | Sys token | Purpose |
|---|---|---|
| value 字體大小 | `--md-sys-typescale-display-size`（22px）| 大數值 |
| value 字重 | `--md-sys-typescale-display-weight`（600）| 數值強調 |
| value 字間距 | `--md-sys-typescale-display-tracking`（-0.02em）| 緊縮字距 |
| value 顏色 | `--md-sys-color-on-surface` | 主色文字 |
| label 字體大小 | `--md-sys-typescale-meta-size`（12px）| 說明文字 |
| label 顏色 | `--md-sys-color-on-surface-muted` | 淡色說明 |
| label 字間距 | `--md-sys-typescale-label-tracking`（+0.08em）| 全大寫字間距 |

## Layout Rules

- `position: absolute; inset: 0` 疊加於父容器
- `display: flex; flex-direction: column; align-items: center; justify-content: center`
- 父容器需設 `position: relative`
- value `font-variant-numeric: tabular-nums`

## Content Rules

- `value`：短數字字串（如「72%」「34」）
- `label`：極短說明（如「完成率」「人日」），CSS `text-transform: uppercase`

## Accessibility Rules

- 整個 lockup 需有 `aria-label` 或父容器 `<figure>` + `<figcaption>` 說明圖表含義
- 數值和標籤均不需單獨 `aria-label`（由父容器的標題提供脈絡）

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 父容器 `position: relative` 確保絕對定位正確 | 用 `margin: auto` 嘗試居中（會失效）|
| value 使用 tabular-nums 確保數字等寬 | 在 lockup 中放超過 2 行文字（會破壞圓環視覺）|

## Implementation Notes

`src/components/ui/DonutCenterLockup/DonutCenterLockup.tsx` 為參考實作。此元件故意不含圓環 SVG，以確保與不同圖表庫的相容性。圓環由 Recharts `<PieChart>` 提供，DonutCenterLockup 僅負責文字層。
