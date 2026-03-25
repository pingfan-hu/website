# HTML Styled Table Standard

When creating a styled HTML table for a blog post, always follow this design standard.

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

/* Responsive: stack at narrow widths */
@media (max-width: 520px) {
  .xyz-header { grid-template-columns: 1fr; }
  .xyz-header-cell:last-child { display: none; }
  .xyz-row { grid-template-columns: 1fr; }
  .xyz-layer { border-right: none; border-bottom: 1px solid #D4D3EE; padding: 10px 14px; }
  .xyz-resp { padding: 10px 14px; font-size: 0.9em; }
}
```

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

## Reference Implementation

`blog/2026-03-24-how-to-use-ai-effectively/resources/claude-code-layers.qmd`
