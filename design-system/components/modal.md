# Modal

置中模態浮層，預設最大寬 520px（lg：640px）。含遮罩、標頭、可滾動 body 與 footer。滑上動畫 8px。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-MO01 | `src/components/ui/Modal/Modal.tsx` | Modal component | default max-width 520px, lg 640px; footer surface-variant |
| E-CO-MO02 | `src/components/ui/Modal/Modal.css` | CSS classes | scrim rgba(10,10,8,0.36); slide-up 8px; shape corner-xl |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 強制中斷使用者操作流程；確認、表單、警告對話框 |
| Anatomy | 遮罩（scrim）· 容器（header + body + footer）|
| Variants / states / modes | default（520px）、lg（640px）；open / closed |
| Token contract summary | radius corner-xl；scrim rgba；footer surface-variant；動畫 slide-up 8px |
| Layout / density | 置中（flex center）；max-width 限制；body overflow-y: auto |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | DetailDrawer（Drawer 從右滑入且不完全遮蓋畫面；Modal 置中且完全遮蓋，強制聚焦）|

## Anatomy

```
<div class="ui-modal-scrim">
  <div class="ui-modal [ui-modal--lg]" role="dialog" aria-modal="true">
    <div class="ui-modal__header">
      <h2 class="ui-modal__title">{title}</h2>
      <button class="ui-modal__close">✕</button>
    </div>
    <div class="ui-modal__body">{children}</div>
    <div class="ui-modal__footer">{actions}</div>   ← 可選
  </div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| default | 無 size prop | max-width: 520px |
| lg | `size="lg"` | max-width: 640px |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| closed | `open={false}` | 隱藏（`display: none` 或 unmount）|
| open | `open={true}` | 遮罩顯示 + 容器 slide-up 8px 動畫 |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-modal-radius` | `--md-sys-shape-corner-xl` | 容器圓角 | all |
| `--md-comp-modal-bg` | `--md-sys-color-surface` | 背景 | all |
| `--md-comp-modal-border` | `--md-sys-color-outline` | 邊框 | all |
| `--md-comp-modal-header-padding` | `--md-sys-spacing-inset-lg` | 標頭 padding | all |
| `--md-comp-modal-header-border` | `--md-sys-color-divider` | 標頭底線 | all |
| `--md-comp-modal-title-size` | `--md-sys-typescale-body-semibold-size` | title 字體 | all |
| `--md-comp-modal-title-weight` | `--md-sys-typescale-body-semibold-weight` | title 字重 | all |
| `--md-comp-modal-footer-bg` | `--md-sys-color-surface-variant` | footer 背景 | all |
| `--md-comp-modal-footer-padding` | `--md-sys-spacing-inset-md` | footer padding | all |
| `--md-comp-modal-scrim-color` | *(raw: rgba(10,10,8,0.36))* | 遮罩 | open |
| `--md-comp-modal-transition` | `--md-sys-motion-duration-md` | slide-up 動畫 | open |

## Layout Rules

- 遮罩 `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center`
- 容器 `width: 100%; max-width: 520px`（lg: 640px）
- body `overflow-y: auto`；最大高度由 `vh` 或視窗決定
- footer 靠底，不隨 body 滾動

## Content Rules

- `title`：簡短的動詞短語（如「刪除任務」「新增成員」）
- footer 通常放主要操作（primary）和取消（ghost）按鈕，主要操作靠右

## Accessibility Rules

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` 指向 title
- open 時焦點 trap 在 modal 內；close 時返回觸發元素
- Escape 關閉

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 用 Modal 進行確認或表單輸入 | 用 Modal 顯示大量唯讀資訊（改用 Drawer）|
| footer 的主要行動按鈕靠右 | 在 Modal body 放入巢狀 Modal |

## Implementation Notes

`src/components/ui/Modal/Modal.tsx` 為參考實作。`corner-xl` 比 Panel / Button 的 corner-md/lg 更大，製造浮層的視覺層次感。遮罩顏色 `rgba(10,10,8,0.36)` 比 DetailDrawer 略深（0.36 vs 0.32），強調強制聚焦意圖。
