# AppTopbar

應用程式頂部導覽列，依頁面（看板 / 儀表板 / 容量）顯示不同工具組合。桌面版與行動版佈局不同。支援通知插槽。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-AT01 | `src/components/ui/AppTopbar/AppTopbar.tsx` | AppTopbar component | multi-page: kanban/dashboard/capacity; notification slot |
| E-CO-AT02 | globals.css | .topbar, .tb-left, .tb-tools, .btn, .input classes | global utility classes; mobile: search bar + filter selects |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 應用程式頂部功能列；每個頁面有特定工具組合；非通用 shell，與頁面脈絡強綁定 |
| Anatomy | 左側（頁面標題 / logo）· 工具區（搜尋 + 篩選 + 操作按鈕 + 通知 slot）|
| Variants / states / modes | kanban 頁（成員篩選 + 搜尋 + 部門選擇 + 新增卡片）、dashboard 頁（部門篩選 + 匯出）、capacity 頁（月份 Pill）；桌面 / 行動 layout |
| Token contract summary | 使用 globals.css `.topbar` 全局類別；與 density-row、surface、outline sys token 對應 |
| Layout / density | `display: flex; justify-content: space-between`；高度 density-row × 1.5 或固定 48px |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Panel（Panel 是資料容器；AppTopbar 是應用殼層頂部，有頁面切換語意）|

## Anatomy

```
<header class="topbar">
  <div class="tb-left">
    <span class="tb-title">{pageTitle}</span>
  </div>
  <div class="tb-tools">
    <!-- kanban: 成員篩選 Avatar row + 搜尋 Input + 部門 Select + 新增按鈕 -->
    <!-- dashboard: 部門 Select + 匯出 Button -->
    <!-- capacity: MonthPillNavigator -->
    <div class="tb-notification-slot">{notification}</div>   ← 可選
  </div>
</header>
```

## Variants

| Variant | 觸發條件 | 工具組合 |
|---|---|---|
| kanban | `page="kanban"` | 成員篩選列 + 搜尋框 + 部門選單 + 「新增卡片」按鈕 |
| dashboard | `page="dashboard"` | 部門選單 + 「匯出」按鈕 |
| capacity | `page="capacity"` | MonthPillNavigator |
| mobile | `viewport < 640px` | 搜尋框 + 篩選選單（折疊）|

## States

無特殊元件狀態；子元件（Input、Select、Button）各自有 hover/focus/active。

## Token Contract

AppTopbar 使用 globals.css 全局類別直接引用 sys token，無 comp token 層。

| Slot | Sys token / class | Purpose |
|---|---|---|
| topbar bg | `.topbar` → `--md-sys-color-surface` | 頂部背景 |
| topbar border-bottom | `.topbar` → `--md-sys-color-divider` | 底部分隔線 |
| topbar height | `.topbar` → `--md-sys-density-row × 1.5`（≈48px）| 高度 |
| title text | `--md-sys-color-on-surface` / `--md-sys-typescale-body-semibold-*` | 頁面標題 |
| tool gap | `--md-sys-spacing-gap-sm` | 工具間距 |

## Layout Rules

- `position: sticky; top: 0; z-index: elevated`
- `padding-inline: var(--md-sys-spacing-page-side)`
- 行動版：工具區折疊為次行（搜尋欄在第二行）

## Content Rules

- `pageTitle`：頁面名稱（「看板」「儀表板」「容量管理」）
- `notification` slot：放 NotificationPanel 觸發按鈕

## Accessibility Rules

- `<header role="banner">` 確保地標語意
- 搜尋 Input 需有 `aria-label="搜尋任務"`
- 行動版折疊工具需有 aria-expanded 狀態

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 根據 `page` prop 渲染對應工具組合 | 在 Topbar 中自訂非標準工具，繞過 prop API |
| 通知使用 `notification` slot | 在 Topbar 中直接硬編碼通知 icon |

## Implementation Notes

`src/components/ui/AppTopbar/AppTopbar.tsx` 使用 globals.css 全局類別（`.topbar`、`.tb-left`、`.tb-tools`），無附屬 CSS 模組。這是一個領域耦合（domain-coupled）元件，高度依賴應用程式的頁面結構，不建議在其他專案中直接重用。
