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
| Anatomy | 漢堡選單按鈕 · 頁面標題 · 工具區（搜尋 + 篩選 + 操作按鈕）· 通知 slot |
| Variants / states / modes | kanban（成員篩選 + 搜尋 + 部門選擇 + 新增）、dashboard（部門篩選 + 匯出）、capacity（月份 Pill）、history（無工具）、permissions（無工具）；桌面 / 行動 layout |
| Token contract summary | 使用 globals.css `.topbar` 全局類別；與 density-row、surface、outline sys token 對應 |
| Layout / density | `display: flex; justify-content: space-between`；高度 density-row × 1.5 或固定 48px |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Panel（Panel 是資料容器；AppTopbar 是應用殼層頂部，有頁面切換語意）|

## Props API

```tsx
type AppTopbarPage = 'kanban' | 'dashboard' | 'capacity' | 'history' | 'permissions';

interface AppTopbarProps {
  page: AppTopbarPage;
  onMenuToggle: () => void;        // 漢堡選單切換（行動版 sidebar）

  // kanban 頁
  members?: Member[];
  filterMember?: string;
  onFilterMember?: (id: string) => void;
  filterDept?: string;
  onFilterDept?: (dept: string) => void;
  query?: string;
  onQuery?: (q: string) => void;
  onNewCard?: () => void;

  // dashboard 頁
  hasDrillFilter?: boolean;        // Drill 模式下隱藏部門篩選
  onExport?: () => void;

  // capacity 頁
  month?: string;                  // e.g. "2026/06"
  onMonthPrev?: () => void;
  onMonthNext?: () => void;

  // 全頁通用
  notificationSlot?: ReactNode;    // 傳入 <NotificationPanel>
}
```

## Anatomy

```
<header class="topbar">
  <div class="tb-left">
    <button class="sb-hamburger">{menu icon}</button>
    <div class="tb-title">{PAGE_TITLE[page]}</div>
    <!-- capacity: month pill（桌面）-->
  </div>
  <div class="tb-tools tb-desktop-only">
    <!-- kanban: member avatar filter + 搜尋 + 部門 select -->
    <!-- dashboard (非 drill): 部門 select -->
  </div>
  <div class="tb-tools">
    <!-- kanban: 新增按鈕（桌面） / Plus icon（行動）-->
    <!-- dashboard: 匯出按鈕 -->
    {notificationSlot}
  </div>
</header>
<!-- kanban 行動版 filter bar -->
<!-- capacity 行動版 month picker -->
```

## Variants

| Variant | 觸發條件 | 工具組合 |
|---|---|---|
| kanban | `page="kanban"` | 成員頭像篩選 + 搜尋框 + 部門選單 + 「新需求單」按鈕 |
| dashboard | `page="dashboard"` | 部門選單（非 drill）+ 「匯出」按鈕 |
| dashboard (drill) | `page="dashboard"` + `hasDrillFilter` | 無部門選單（drill 模式固定單位）|
| capacity | `page="capacity"` | 左側內嵌 month pill（桌面）/ 獨立 bar（行動）|
| history | `page="history"` | 無工具 |
| permissions | `page="permissions"` | 無工具 |
| mobile | `viewport < .tb-desktop-only` | kanban: 搜尋 + 成員/部門 select bar |

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
