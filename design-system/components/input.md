# Input / Select

單行文字輸入框與下拉選單。共用相同高度、圓角、邊框，並支援錯誤狀態。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-IN01 | `src/components/ui/Input/Input.tsx` | Input component | as="input" (default) and as="select"; hasError state |
| E-CO-IN02 | `src/components/ui/Input/Input.css` | CSS slots | focus border, error border, placeholder color |
| E-CO-IN03 | `tokens/tokens-comp.css` | Input section | comp tokens already extracted |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 表單控制元件；接受文字輸入或下拉選擇；通常與 FormRow 組合使用 |
| Anatomy | 容器（border + radius + bg）· 文字 or select 控制 |
| Variants / states / modes | input vs. select；default、focus、error、disabled |
| Token contract summary | container-color、border、radius、height from comp；focus-border、error 直接用 sys token |
| Layout / density | 高度固定為 density-row（32px）；寬度由父容器撐開（100%）|
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Button（同樣 32px 高，同樣 corner-md；但 Button 為行為觸發，Input 為資料輸入）|

## Anatomy

```
<input class="ui-input" />
<select class="ui-input ui-input--select">
  <option>...</option>
</select>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| input | `as="input"`（預設）| 文字輸入 |
| select | `as="select"` | 下拉選單；右側有箭頭圖示 |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | outline border |
| focus | `:focus` | border → `--md-comp-input-focus-border`（較深）|
| error | `hasError={true}` | border → `--md-sys-color-status-error` |
| disabled | `disabled` | opacity 降低，不可互動 |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-input-container-color` | `--md-sys-color-surface` | 背景 | all |
| `--md-comp-input-container-border` | `--md-sys-color-outline` | 邊框 | default |
| `--md-comp-input-container-radius` | `--md-sys-shape-corner-md` | 圓角 | all |
| `--md-comp-input-container-height` | `--md-sys-density-row` | 32px 高度 | all |
| `--md-comp-input-label-color` | `--md-sys-color-on-surface` | 文字顏色 | all |
| `--md-comp-input-label-size` | `--md-sys-typescale-body-medium-size` | 文字大小 | all |
| `--md-comp-input-placeholder-color` | `--md-sys-color-on-surface-muted` | placeholder | default |
| `--md-comp-input-focus-border` | `--md-sys-color-on-surface-secondary` | focus 邊框 | focus |
| `--md-comp-input-padding-inline` | `--md-sys-spacing-inset-sm` | 水平 padding | all |
| *(direct sys)* | `--md-sys-color-status-error` | error 邊框 | error |

## Layout Rules

- 高度固定 32px（density-row），不因密度切換而改變
- 寬度由外部決定（通常 `width: 100%`）
- Select 額外加右側 padding 以容納箭頭圖示

## Content Rules

- `placeholder`：應使用說明性文字而非標籤重複（標籤由 FormRow 提供）
- 錯誤訊息由 FormRow 負責顯示，Input 本身只改邊框色

## Accessibility Rules

- 每個 Input 必須搭配 `<label>` 並透過 `htmlFor`/`id` 關聯
- 錯誤狀態需有 `aria-invalid="true"` 及 `aria-describedby` 指向錯誤訊息

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 搭配 FormRow 使用，讓 label 統一管理 | 在 Input 內部硬編碼 label |
| 用 `hasError` prop 顯示錯誤狀態 | 直接修改 border-color inline style |

## Implementation Notes

`src/components/ui/Input/Input.tsx` 為參考實作。`as` prop 允許同一元件切換為 `<select>`，避免重複維護兩套 CSS。
