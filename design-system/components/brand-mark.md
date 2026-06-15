# BrandMark

品牌標誌方形圖示，作為應用程式識別符號使用。出現於側邊欄頂部（小尺寸）及登入頁（大尺寸）。漸層背景於淺色與深色模式下自動反轉。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-BM01 | `src/components/ui/BrandMark/BrandMark.tsx` | BrandMark component | sm (26px/7px radius) and lg (48px/12px radius) |
| E-CO-BM02 | `src/components/ui/BrandMark/BrandMark.css` | CSS slots | gradient bg using on-surface token; dark mode reversal |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 品牌識別標誌；display-only；常作為 SidebarItem 區域的頂部品牌元素 |
| Anatomy | 正方形容器 · 漸層背景 · 內部字母/圖形 |
| Variants / states / modes | sm（26×26px, radius 7px）、lg（48×48px, radius 12px）；淺色/深色 mode |
| Token contract summary | size、radius from comp token；gradient 使用 --md-sys-color-on-surface |
| Layout / density | 固定尺寸，不受密度 token 影響 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | Avatar（Avatar 是圓形成員圖示；BrandMark 是方形品牌 logo，尺寸更大且角度不同，用途不同）|

## Anatomy

```
<div class="ui-brand-mark ui-brand-mark--{size}">
  {children / 字母}
</div>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| sm | `size="sm"`（預設）| 26×26px，7px radius |
| lg | `size="lg"` | 48×48px，12px radius |

## States

僅顯示元件，無互動狀態。深色模式下漸層方向自動反轉（CSS `@media prefers-color-scheme: dark` 或 `.dark` class）。

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-brand-mark-sm-size` | `--md-sys-size-indicator-lg` | 26px 尺寸 | sm |
| `--md-comp-brand-mark-lg-size` | *(raw: 48px)* | 48px 尺寸 | lg |
| `--md-comp-brand-mark-sm-radius` | `--md-sys-shape-corner-sm` | 7px 圓角 | sm |
| `--md-comp-brand-mark-lg-radius` | `--md-sys-shape-corner-md` | 12px 圓角 | lg |
| `--md-comp-brand-mark-gradient-start` | `--md-sys-color-on-surface` | 漸層起始色（淺色模式）| default |
| `--md-comp-brand-mark-gradient-end` | *(raw: #3a3934)* | 漸層結束色 | default |

## Layout Rules

- 固定尺寸方形，不 flex-grow
- sm 出現於側邊欄頂部，lg 出現於登入/封面頁面
- 漸層方向：淺色模式 `135deg` from `on-surface` → `#3a3934`；深色模式反轉

## Content Rules

- 通常內含應用程式首字母或 SVG logo mark
- 內部文字顏色使用 `--md-sys-color-background`（白或黑，取決於模式）

## Accessibility Rules

- 如作為純裝飾，`aria-hidden="true"`
- 如有語意意義（如登入頁 logo），需有 `role="img"` 及 `aria-label`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| sm 用於側邊欄，lg 用於登入頁 | 在卡片或行內情境使用 lg |
| 讓漸層由 CSS media query 自動切換 | 手動傳入深色模式 props |

## Implementation Notes

`src/components/ui/BrandMark/BrandMark.tsx` 為參考實作。漸層使用 CSS `linear-gradient(135deg, var(--md-sys-color-on-surface) 0%, #3a3934 100%)`，深色模式反轉起止色。
