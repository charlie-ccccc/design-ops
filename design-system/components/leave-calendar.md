# LeaveCalendar

月度假期日曆元件，7 欄網格，支援 today、selected、holiday、weekend、clickable 等日期狀態，及最多 4 個假期色點。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-LC01 | `src/components/ui/LeaveCalendar/LeaveCalendar.tsx` | LeaveCalendar + LeaveCalendarControlled | 7-col grid; global classes: .cal-grid, .cal-hdr, .cal-day |
| E-CO-LC02 | globals.css | .cal-* classes | states: weekend, clickable, today, selected, holiday; leave dots (up to 4, 4px circles); optional nav |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 視覺化員工月假期；每日最多 4 個色點表示不同員工；可選擇日期（LeaveCalendarControlled）|
| Anatomy | 導覽列（可選）· 星期標頭行 · 7 欄日期格線 |
| Variants / states / modes | LeaveCalendar（非受控）、LeaveCalendarControlled（受控 selected 日期）；日期格：weekend、today、selected、holiday、clickable |
| Token contract summary | 全局 .cal-* 類別直接使用 sys token；無 comp token 層 |
| Layout / density | `display: grid; grid-template-columns: repeat(7, 1fr)` |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | MonthPillNavigator（MonthPillNavigator 是行內月份切換器；LeaveCalendar 是完整月度格線視圖，兩者互補）|

## Anatomy

```
<div class="cal-wrap">
  <!-- 導覽列（可選）-->
  <div class="cal-nav">
    <MonthPillNavigator …/>
  </div>

  <!-- 星期標頭 -->
  <div class="cal-grid cal-grid--hdr">
    <div class="cal-hdr">一</div> … <div class="cal-hdr">日</div>
  </div>

  <!-- 日期格線 -->
  <div class="cal-grid">
    <div class="cal-day [weekend] [today] [selected] [holiday] [clickable]">
      <span class="cal-day__num">{day}</span>
      <div class="cal-day__dots">
        <span class="cal-day__dot" style="background: var(--md-sys-color-cat-N)"></span>
        <!-- 最多 4 個 dot -->
      </div>
    </div>
  </div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| LeaveCalendar | `<LeaveCalendar>` | 非受控，無 selected 狀態 |
| LeaveCalendarControlled | `<LeaveCalendarControlled>` | 受控 `selectedDate` + `onSelect` |

## States

| State | Class / 條件 | 視覺差異 |
|---|---|---|
| default | 常態 | 白底黑字 |
| weekend | `.weekend` | 文字 muted 色 |
| today | `.today` | 背景 primary（輕）或圓形標示 |
| selected | `.selected` | primary 背景，white 文字 |
| holiday | `.holiday` | 節假日標示（紅色點或文字）|
| clickable | `.clickable` | cursor: pointer；hover 背景 surface-variant |

## Token Contract

全局 `.cal-*` 類別直接使用 sys token；無 comp token 層。

| Slot | Sys token | Purpose |
|---|---|---|
| 格線背景 | `--md-sys-color-surface` | 日格底色 |
| 格線邊框 | `--md-sys-color-divider` | 格線分隔 |
| today 標示 | `--md-sys-color-primary` | 今日強調 |
| selected 背景 | `--md-sys-color-primary` | 選取日期 |
| weekend 文字 | `--md-sys-color-on-surface-muted` | 週末淡化 |
| dot 顏色 | `--md-sys-color-cat-{1–8}` | 員工假期色點 |
| dot 大小 | *(raw: 4px)* | 小色點 |
| hover bg | `--md-sys-color-surface-variant` | 可點擊日期 hover |

## Layout Rules

- `display: grid; grid-template-columns: repeat(7, 1fr)`
- 每個 `.cal-day` 固定高度（`aspect-ratio: 1` 或固定 px）
- 色點容器 `display: flex; gap: 2px`，最多顯示 4 個點
- 第一週前的空格用空白 div 佔位（CSS grid 自動流動）

## Content Rules

- 顯示當月日期，跨月日期不顯示（或顯示為 muted 色、不可點擊）
- 色點使用 `DEPT_HUE` 對應的 `cat-N` 顏色
- 超過 4 個假期的日期只顯示 4 個點，無 overflow 指示

## Accessibility Rules

- 整個日曆建議 `role="grid"` + `aria-label="2026年6月假期日曆"`
- 每個 `.cal-day` `role="gridcell"`
- today：`aria-current="date"`；selected：`aria-selected="true"`
- 色點 `aria-label="N 人請假"` 或父元素 `title`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 用 LeaveCalendarControlled 做日期選擇 | 直接操作 DOM class 切換 selected 狀態 |
| 最多顯示 4 個色點 | 無限堆疊色點導致版面破版 |

## Implementation Notes

`src/components/ui/LeaveCalendar/LeaveCalendar.tsx` 無附屬 CSS 檔案——日曆樣式依賴 `globals.css` 中的 `.cal-*` 全局類別。若要遷移至 CSS Module，需將這些類別提取至 `LeaveCalendar.css`。
