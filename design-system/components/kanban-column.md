# KanbanColumn

看板欄位容器，固定 296px 寬。包含標頭（色點 + 欄位名稱 + 計數 + 工具）與可拖放的卡片列表 body。支援 drag-over 狀態與空欄位狀態。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-KC01 | `src/components/ui/KanbanColumn/KanbanColumn.tsx` | KanbanColumn component | 296px fixed width; header + body; drag-over; empty state |
| E-CO-KC02 | `src/components/ui/KanbanColumn/KanbanColumn.css` | CSS classes | drag-over: color-mix primary 6%; dashed border on empty |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 看板的欄位容器；接受拖放的 KanbanCard；標頭顯示欄位狀態與統計 |
| Anatomy | 標頭（dot + name + count + tools slot）· body（可滾動 card list）|
| Variants / states / modes | default、drag-over、empty；無 active 狀態 |
| Token contract summary | 無 comp token（使用 sys token 和 color-mix 直接表達）|
| Layout / density | 固定 296px 寬；body 垂直可滾動；gap 8px between cards |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Panel（Panel 是通用殼層；KanbanColumn 有固定寬度、拖放語意、特定標頭結構，領域性較強）|

## Anatomy

```
<div class="ui-kcol [ui-kcol--drag-over] [ui-kcol--empty]">
  <div class="ui-kcol__header">
    <span class="ui-kcol__dot"></span>
    <span class="ui-kcol__name">{name}</span>
    <span class="ui-kcol__count">{count}</span>
    <div class="ui-kcol__tools">{tools}</div>   ← slot
  </div>
  <div class="ui-kcol__body">
    {cards}   ← KanbanCard children
    <!-- empty state: dashed box with hint text -->
  </div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| default | 常態 | 無特殊背景 |
| drag-over | 拖曳卡片至欄位上方 | bg = `color-mix(in oklab, --md-sys-color-primary 6%, transparent)` |
| empty | 無子卡片 | body 顯示虛線邊框空態提示 |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | 透明背景 |
| drag-over | `dragover` event | primary 6% tint 背景 |
| empty | 無 KanbanCard | body 虛線邊框 |

## Token Contract

KanbanColumn 直接使用 sys token，不設 comp token 層。

| Slot | Sys token / expression | Purpose |
|---|---|---|
| drag-over bg | `color-mix(in oklab, var(--md-sys-color-primary) 6%, transparent)` | 拖放目標提示 |
| dot color | `--md-sys-color-cat-{N}` 或狀態色 | 欄位狀態色點 |
| name text | `--md-sys-color-on-surface` | 欄位名稱 |
| count text | `--md-sys-color-on-surface-muted` | 卡片數量 |
| body gap | `--md-sys-spacing-gap-sm`（8px）| 卡片間距 |
| body padding | `--md-sys-spacing-inset-sm`（10px）| body 內距 |
| empty border | `--md-sys-color-outline`（dashed）| 空態虛線 |

## Layout Rules

- 寬度固定 `296px`，不可 flex-grow
- Header 高度對齊 `density-row`
- Body `overflow-y: auto`，最大高度由父容器決定
- 卡片間距 `gap: 8px`

## Content Rules

- `name`：欄位狀態名稱（短字串，如「待辦」「進行中」「完成」）
- `count`：目前欄位卡片數，動態更新
- `tools` slot：通常放「新增卡片」按鈕（ghost）

## Accessibility Rules

- `role="region"` 或 `role="list"` 視 HTML 結構決定
- 拖放需搭配鍵盤替代操作（drag API 本身不支援鍵盤）

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 欄位寬度固定 296px，讓橫向滾動由父容器（看板）控制 | 讓 KanbanColumn 自適應寬度 |
| drag-over 以 color-mix 而非 opacity 實現，避免子元件半透明 | 用 `opacity` 做 drag-over，導致卡片文字也變淡 |

## Implementation Notes

`src/components/ui/KanbanColumn/KanbanColumn.tsx` 為參考實作。drag-over 背景使用 `color-mix(in oklab, ...)` 以避免 `opacity` 影響子元件可讀性。空態 `dashed border` 僅在無 children 時渲染。
