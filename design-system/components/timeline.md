# Timeline

活動串流元件，以垂直時間軸（點 + 連接線）呈現事件記錄。最後一項隱藏連接線。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-TL01 | `src/components/ui/Timeline/Timeline.tsx` | Timeline component | ui-timeline__row: 14px dot-wrap + content |
| E-CO-TL02 | `src/components/ui/Timeline/Timeline.css` | CSS classes | 8px dot circle; ::after pseudo vertical line; hidden on last; message 14px/secondary; time 12px/faint/tabular-nums |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 活動歷史記錄；display-only；用於 DetailDrawer 中的事件列表 |
| Anatomy | 每列：dot-wrap（8px 圓點 + 垂直連接線）· 內容（訊息 + 時間）|
| Variants / states / modes | 無；最後一列無連接線 |
| Token contract summary | dot 使用 outline-strong；連接線使用 divider；訊息 secondary；時間 faint |
| Layout / density | grid 兩欄（dot-wrap 14px + content 1fr）；row gap 由父容器決定 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | 無相似已提取元件 |

## Anatomy

```
<div class="ui-timeline">
  <div class="ui-timeline__row">
    <div class="ui-timeline__dot-wrap">
      <span class="ui-timeline__dot"></span>
      <!-- ::after = 垂直連接線 -->
    </div>
    <div class="ui-timeline__content">
      <p class="ui-timeline__message">{message}</p>
      <time class="ui-timeline__time">{time}</time>
    </div>
  </div>
  <!-- 最後一列 .ui-timeline__dot-wrap::after display: none -->
</div>
```

## Variants

無。`isLast` 或 `:last-child` CSS 選擇器控制是否顯示連接線。

## States

Display-only，無互動狀態。

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-timeline-dot-size` | *(raw: 8px)* | dot 直徑 | all |
| `--md-comp-timeline-dot-color` | `--md-sys-color-outline-strong` | dot 顏色 | all |
| `--md-comp-timeline-line-color` | `--md-sys-color-divider` | 連接線顏色 | all |
| `--md-comp-timeline-line-width` | *(raw: 1px)* | 連接線寬度 | all |
| `--md-comp-timeline-dot-wrap-width` | *(raw: 14px)* | dot 欄寬 | all |
| `--md-comp-timeline-message-size` | `--md-sys-typescale-body-medium-size`（14px）| 訊息字體 | all |
| `--md-comp-timeline-message-color` | `--md-sys-color-on-surface-secondary` | 訊息顏色 | all |
| `--md-comp-timeline-time-size` | `--md-sys-typescale-meta-size`（12px）| 時間字體 | all |
| `--md-comp-timeline-time-color` | `--md-sys-color-on-surface-faint` | 時間顏色 | all |
| `--md-comp-timeline-row-gap` | `--md-sys-spacing-gap-md` | 列間距 | all |

## Layout Rules

- 每列：`display: grid; grid-template-columns: 14px 1fr; gap: 8px`
- dot-wrap `position: relative`；`::after` 為 `position: absolute; left: 50%; top: 8px; width: 1px; bottom: -gap`
- 最後一列（`:last-child .dot-wrap::after`）`display: none`

## Content Rules

- `message`：活動描述（如「張三 修改了到期日」）
- `time`：相對時間（「5分鐘前」）或絕對時間（ISO），`tabular-nums`

## Accessibility Rules

- `<time datetime="{isoString}">` 提供機器可讀時間
- 整個 timeline 可用 `role="feed"` 或 `role="list"` 包裝

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 最後一列隱藏連接線（`:last-child` 選擇器）| 手動在每列傳入 `isLast` boolean prop |
| 時間使用 tabular-nums | 讓時間戳記跑版 |

## Implementation Notes

`src/components/ui/Timeline/Timeline.tsx` 為參考實作。連接線使用 `::after` 偽元素而非獨立 `<div>`，減少 DOM 節點數。dot 使用 `outline-strong` 而非 `primary`，以避免過多視覺強調。
