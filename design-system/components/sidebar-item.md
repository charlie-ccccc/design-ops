# SidebarItem

側邊欄導覽項目，包含圖示、標籤、可選計數徽章，以及群組標頭子元件。啟用狀態以 elevation-sm 陰影標示。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-SI01 | `src/components/ui/SidebarItem/SidebarItem.tsx` | SidebarItem + SidebarGroup exports | icon + label + optional tag badge; active state |
| E-CO-SI02 | `src/components/ui/SidebarItem/SidebarItem.css` | CSS classes | active: surface bg + elevation-sm + primary icon; hover: surface-variant |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 側邊欄導覽連結；啟用狀態視覺突顯；SidebarGroup 提供區段標頭 |
| Anatomy | 圖示 · 標籤文字 · 可選計數 Tag · 啟用指示器（背景 + 陰影）|
| Variants / states / modes | default、active、hover；SidebarGroup（標頭 only）|
| Token contract summary | active: surface bg、elevation-sm、primary icon；hover: surface-variant；文字 rgba 漸變 |
| Layout / density | 固定高度（density-row），水平 padding inset-md；不換行 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Button（Button 為觸發動作；SidebarItem 為導覽路由，有 active state 和圖示 slot）|

## Anatomy

```
<!-- SidebarGroup -->
<div class="ui-sb-group">
  <span class="ui-sb-group__label">{groupLabel}</span>
  {children}
</div>

<!-- SidebarItem -->
<a class="ui-sb-item [ui-sb-item--active]" href={href}>
  <span class="ui-sb-item__icon">{icon}</span>
  <span class="ui-sb-item__label">{label}</span>
  <span class="ui-sb-item__badge">{count}</span>   ← 可選
</a>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| default | 非當前路由 | 透明背景，muted 圖示色 |
| active | `active` prop 或路由匹配 | `surface` 背景 + `elevation-sm` 陰影 + `primary` 圖示色 |
| SidebarGroup | `<SidebarGroup>` | 僅顯示群組標籤（無互動）|

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | 透明 bg，rgba(255,255,255,0.5) 文字（深色側欄）|
| hover | `:hover` | `--md-sys-color-surface-variant` bg |
| active | `active` prop | `--md-sys-color-surface` bg + `elevation-sm` + primary icon |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-sidebar-item-height` | `--md-sys-density-row` | 項目高度 | all |
| `--md-comp-sidebar-item-padding-inline` | `--md-sys-spacing-inset-md` | 水平 padding | all |
| `--md-comp-sidebar-item-radius` | `--md-sys-shape-corner-md` | 圓角 | all |
| `--md-comp-sidebar-item-hover-bg` | `--md-sys-color-surface-variant` | hover 背景 | hover |
| `--md-comp-sidebar-item-active-bg` | `--md-sys-color-surface` | active 背景 | active |
| `--md-comp-sidebar-item-active-shadow` | `--md-sys-elevation-sm` | active 陰影 | active |
| `--md-comp-sidebar-item-active-icon-color` | `--md-sys-color-primary` | active 圖示色 | active |
| `--md-comp-sidebar-item-gap` | `--md-sys-spacing-gap-sm` | 圖示與文字間距 | all |
| `--md-comp-sidebar-group-label-size` | `--md-sys-typescale-meta-size` | 群組標頭字體 | SidebarGroup |
| `--md-comp-sidebar-group-label-color` | `--md-sys-color-on-surface-faint` | 群組標頭顏色 | SidebarGroup |

## Layout Rules

- 垂直堆疊，gap 由父容器（nav）決定
- `overflow: hidden; white-space: nowrap; text-overflow: ellipsis`——長標籤截斷
- badge 靠右（`margin-left: auto`）

## Content Rules

- 標籤文字簡短（不超過 16 字）
- badge 顯示數字計數（如待辦任務數）；超過 99 顯示 `99+`
- SidebarGroup label 全大寫，由 CSS `text-transform: uppercase` 控制

## Accessibility Rules

- `<a>` 元素確保鍵盤可聚焦
- `aria-current="page"` 標示 active 項目
- 圖示 `aria-hidden="true"`，文字提供語意

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 使用 `active` prop 標示當前路由 | 用 JS 直接操作 class 做 active 切換 |
| badge 用於計數，不用於狀態文字 | 在 badge slot 放長字串 |

## Implementation Notes

`src/components/ui/SidebarItem/SidebarItem.tsx` 匯出 `SidebarGroup` 和 `SidebarItem`。側邊欄背景為黑色（`#0e0e10`），文字透明度基準為 `rgba(255,255,255,0.5)`，active 時由 `surface`（淺色）背景取代。
