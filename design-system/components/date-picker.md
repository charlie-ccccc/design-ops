# DatePicker

日期選擇器，由一個觸發按鈕（樣式同 Input）和 `position: fixed` 的月曆彈出視窗組成。支援清除、跳至今天、disabled 狀態。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-DP01 | `src/components/ui/date-picker.tsx` | DatePicker component | value/onChange controlled; popup fixed-positioned calendar; clear + today footer |
| E-CO-DP02 | `src/components/ui/date-picker.stories.tsx` | Stories | Default / WithValue / Disabled / InFormRow states |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 受控日期輸入元件；觸發按鈕 + 月曆彈出視窗；通常與 FormRow 搭配 |
| Anatomy | 觸發按鈕（.input 樣式）· 彈出月曆（月導覽 + 星期標頭 + 日期格線 + footer）|
| Variants / states / modes | 無選取、已選取、disabled；today 標示；selected 標示 |
| Token contract summary | 觸發按鈕使用 `.input` 全局類別；彈出視窗使用 CSS 變數直接定義；無 comp token 層 |
| Layout / density | 觸發按鈕 100% 寬；彈出視窗固定 280px、`position: fixed`（防止 overflow 截斷）|
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | MonthPillNavigator（MonthPillNavigator 是工具列行內月份切換；DatePicker 是完整彈出月曆，用於表單輸入）|

## Props API

```tsx
interface DatePickerProps {
  value: string;                    // "YYYY-MM-DD" 或 ""（無選取）
  onChange: (val: string) => void;  // 選取或清除時呼叫；清除傳 ""
  disabled?: boolean;
  placeholder?: string;             // 預設 "選擇日期"
}
```

## Anatomy

```
<!-- 觸發按鈕 -->
<button ref={btnRef} class="input" disabled={disabled} onClick={openPicker}>
  {displayValue || placeholder}
</button>

<!-- 彈出視窗（position: fixed）-->
<div ref={popupRef} style="position: fixed; top: {y}; left: {x}; width: 280px; z-index: 9000">
  <!-- 月份導覽 -->
  <div class="dp-nav">
    <button onClick={prevMonth}>‹</button>
    <span>{viewYear}年 {viewMonth+1}月</span>
    <button onClick={nextMonth}>›</button>
  </div>

  <!-- 星期標頭 (日一二三四五六) -->
  <div class="dp-weekdays">{WEEKDAYS}</div>

  <!-- 日期格線 7 欄 -->
  <div class="dp-grid">
    <button class="dp-day [dp-day--selected] [dp-day--today]" onClick={() => selectDay(day)}>
      {day}
    </button>
  </div>

  <!-- Footer -->
  <div class="dp-footer">
    <button onClick={clear}>清除</button>
    <button onClick={goToday}>今天</button>
  </div>
</div>
```

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| empty | `value === ""` | 顯示 placeholder（muted 色）|
| with-value | `value` 有效日期 | 顯示 `YYYY/MM/DD` 格式 |
| disabled | `disabled={true}` | 觸發按鈕 disabled；cursor: default |
| popup open | 點擊觸發按鈕 | 月曆彈出（fixed 定位）|
| today | 格線中今日 | `outline: 1.5px solid --accent`；accent 色文字 |
| selected | `ds === value` | `--accent` 背景；白字 |
| day hover | `:hover`（未選取）| `--surface-2` 背景 |

## Token Contract

DatePicker 使用應用程式全局 CSS 變數，無 comp token 層。

| Slot | CSS 變數 | Purpose |
|---|---|---|
| 觸發按鈕樣式 | `.input` 全局類別 | 對齊 Input 元件外觀 |
| 彈出背景 | `var(--surface)` | 月曆底色 |
| 彈出邊框 | `var(--border)` | 月曆外框 |
| 選取日背景 | `var(--accent)` | selected state |
| today 標示 | `var(--accent)` | outline + 文字色 |
| hover 背景 | `var(--surface-2)` | 日期 hover |
| 文字 | `var(--ink)` | 日期數字 |
| 次要文字 | `var(--muted)` | 星期標頭、footer 按鈕 |
| footer 分隔 | `var(--divider)` | footer 上方線 |

## Layout Rules

- 觸發按鈕使用 `.input` class，寬度由外部容器決定（通常 100%）
- 彈出視窗 `position: fixed`；左邊界不超出視窗（`Math.min(rect.left, window.innerWidth - 292)`）
- 日期格線 `display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px`
- 月首空白用 `null` 佔位（flex 無法自動對齊，改用 CSS grid 空格）

## Content Rules

- `value` 格式固定 `YYYY-MM-DD`；顯示格式為 `YYYY/MM/DD`
- 星期順序：日、一、二、三、四、五、六（週日為第一欄）
- footer 「今天」跳至今日並選取；「清除」呼叫 `onChange("")`

## Accessibility Rules

- 觸發按鈕為 `<button type="button">` 確保可聚焦
- 彈出視窗應有 `role="dialog"` + `aria-label="選擇日期"`
- 選取日 `aria-selected="true"`；今日 `aria-current="date"`
- 點擊彈出視窗外部自動關閉（`mousedown` listener）

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 搭配 FormRow 使用，讓 label 統一管理 | 在 DatePicker 內部放 label |
| 傳入 `""` 代表清除（受控）| 自行操作 DOM 清除輸入值 |
| 彈出視窗用 `position: fixed` 防止 overflow 截斷 | 用 `absolute` 容易被父容器 overflow 截掉 |

## Implementation Notes

`src/components/ui/date-picker.tsx` 為參考實作。彈出視窗使用 `position: fixed` 並在 `openPicker()` 時計算 `top/left`，以避免被 overflow-hidden 的父容器截斷。星期從週日（0）開始排列，符合中文介面慣例。
