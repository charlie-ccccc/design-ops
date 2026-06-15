# FormRow

表單欄位的標籤 + 輸入框配對容器，以及支援 1 或 2 欄格線的 FormGrid 佈局容器。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-FR01 | `src/components/ui/FormRow/FormRow.tsx` | FormRow + FormGrid exports | label 12px/uppercase/+0.06em + field slot |
| E-CO-FR02 | `src/components/ui/FormRow/FormRow.css` | CSS classes | 1- or 2-col grid, gap 12px |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 語意化表單欄位配對；確保 label + input 一致排版；FormGrid 控制多欄佈局 |
| Anatomy | label（uppercase / muted）· field slot（通常為 Input）|
| Variants / states / modes | FormRow（單欄）；FormGrid（1 col / 2 col）|
| Token contract summary | label 字體、追蹤直接用 sys；gap 用 sys；無 comp token 層 |
| Layout / density | FormRow 垂直堆疊；FormGrid 網格 1 or 2 欄，gap 12px |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Input（Input 是控制元件本身；FormRow 是標籤配對容器，兩者組合使用）|

## Anatomy

```
<!-- FormRow -->
<div class="ui-form-row">
  <label class="ui-form-row__label" htmlFor={id}>{label}</label>
  <div class="ui-form-row__field">{children}</div>
</div>

<!-- FormGrid -->
<div class="ui-form-grid [ui-form-grid--2col]">
  <FormRow>…</FormRow>
  <FormRow>…</FormRow>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| FormRow | `<FormRow>` | 垂直堆疊 label + field |
| FormGrid 1-col | `<FormGrid>` | 單欄，gap 12px |
| FormGrid 2-col | `<FormGrid cols={2}>` | 兩欄，gap 12px |

## States

FormRow 本身無互動狀態；錯誤狀態由 Input（`hasError`）和選用的錯誤訊息文字表達。

## Token Contract

FormRow 直接使用 sys token，無 comp token 層。

| Slot | Sys token | Purpose |
|---|---|---|
| label 字體大小 | `--md-sys-typescale-meta-size`（12px）| label 縮小文字 |
| label 字重 | `--md-sys-typescale-label-weight` | label 字重 |
| label 顏色 | `--md-sys-color-on-surface-muted` | label 淡色 |
| label 字間距 | `--md-sys-typescale-label-tracking`（+0.06em）| 全大寫字間距 |
| grid gap | `--md-sys-spacing-gap-md`（12px）| 欄位間距 |
| row gap | `--md-sys-spacing-gap-sm`（8px）| label 與 field 間距 |

## Layout Rules

- FormRow label `text-transform: uppercase`
- FormRow `display: flex; flex-direction: column; gap: 4px`
- FormGrid `display: grid; gap: 12px`
- 2-col FormGrid `grid-template-columns: 1fr 1fr`

## Content Rules

- label 使用名詞（「部門」、「到期日」），不加冒號
- 錯誤訊息放在 field slot 下方（12px / error 色），由父元件或 FormRow 選用 `errorText` prop 提供

## Accessibility Rules

- `<label htmlFor={id}>` 必須與 `<input id={id}>` 關聯
- 錯誤訊息需有 `role="alert"` 或 Input 的 `aria-describedby`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 用 FormGrid 統一多欄排版 | 在 Modal 或 Drawer 中自行寫 CSS grid |
| label 全大寫、略縮小 | 讓 label 字體與 body 文字一樣大 |

## Implementation Notes

`src/components/ui/FormRow/FormRow.tsx` 匯出 `FormRow` 和 `FormGrid`。無 comp token 是刻意設計——FormRow 是純佈局容器，token 化無實質效益。
