# Avatar

字母型或照片圓形頭像，用於代表成員身份。背景色來自分類色相系統，與成員的 `hue` 欄位對應。

## Evidence

| Evidence ID | Source | Region | Notes |
|---|---|---|---|
| E-CO-AV01 | `src/components/ui/Avatar/Avatar.tsx` | Avatar component | 3 sizes: sm/md/lg; hue-based bg; photo fallback |
| E-CO-AV02 | `src/components/ui/Avatar/Avatar.css` | CSS slots | sys token usage: shape-corner-full, on-categorical, annotation scales |
| E-CO-AV03 | `tokens/tokens-comp.css` | Avatar section | comp tokens already extracted |

## Component Fingerprint

| Dimension | Description |
|---|---|
| Purpose / behavior / composition role | 顯示成員識別符號；無互動（display-only），但常作為 Kanban Card 和 MemberCell 的子元件 |
| Anatomy | 圓形容器 · 字母初始 or `<img>` |
| Variants / states / modes | sm（22px）、md（28px）、lg（36px）；photo vs. letter |
| Token contract summary | radius、size、label-color、label-size from sys；bg 由行內 style 動態設定為 `--md-sys-color-cat-N` |
| Layout / density | 固定尺寸，flex-shrink: 0；不受密度 token 影響 |
| Visual reference | schematic fallback - source preview unavailable |
| Similar components reviewed | MemberCell（MemberCell 是含名稱文字的複合元件；Avatar 是單獨的圖像 primitive） |

## Anatomy

```
<span class="ui-avatar ui-avatar--{size}">
  <img>  ← 僅 photo 模式
  {initial}  ← 字母模式
</span>
```

## Variants

| Variant | 觸發條件 | 差異 |
|---|---|---|
| sm | `size="sm"`（預設）| 22×22px，11px 字體 |
| md | `size="md"` | 28×28px，略大字體 |
| lg | `size="lg"` | 36×36px，14px/600 |
| photo | `photo` prop 存在 | `<img>` 覆蓋字母 |

## States

僅顯示元件，無互動狀態。父元件（KanbanCard 懸停）可能有視覺變化，Avatar 本身不變。

## Token Contract

| Component token | Maps to system token | Purpose | State / mode |
|---|---|---|---|
| `--md-comp-avatar-radius` | `--md-sys-shape-corner-full` | 圓形 | all |
| `--md-comp-avatar-sm-size` | `--md-sys-size-indicator-sm` | 22px 直徑 | sm |
| `--md-comp-avatar-md-size` | `--md-sys-size-indicator-md` | 28px 直徑 | md |
| `--md-comp-avatar-label-color` | `--md-sys-color-on-categorical` | 字母顏色 | all |
| `--md-comp-avatar-sm-label-size` | `--md-sys-typescale-annotation-sm-size` | sm 字體 | sm |
| `--md-comp-avatar-md-label-size` | `--md-sys-typescale-annotation-md-size` | md 字體 | md |
| `--md-comp-avatar-label-weight` | `--md-sys-typescale-annotation-sm-weight` | 字重 | all |
| *(inline style)* | `--md-sys-color-cat-{1–8}` | 背景色（動態）| all |

## Layout Rules

- 固定尺寸，永不 flex-grow
- `flex-shrink: 0`——在 meta row 中不壓縮
- `overflow: hidden`——photo 裁切為圓形
- lg（36px）僅用於抽屜標頭等大型情境，不用於卡片

## Content Rules

- `initial`：傳入單一大寫字母（e.g. `m.initial`）
- `hue`：整數 1–8，對應 `DEPT_HUE` 或成員 `hue` 欄位；超出範圍自動 mod 8
- `alt`：有 photo 時必填；無 photo 時 `initial` 作為 aria-label

## Accessibility Rules

- `role="img"` 已設定
- `aria-label`：無 alt prop 時預設為 initial 字母
- 有 photo 時 `<img>` 需有 `alt`

## Do / Don't

| 應做 | 不應做 |
|---|---|
| 從 `MEMBERS` 取 `hue` 欄位傳入 | 硬編碼背景色 hex |
| size sm 用於卡片和行內情境 | 在卡片 meta row 用 md 或 lg |
| 照片使用 `photo` prop | 用 `background-image` 繞過 comp token |

## Implementation Notes

`src/components/ui/Avatar/Avatar.tsx` 為此規格的參考實作。`hueIndex` 計算確保 1–8 範圍內循環，不超出 cat token 數量。
