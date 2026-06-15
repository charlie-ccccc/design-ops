# MemberCell

成員資訊複合元件，結合 Avatar（sm/md）+ 名稱 + 可選次要文字，用於表格列和篩選清單中。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-MC01 | `src/components/ui/MemberCell/MemberCell.tsx` | MemberCell component | photo or initial avatar (sm 22px / md 28px) + name + optional sub text |
| E-CO-MC02 | `src/components/ui/MemberCell/MemberCell.css` | CSS classes | --md-sys-color-on-surface / --md-sys-color-on-surface-muted |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 成員識別複合列；通常出現在表格第一欄或篩選列表；display-only |
| Anatomy | Avatar（sm or md）· 文字欄（name + optional sub）|
| Variants / states / modes | sm avatar（22px）vs md avatar（28px）；有 / 無 sub 文字 |
| Token contract summary | 直接使用 sys token；無 comp token 層；Avatar 的 hue 來自成員資料 |
| Layout / density | `display: flex; align-items: center; gap: gap-sm`；不固定寬度 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Avatar（Avatar 是純圖示 primitive；MemberCell 是含文字的複合元件，組合 Avatar 使用）|

## Props API

```tsx
type MemberCellProps = {
  name: string;          // 顯示名稱
  initial?: string;      // 字母頭像（無 photo 時顯示）
  photo?: string;        // 照片 URL
  color?: string;        // 頭像背景色（CSS 顏色字串，e.g. hsl(270 55% 55%)）
  sub?: string;          // 次要文字（部門、職位）
  size?: 'sm' | 'md';   // 頭像尺寸，default: 'sm'
};
```

> **注意**：`color` 接受任意 CSS 顏色字串（由呼叫方用 `hue()` utility 轉換），而非 `hue` 整數。

## Anatomy

```
<div class="ui-member-cell">
  <img src={photo} alt={name} class="ui-member-cell__avatar ui-member-cell__avatar--{size}" />
  ← 或 →
  <div class="ui-member-cell__avatar ui-member-cell__avatar--{size}" style="background: {color}">
    {initial ?? name[0]}
  </div>
  <div class="ui-member-cell__info">
    <span class="ui-member-cell__name">{name}</span>
    <span class="ui-member-cell__sub">{sub}</span>   ← 可選
  </div>
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| sm | `size="sm"`（預設）| 22px 頭像，適合表格行 |
| md | `size="md"` | 28px 頭像，適合選取列表 |
| with-sub | `sub` prop 存在 | 顯示次要文字 |
| with-photo | `photo` prop 存在 | 用 `<img>` 取代字母頭像 |

## States

Display-only，無互動狀態。父元件（表格列）可能有 hover 狀態，MemberCell 本身不變。

## Token Contract

直接使用 sys token，無 comp token 層。

| Slot | Sys token | Purpose |
|---|---|---|
| name 顏色 | `--md-sys-color-on-surface` | 主要文字 |
| name 字體 | `--md-sys-typescale-body-medium-size` | 14px |
| sub 顏色 | `--md-sys-color-on-surface-muted` | 次要文字 |
| sub 字體 | `--md-sys-typescale-meta-size` | 12px |
| gap | `--md-sys-spacing-gap-sm` | Avatar 與文字間距 |

## Layout Rules

- `display: flex; align-items: center`
- `gap: var(--md-sys-spacing-gap-sm)`（8px）
- 文字欄 `display: flex; flex-direction: column; gap: 2px`
- `overflow: hidden; white-space: nowrap; text-overflow: ellipsis` 防止長名稱破版

## Content Rules

- `name`：成員全名（中文或英文）
- `sub`（可選）：部門名稱或職稱
- `initial`：傳入成員首字母大寫
- `hue`：1–8，與 DEPT_HUE 對應

## Accessibility Rules

- 整個 MemberCell 通常不需要額外 aria；由外層表格的 `<th>` scope 提供脈絡
- Avatar 的 `aria-label` 為成員名稱（photo mode 的 `alt` prop）

## Do / Don't

| 應做 | 不應做 |
|---|---|
| `avatarSize="sm"` 用於表格行（節省垂直空間）| 在緊湊表格用 md avatar（佔太多行高）|
| sub 文字限縮為部門或職位 | 在 sub 顯示完整 email 或長字串 |

## Implementation Notes

`src/components/ui/MemberCell/MemberCell.tsx` 為參考實作。Avatar 的 `hue` prop 從 `MEMBERS` 資料結構取得，確保跨元件色彩一致性。
