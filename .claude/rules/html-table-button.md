# HTML Table Button Style Standard

When creating a styled link/button group for a blog post, use this standard. It shares the same visual language as `html-table.md` but is simpler: a label on the left, pill buttons on the right.

## Structure

- One outer wrapper `div` with class `lnk-outer`
- Each row is a `lnk-row` div with two children: `lnk-label` (left) and `lnk-chips` (right)
- Each button is an `<a>` tag with class `lnk-btn` inside `lnk-chips`
- No header row needed

## Example HTML

```html
<div class="lnk-outer">
  <div class="lnk-row">
    <div class="lnk-label">Research</div>
    <div class="lnk-chips">
      <a href="https://scholar.google.com" class="lnk-btn" target="_blank">Google Scholar</a>
      <a href="https://www.zotero.org" class="lnk-btn" target="_blank">Zotero</a>
    </div>
  </div>
  <div class="lnk-row">
    <div class="lnk-label">Coding</div>
    <div class="lnk-chips">
      <a href="https://github.com" class="lnk-btn" target="_blank">GitHub</a>
    </div>
  </div>
</div>
```

## CSS Specifications

```css
.lnk-outer {
  width: 100%;
  margin: 1em 0;
  border: 1.5px solid #5654A2;
  border-radius: 14px;
  overflow: hidden;
}

.lnk-row {
  display: grid;
  grid-template-columns: 28% 1fr;
  border-top: 1px solid #D4D3EE;
  background: #F8F7F0;
}
.lnk-row:first-child { border-top: none; }

.lnk-label {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  color: #5654A2;
  background: #EEEDF8;
  border-right: 1px solid #D4D3EE;
}

.lnk-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 16px;
  align-items: center;
}

.lnk-btn {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid #5654A2;
  background: #EEEDF8;
  color: #5654A2;
  font-family: 'Maple Mono', monospace;
  font-size: 0.82em;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}
.lnk-btn:hover {
  background: #5654A2;
  color: #F8F7F0;
  text-decoration: none;
}
```

## Mobile Responsiveness (Required)

Stack label above chips on narrow screens:

```css
@media (max-width: 520px) {
  .lnk-row { grid-template-columns: 1fr; }
  .lnk-label {
    border-right: none;
    border-bottom: 1px solid #D4D3EE;
    padding: 8px 14px;
  }
  .lnk-chips { padding: 10px 14px; }
}
```

## Per-Row Color Variants

Add a color modifier class to each `lnk-row` to give each category its own accent:

```html
<div class="lnk-row lnk-purple">...</div>  <!-- default purple -->
<div class="lnk-row lnk-blue">...</div>
<div class="lnk-row lnk-green">...</div>
<div class="lnk-row lnk-orange">...</div>
```

Each modifier overrides `.lnk-label` and `.lnk-btn` colors:

```css
.lnk-purple .lnk-label { color: #5654A2; background: #EEEDF8; }
.lnk-purple .lnk-btn   { border-color: #5654A2; color: #5654A2; background: #EEEDF8; }
.lnk-purple .lnk-btn:hover { background: #5654A2; color: #F8F7F0; text-decoration: none; }

.lnk-blue .lnk-label { color: #2471A3; background: #EBF5FB; }
.lnk-blue .lnk-btn   { border-color: #2471A3; color: #2471A3; background: #EBF5FB; }
.lnk-blue .lnk-btn:hover { background: #2471A3; color: #F8F7F0; text-decoration: none; }

.lnk-green .lnk-label { color: #1E8449; background: #E9F7EF; }
.lnk-green .lnk-btn   { border-color: #1E8449; color: #1E8449; background: #E9F7EF; }
.lnk-green .lnk-btn:hover { background: #1E8449; color: #F8F7F0; text-decoration: none; }

.lnk-orange .lnk-label { color: #CA6F1E; background: #FEF5E7; }
.lnk-orange .lnk-btn   { border-color: #CA6F1E; color: #CA6F1E; background: #FEF5E7; }
.lnk-orange .lnk-btn:hover { background: #CA6F1E; color: #F8F7F0; text-decoration: none; }
```

The `.lnk-btn` base class should omit `border-color`, `color`, and `background` — those come entirely from the modifier.

## Required Boilerplate

At the top of the `{=html}` block (Lucide not needed for this component):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono@5.2.5/index.min.css">
```

## Reference Implementation

- `blog/2024-01-30-how-to-do-research/resources/useful-links.qmd`
