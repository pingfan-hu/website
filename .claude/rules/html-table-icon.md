# HTML Icon Card Grid Standard

Use this pattern when you want a visual overview component with icons: a set of tools, concepts, or categories where each item has an icon, a label, and a short description. Unlike `html-table-description.md` (which splits into a label column and a value column), this pattern arranges items as equal-width cards in a grid.

## When to Use

- Showcasing a collection of tools, options, or categories with equal visual weight
- When items benefit from icons as the primary visual anchor
- When you have 2–6 items that are peers (not hierarchical label → value pairs)
- Optional: group cards into named sections using section bars

## Structure

- One outer wrapper `div`
- A centered header bar (not split-column)
- Optional section bars between card groups
- A grid `div` containing card `div`s
- Each card: icon box + label + optional subtitle + description

```html
<div class="xyz-outer">
  <div class="xyz-header">
    <div class="xyz-header-icon"><i data-lucide="blocks"></i></div>
    <span class="xyz-header-text">Table Title</span>
  </div>

  <!-- Optional section bar -->
  <div class="xyz-section-bar">Section Name</div>
  <div class="xyz-grid">
    <div class="xyz-card">
      <div class="xyz-card-icon"><i data-lucide="package"></i></div>
      <div class="xyz-label">Card Label</div>
      <div class="xyz-sub">Optional subtitle</div>  <!-- omit if not needed -->
      <div class="xyz-desc">Short description of this item.</div>
    </div>
    <!-- repeat cards -->
  </div>
</div>
```

## CSS Specifications

```css
.xyz-outer {
  width: 100%;
  margin: 1em 0;
  border: 1.5px solid #5654A2;
  border-radius: 14px;
  overflow: hidden;
}

/* Centered header */
.xyz-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #5654A2;
  padding: 10px 16px;
}

.xyz-header-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(248, 247, 240, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xyz-header-icon svg {
  width: 14px;
  height: 14px;
  color: #F8F7F0;
  stroke-width: 1.8;
}

.xyz-header-text {
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  font-weight: bold;
  color: #F8F7F0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Section bar (optional divider between card groups) */
.xyz-section-bar {
  padding: 7px 16px;
  background: #EEEDF8;
  border-top: 1px solid #D4D3EE;
  font-family: 'Maple Mono', monospace;
  font-size: 0.75em;
  font-weight: bold;
  color: #9B8EA0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Card grid */
.xyz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* adjust column count as needed */
  background: #F8F7F0;
  border-top: 1px solid #D4D3EE;
}

.xyz-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 16px;
  text-align: center;
  border-right: 1px solid #D4D3EE;
  transition: background 0.15s ease;
}

.xyz-card:last-child { border-right: none; }
.xyz-card:hover { background: #F0EFF8; }
.xyz-card:hover .xyz-card-icon { background: #F8F7F0; }

.xyz-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #EEEDF8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.xyz-card-icon svg {
  width: 20px;
  height: 20px;
  color: #5654A2;
  stroke-width: 1.8;
}

.xyz-label {
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  font-weight: bold;
  color: #5654A2;
  line-height: 1.4;
  margin-bottom: 4px;
}

/* Optional subtitle (e.g. brand name, category tag) */
.xyz-sub {
  font-family: 'Maple Mono', monospace;
  font-size: 0.75em;
  color: #9B8EA0;
  margin-bottom: 4px;
}

.xyz-desc {
  font-size: 0.88em;
  color: #564232;
  line-height: 1.5;
  margin-top: 2px;
}
```

## Mobile Responsiveness (Required)

Switch from grid to a compact icon-left, label+desc-right layout per card:

```css
@media (max-width: 520px) {
  .xyz-grid { grid-template-columns: 1fr; }
  .xyz-card {
    display: grid;
    grid-template-columns: 44px 1fr;
    align-items: center;
    text-align: left;
    border-right: none;
    border-bottom: 1px solid #D4D3EE;
    padding: 14px;
    gap: 0 12px;
  }
  .xyz-card:last-child { border-bottom: none; }
  .xyz-card-icon { grid-column: 1; grid-row: 1 / -1; margin-bottom: 0; align-self: center; }
  .xyz-label { grid-column: 2; margin-bottom: 1px; }
  .xyz-sub   { grid-column: 2; margin-bottom: 1px; }
  .xyz-desc  { grid-column: 2; margin-top: 0; }
}
```

## Brand Icons in Card Icons

To use a brand logo inside `.xyz-card-icon` instead of a Lucide icon, replace the `<i data-lucide>` with an inline SVG. Fetch the path from jsDelivr (never `cdn.simpleicons.org`):

```html
<div class="xyz-card-icon">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#BRAND_COLOR" xmlns="http://www.w3.org/2000/svg">
    <path d="...path from jsDelivr..."/>
  </svg>
</div>
```

## Required Boilerplate

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono@5.2.5/index.min.css">
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

At the bottom:

```html
<script>
  if (typeof lucide !== 'undefined') lucide.createIcons();
</script>
```

## Notes

- **Column count**: use `1fr 1fr` for 2 cards, `1fr 1fr 1fr` for 3, `repeat(4, 1fr)` for 4. More than 4 columns gets cramped on mid-size screens; prefer two rows of 3 over one row of 6.
- **Section bars**: use when cards naturally group into 2+ categories. Skip if all cards are peers with no grouping.
- **Subtitle (`.xyz-sub`)**: use for secondary labels like brand name or type tag. Omit the element entirely if not needed.
- **Header icon**: choose a Lucide icon that represents the overall collection, not a specific card.

## Reference Implementations

- `blog/2026-04-06-agentic-engineering-2/resources/workflow-examples.qmd` — 3-column grid with section bars and brand SVG icons
- `blog/2026-04-06-agentic-engineering-2/resources/claude-code-components.qmd` — card grid with Lucide icons only
