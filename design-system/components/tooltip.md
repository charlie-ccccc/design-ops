# InfoTooltip

行內說明提示元件。顯示一個圓形驚嘆號圖示，桌面滑鼠 hover 或手機點擊後浮出說明氣泡。氣泡透過 `createPortal` 掛在 `document.body`，使用 `position: fixed` 定位，可完全脫離父層 overflow 限制。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-TT01 | `src/components/ui/Tooltip/Tooltip.tsx` | InfoTooltip | portal + fixed 定位；hover/click 雙觸發 |
| E-CO-TT02 | `src/components/ui/Tooltip/Tooltip.css` | CSS classes | .ui-tooltip-wrap, .ui-tooltip-trigger, .ui-tooltip-bubble |
| E-CO-TT03 | `src/components/admin/index.tsx` | 三處使用 | 量能使用率、月工時欄、量能%欄 |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 行內說明提示；hover（桌面）或 click（手機）顯示說明氣泡 |
| Anatomy | 圓形驚嘆號觸發器 · 浮動說明氣泡（含箭頭） |
| Variants / states / modes | position: top（預設）、bottom；open / closed |
| Token contract summary | 觸發器使用 `--muted`、`--ink`；氣泡使用 `--ink`（背景）、`--bg`（文字） |
| Layout / density | inline-flex；氣泡寬度 max-content，最大 240px |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | 無類似現有元件 |

## Props API

```tsx
interface InfoTooltipProps {
  content: string;           // 說明文字，支援 \n 換行
  position?: 'top' | 'bottom'; // 氣泡出現位置，預設 'top'
}
```

## Anatomy

```
<span class="ui-tooltip-wrap">          ← position: relative, inline-flex
  <span class="ui-tooltip-trigger">!</span>   ← 圓形驚嘆號，14×14px
  {/* portal → document.body */}
  <span class="ui-tooltip-bubble ui-tooltip-bubble--{position}">
    {content}
  </span>
</span>
```

## States

| State | Trigger | Visual |
|---|---|---|
| closed（預設） | — | 氣泡不渲染（portal 未掛載） |
| open | hover（桌面）/ click（手機） | 氣泡出現在觸發器上方或下方，帶箭頭 |

## Behaviour

- `onMouseEnter` → 計算觸發器 `getBoundingClientRect()`，設定座標，掛載 portal
- `onMouseLeave` → 卸載 portal
- `onClick` → toggle open/close（手機無 hover，依賴 click）
- 氣泡設定 `pointer-events: none`，不阻擋滑鼠事件

## Token Contract

| Slot | Token |
|---|---|
| 觸發器邊框 / 文字 | `--muted` → hover `--ink` |
| 氣泡背景 | `--ink` |
| 氣泡文字 | `--bg` |
| 氣泡圓角 | 8px（hardcoded） |
| 箭頭顏色 | `--ink` |

## Accessibility

- `aria-label="說明"` 標記在觸發器上
- 氣泡設定 `pointer-events: none` 避免干擾操作
