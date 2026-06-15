# DetailDrawer

從畫面右側滑入的詳情抽屜，固定 460px 寬。包含模糊遮罩、標頭（ID + 標題 + 關閉按鈕）與可滾動 body。按 Escape 或點擊遮罩關閉。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-DD01 | `src/components/ui/DetailDrawer/DetailDrawer.tsx` | DetailDrawer component | 460px from right; scrim blur; Escape key close |
| E-CO-DD02 | `src/components/ui/DetailDrawer/DetailDrawer.css` | CSS classes | transform slide; scrim rgba(10,10,8,0.32) backdrop-filter blur(2px) |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 詳情面板；從右側滑入顯示卡片 / 任務詳細資訊；不覆蓋整個視窗 |
| Anatomy | 遮罩（scrim）· 抽屜容器（header + body）|
| Variants / states / modes | open vs. closed（transform 動畫）|
| Token contract summary | drawer 寬度、scrim 顏色固定；header padding、title 字體使用 sys token |
| Layout / density | 固定 460px 寬；body overflow-y: auto；z-index 高於看板 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Modal（Modal 是置中浮層；DetailDrawer 是側邊滑入，通常保留背景可見，功能定位不同）|

## Anatomy

```
<div class="ui-drawer-scrim" onClick={onClose}></div>
<div class="ui-drawer [ui-drawer--open]">
  <div class="ui-drawer__header">
    <div class="ui-drawer__meta">
      <span class="ui-drawer__id">{id}</span>
      <h2 class="ui-drawer__title">{title}</h2>
    </div>
    <button class="ui-drawer__close" onClick={onClose}>✕</button>
  </div>
  <div class="ui-drawer__body">{children}</div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| closed | `open={false}` | `transform: translateX(100%)` |
| open | `open={true}` | `transform: translateX(0)` |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| closed | 預設 | 隱藏在畫面右側 |
| open | `open` prop | 滑入動畫，遮罩顯示 |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-drawer-width` | *(raw: 460px)* | 抽屜寬度 | all |
| `--md-comp-drawer-bg` | `--md-sys-color-surface` | 抽屜背景 | all |
| `--md-comp-drawer-border` | `--md-sys-color-outline` | 左側邊框 | all |
| `--md-comp-drawer-header-padding-block` | `--md-sys-spacing-inset-md` | 標頭垂直 padding | all |
| `--md-comp-drawer-header-padding-inline` | `--md-sys-spacing-inset-lg` | 標頭水平 padding | all |
| `--md-comp-drawer-header-border` | `--md-sys-color-divider` | 標頭底線 | all |
| `--md-comp-drawer-id-size` | `--md-sys-typescale-meta-size` | ID 字體（12px）| all |
| `--md-comp-drawer-id-color` | `--md-sys-color-on-surface-faint` | ID 文字色 | all |
| `--md-comp-drawer-title-size` | `--md-sys-typescale-body-large-size` | title 字體（18px）| all |
| `--md-comp-drawer-title-weight` | `--md-sys-typescale-body-semibold-weight` | title 字重（600）| all |
| `--md-comp-drawer-scrim-color` | *(raw: rgba(10,10,8,0.32))* | 遮罩顏色 | open |
| `--md-comp-drawer-transition` | `--md-sys-motion-duration-md` | 滑入動畫 | open/close |

## Layout Rules

- 抽屜固定右側（`position: fixed; right: 0; top: 0; bottom: 0`）
- body `overflow-y: auto`，padding 由 body 自身決定
- 遮罩 `position: fixed; inset: 0`，`backdrop-filter: blur(2px)`

## Content Rules

- `id`：短 ID 字串（如 `#K-042`），12px / faint 色
- `title`：任務或卡片名稱，18px / 600

## Accessibility Rules

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` 指向 title
- open 時焦點移入抽屜；close 時焦點返回觸發元素
- Escape 鍵關閉（`keydown` 監聽）

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 用 Escape 和遮罩點擊關閉 | 僅靠關閉按鈕，忽略鍵盤 |
| body 內容 overflow-y: auto，讓長內容可滾動 | 讓 body 內容溢出或截斷 |

## Implementation Notes

`src/components/ui/DetailDrawer/DetailDrawer.tsx` 為參考實作。遮罩顏色 `rgba(10,10,8,0.32)` 帶 `backdrop-filter: blur(2px)` 以保留背景可辨識度。抽屜本身使用 `position: fixed`，不在 DOM flow 中佔位。
