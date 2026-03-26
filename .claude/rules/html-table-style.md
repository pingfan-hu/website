# HTML Styled Table Standard

When creating a styled HTML component for a blog post, always follow this design standard.

## Structure

- One outer wrapper `div` with a unique scoped CSS class prefix (e.g., `xyz-outer`)
- A header row div (`xyz-header`) followed by data row divs (`xyz-row`)
- Each row has two children: a left cell (`xyz-layer`) and a right cell (`xyz-resp`)
- An optional Lucide icon + label in the left cell

## CSS Specifications

```css
/* Outer container — single unified shape */
.xyz-outer {
  width: 100%;
  margin: 1em 0;
  border: 1.5px solid #5654A2;
  border-radius: 14px;
  overflow: hidden;
}

/* Header bar */
.xyz-header {
  display: grid;
  grid-template-columns: 30% 1fr;  /* adjust split as needed */
  background: #5654A2;
  padding: 10px 16px;
}
.xyz-header-cell {
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  font-weight: bold;
  color: #F8F7F0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Data rows */
.xyz-row {
  display: grid;
  grid-template-columns: 30% 1fr;
  align-items: stretch;
  border-top: 1px solid #D4D3EE;
  background: #F8F7F0;
  transition: background 0.15s ease;
}
.xyz-row:hover { background: #F0EFF8; }

/* Left cell */
.xyz-layer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-right: 1px solid #D4D3EE;
  background: #EEEDF8;
}
.xyz-row:hover .xyz-layer { background: #E6E5F4; }

/* Icon */
.xyz-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #F8F7F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.xyz-icon svg {
  width: 14px;
  height: 14px;
  color: #5654A2;
  stroke-width: 1.8;
}

/* Label in left cell */
.xyz-name {
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  color: #5654A2;
  line-height: 1.4;
}

/* Right cell */
.xyz-resp {
  padding: 12px 20px;
  font-size: 0.95em;
  color: #564232;
  line-height: 1.5;
  display: flex;
  align-items: center;
}
```

## Mobile Responsiveness (Required)

Every component must have a `@media (max-width: 520px)` block. Use the appropriate pattern for the layout type:

### 2-column table (label → value)
Stack on mobile — label row (purple-tinted bg) appears above its value row. This is always more readable than squeezing side-by-side at narrow widths.
```css
@media (max-width: 520px) {
  .xyz-header { grid-template-columns: 1fr; justify-items: center; }
  .xyz-header-cell:last-child { display: none; }
  .xyz-row { grid-template-columns: 1fr; }
  .xyz-layer { border-right: none; border-bottom: 1px solid #D4D3EE; padding: 10px 14px; }
  .xyz-resp { padding: 10px 14px; font-size: 0.9em; }
}
```

### 3-column comparison table (attr | col-A | col-B)
Hide the full header and inject column labels via `data-label` + `::before` so each value stays labeled.
```css
@media (max-width: 560px) {
  .xyz-header { display: none; }
  .xyz-row { grid-template-columns: 1fr; }
  .xyz-attr { border-right: none; border-bottom: 1px solid #D4D3EE; }
  .xyz-cell {
    border-right: none;
    border-bottom: 1px solid #D4D3EE;
    padding: 8px 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .xyz-cell:last-child { border-bottom: none; }
  .xyz-cell::before {
    content: attr(data-label);
    font-family: 'Maple Mono', monospace;
    font-size: 0.72em;
    font-weight: bold;
    color: #5654A2;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}
```
Add `data-label="Column A"` / `data-label="Column B"` to each cell in HTML.

For cells with chip/tag content, restore row layout so chips wrap horizontally:
```css
  .xyz-cell.xyz-chips {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 14px;
    gap: 8px;
  }
  .xyz-cell.xyz-chips::before { width: 100%; margin-bottom: -2px; }
```

### Card grid (N equal columns)
Switch to a compact icon-left, label+desc-right layout per card using CSS grid.
```css
@media (max-width: 520px) {
  .xyz-grid { grid-template-columns: 1fr; }
  .xyz-card {
    display: grid;
    grid-template-columns: 44px 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    text-align: left;
    border-right: none;
    border-bottom: 1px solid #D4D3EE;
    padding: 14px;
    gap: 0 12px;
  }
  .xyz-card:last-child { border-bottom: none; }
  .xyz-card-icon { grid-row: 1 / 3; margin-bottom: 0; align-self: center; }
  .xyz-label { grid-column: 2; margin-bottom: 2px; }
  .xyz-desc  { grid-column: 2; }
}
```

## Brand Icons

Use **Simple Icons** via jsDelivr for brand logos. Never use `cdn.simpleicons.org` directly — it blocks embedding. Always inline the SVG path:

```html
<!-- Fetch the path from: https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/{slug}.svg -->
<svg class="xyz-badge" viewBox="0 0 24 24" fill="#BRAND_COLOR" xmlns="http://www.w3.org/2000/svg">
  <path d="...path from jsDelivr..."/>
</svg>
```

Common slugs: `openai`, `chatgpt`, `anthropic`, `googlegemini`, `github`, `python`, `r`.

## Required Boilerplate

Always include these at the top of the `{=html}` block:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono@5.2.5/index.min.css">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

And at the bottom, use a guarded icon init (safe if Lucide is already loaded on the page):

```html
<script>
  if (typeof lucide !== 'undefined') lucide.createIcons();
</script>
```

## Reference Implementations

- 2-column table: `blog/2026-03-24-how-to-use-ai-effectively/resources/claude-code-layers.qmd`
- 3-column comparison: `blog/2026-03-24-how-to-use-ai-effectively/resources/ai-comparison.qmd`
- Card grid: `blog/2026-03-24-how-to-use-ai-effectively/resources/ai-mindset-shift.qmd`
- Image row: `blog/2026-03-24-how-to-use-ai-effectively/resources/memes.qmd`
