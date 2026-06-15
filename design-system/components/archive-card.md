# ArchiveCard

月度存檔摘要卡片，3 欄格線：月份標題（200px）+ 4 個統計數值格線 + 操作按鈕（110px）。hover 時顯示邊框強調與陰影。支援「直播中」Live 徽章。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-AC01 | `src/components/ui/ArchiveCard/ArchiveCard.tsx` | ArchiveCard component | 3-col grid; month/stats/action; live badge; hover border+elevation |
| E-CO-AC02 | `src/components/ui/ArchiveCard/ArchiveCard.css` | CSS classes | month 22px/600/-0.02em; stats 4-col; hover border-color-strong + elevation-sm |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 月度資料摘要列表項目；可點擊進入歷史存檔；顯示月份 + 統計 + 操作 |
| Anatomy | 月份欄（22px 標題）· 統計欄（4 項數值）· 行動欄（按鈕）|
| Variants / states / modes | default、live（含徽章）；hover 狀態 |
| Token contract summary | border hover 強度、elevation-sm on hover；month 字體顯示級別 |
| Layout / density | 3-col 固定比例（200px + 1fr + 110px）；響應式：行動裝置縮為 2 欄 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Panel（Panel 是殼層；ArchiveCard 是帶固定欄位結構的資料展示列表項）|

## Anatomy

```
<div class="ui-archive-card [ui-archive-card--live]">
  <div class="ui-archive-card__month">
    <span class="ui-archive-card__live-badge">直播中</span>   ← 可選
    <span class="ui-archive-card__month-label">{month}</span>
  </div>
  <div class="ui-archive-card__stats">
    <div class="ui-archive-card__stat">
      <span class="ui-archive-card__stat-label">{label}</span>
      <span class="ui-archive-card__stat-value">{value}</span>
    </div>
    <!-- 重複 4 次 -->
  </div>
  <div class="ui-archive-card__action">
    <button class="btn">{label}</button>
  </div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| default | 常態 | 無 live 徽章 |
| live | `isLive={true}` | 月份欄顯示 primary 色「直播中」徽章 |

## States

| State | 觸發條件 | 視覺差異 |
|---|---|---|
| default | 常態 | outline 邊框 |
| hover | `:hover` | `outline-strong` 邊框 + `elevation-sm` 陰影 |

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-archive-card-bg` | `--md-sys-color-surface` | 背景 | all |
| `--md-comp-archive-card-border` | `--md-sys-color-outline` | 邊框 | default |
| `--md-comp-archive-card-radius` | `--md-sys-shape-corner-lg` | 圓角 | all |
| `--md-comp-archive-card-hover-border` | `--md-sys-color-outline-strong` | hover 邊框 | hover |
| `--md-comp-archive-card-hover-shadow` | `--md-sys-elevation-sm` | hover 陰影 | hover |
| `--md-comp-archive-card-month-size` | `--md-sys-typescale-display-size` | 月份字體（22px）| all |
| `--md-comp-archive-card-month-weight` | `--md-sys-typescale-display-weight`（600）| 月份字重 | all |
| `--md-comp-archive-card-month-tracking` | `--md-sys-typescale-display-tracking`（-0.02em）| 月份字間距 | all |
| `--md-comp-archive-card-stat-label-size` | `--md-sys-typescale-meta-size` | 統計標籤字體 | all |
| `--md-comp-archive-card-stat-label-color` | `--md-sys-color-on-surface-muted` | 統計標籤顏色 | all |
| `--md-comp-archive-card-stat-value-size` | `--md-sys-typescale-body-semibold-size` | 統計數值字體 | all |
| `--md-comp-archive-card-live-color` | `--md-sys-color-primary` | live 徽章顏色 | live |
| `--md-comp-archive-card-transition` | `--md-sys-motion-duration-sm` | hover 動畫 | hover |

## Layout Rules

- 3-col grid：`200px 1fr 110px`
- 統計欄：4-col grid（`repeat(4, 1fr)`）
- 行動裝置（< 640px）：退化為 2 欄（月份 + 統計，行動獨佔一行）
- padding：`var(--md-sys-spacing-inset-lg)`

## Content Rules

- `month`：年月字串（「2026年5月」）
- stats：最多 4 項；label + value 兩行
- live badge：「直播中」文字，primary 色，無邊框 pill

## Accessibility Rules

- 整個卡片可為 `<a>` 或帶 `role="button"` 的 `<div>`（若為點擊導覽）
- live badge `aria-label="目前直播中"` 或以 `aria-live` 標示

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 月份欄固定 200px，統計欄自適應 | 讓所有欄位等比例伸縮 |
| hover 同時改邊框顏色 + 加陰影 | 只改陰影或只改邊框 |

## Implementation Notes

`src/components/ui/ArchiveCard/ArchiveCard.tsx` 為參考實作。月份字體使用 display scale（22px/600/-0.02em）製造視覺層次，統計標籤使用 meta scale 保持密度。
