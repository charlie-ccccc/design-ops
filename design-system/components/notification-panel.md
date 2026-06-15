# NotificationPanel

鈴鐺按鈕 + 下拉通知列表的複合元件。含未讀計數徽章、通知列（圖示 + 訊息 + 時間 + 刪除）、全部已讀操作、點擊外部關閉。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-NP01 | `src/components/ui/notification-panel.tsx` | NotificationPanel component | Bell icon trigger + dropdown list; unread badge; type icons |
| E-CO-NP02 | `src/components/ui/notification-panel.stories.tsx` | Stories | WithUnread / AllRead / Empty / SingleUnread states |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 接收並展示應用程式通知；點擊鈴鐺開關下拉；點擊通知開啟對應卡片；可刪除或標記已讀 |
| Anatomy | 鈴鐺按鈕（含未讀徽章）· 下拉容器（header + 滾動列表 + 空態）|
| Variants / states / modes | open / closed；有未讀 / 全已讀 / 空 |
| Token contract summary | 直接使用 CSS 變數（`--accent`、`--surface`、`--border`、`--muted`）；無 comp token 層 |
| Layout / density | 下拉固定 320px 寬；最大高度 420px；overflow-y: auto |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | DetailDrawer（Drawer 是全高側邊面板；NotificationPanel 是工具列觸發的小型下拉，結構不同）|

## Props API

```tsx
interface Props {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: (notifs: AppNotification[]) => void;
  onOpenCard: (cardId: string) => void;
  onDelete: (id: string) => void;
}

type AppNotification = {
  id: string;
  uid: string;
  type: 'mention' | 'assigned' | 'comment' | 'due';
  cardId: string;
  cardTitle: string;
  from: string;
  message: string;
  read: boolean;
  createdAt: number;   // timestamp ms
};
```

## Anatomy

```
<div ref={panelRef}>
  <button class="btn btn-ghost notif-btn">
    <Bell />
    <span class="unread-badge">{unread > 9 ? '9+' : unread}</span>   ← 有未讀才顯示
  </button>

  <!-- open 時顯示 -->
  <div class="notif-dropdown">
    <div class="notif-header">
      <span>通知</span>
      <button>全部已讀</button>   ← 有未讀才顯示
    </div>
    <div class="notif-list">
      <!-- 每筆通知 -->
      <div class="notif-row">
        <div class="notif-type-icon">{TYPE_ICON[type]}</div>
        <div class="notif-body">
          <div class="notif-message">{message}</div>
          <div class="notif-time">{timeAgo(createdAt)}</div>
        </div>
        <div class="notif-unread-dot" />   ← 未讀才顯示
        <button class="notif-delete-btn"><X /></button>
      </div>
    </div>
    <!-- 空態 -->
    <div class="notif-empty">沒有通知</div>
  </div>
</div>
```

## Notification Types

| type | 圖示 | 顏色 |
|---|---|---|
| `mention` | AtSign | `--accent`（primary）|
| `assigned` | UserCheck | `#22c55e`（綠）|
| `comment` | MessageSquare | `#f59e0b`（橙）|
| `due` | Clock | `#ef4444`（紅）|

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| closed | 預設 | 只顯示鈴鐺按鈕 |
| open | 點擊鈴鐺 | 下拉出現（`position: absolute`）|
| unread row | `n.read === false` | `--accent-soft` 背景 |
| read row | `n.read === true` | 透明背景 |
| hovered row | `:hover` | `--surface-2` 背景 |
| empty | `notifications.length === 0` | 顯示「沒有通知」空態 |

## Token Contract

NotificationPanel 使用應用程式全局 CSS 變數，無 comp token 層。

| Slot | CSS 變數 | Purpose |
|---|---|---|
| 下拉背景 | `var(--surface)` | 面板底色 |
| 邊框 | `var(--border)` | 面板外框 + 列分隔 |
| 未讀背景 | `var(--accent-soft)` | 未讀通知底色 |
| 未讀徽章 | `var(--st-block)` | 計數徽章色 |
| 主色 | `var(--accent)` | mention 圖示、全部已讀按鈕、未讀圓點 |
| 文字 | `var(--ink)` | 通知訊息 |
| 次要文字 | `var(--muted)` | 時間、刪除按鈕 |
| hover 背景 | `var(--surface-2)` | hover 列 |

## Layout Rules

- 下拉 `position: absolute; right: 0; top: calc(100% + 6px); z-index: 200`
- 固定寬 320px；最大高 420px；header 固定不滾動，list `overflow-y: auto`
- 點擊面板外部關閉（`document mousedown` listener）

## Accessibility Rules

- 鈴鐺按鈕 `title="通知"` 提供 tooltip
- 未讀徽章以絕對定位疊加，需 `aria-label` 或 `aria-live` 通知螢幕閱讀器
- 刪除按鈕 `title="刪除通知"`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 通過 `notificationSlot` prop 傳入 AppTopbar | 直接在 AppTopbar 內實作通知邏輯 |
| `onMarkRead` 在點擊通知時同時觸發 | 只在「已讀」按鈕才更新狀態 |

## Implementation Notes

`src/components/ui/notification-panel.tsx` 為參考實作。元件內部管理 `open` 狀態（非受控）；通知資料（`notifications`）由外部管理。`timeAgo()` 工具函式將 timestamp 轉換為相對時間字串。
