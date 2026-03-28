# HTML URL Anatomy Style Standard

For blog posts that need to visually explain a URL's structure, use this component. It shows the full URL in a header bar, then an annotated chip-per-segment breakdown. It switches between a horizontal (desktop) and vertical table (stacked) layout based on actual overflow — not a fixed breakpoint.

## When to Use

Use when a post explains how a URL is constructed: base URL, query parameters, separators. Especially useful for technical tutorials involving APIs, survey links, or redirect URLs.

## Layout Behavior

- **Desktop**: plain monospace text full-bar + annotated breakdown row (chips with labels, separators between them, `flex-wrap: nowrap`)
- **Stacked**: chip+separator full-bar (colored chips + muted `/?`/`&` text, `flex-wrap: wrap`) + vertical label/chip table. The chip bar replaces the plain text bar so the URL structure stays clear without labels.
- **Switching logic**: a `ResizeObserver` temporarily removes the stacked class, measures `breakdown.scrollWidth > breakdown.clientWidth + 1` in desktop context, then re-adds stacked if overflow is detected. Fires before paint so there is no flicker. Works bidirectionally — switches back to desktop when the screen widens again.

## Structure

```html
<div class="urlN-outer">
  <div class="urlN-header">URL Anatomy</div>

  <!-- Desktop: plain text full-bar -->
  <div class="urlN-full-bar">https://example.com/?foo=xxx&amp;bar=xxx</div>

  <!-- Stacked: chip+separator full-bar (hidden on desktop, shown when stacked) -->
  <div class="urlN-full-bar-chips">
    <span class="urlN-full-chip urlN-full-chip-base">https://example.com</span>
    <span class="urlN-full-sep">/?</span>
    <span class="urlN-full-chip urlN-full-chip-param">foo=xxx</span>
    <span class="urlN-full-sep">&amp;</span>
    <span class="urlN-full-chip urlN-full-chip-param">bar=xxx</span>
  </div>

  <!-- Desktop: horizontal chips with labels -->
  <div class="urlN-breakdown">
    <div class="urlN-chunk">
      <div class="urlN-chip urlN-chip-base">https://example.com</div>
      <div class="urlN-lbl">Base URL</div>
    </div>
    <div class="urlN-sep">/?</div>
    <div class="urlN-chunk">
      <div class="urlN-chip urlN-chip-param">foo=xxx</div>
      <div class="urlN-lbl">Parameter</div>
    </div>
    <div class="urlN-sep">&amp;</div>
    <div class="urlN-chunk">
      <div class="urlN-chip urlN-chip-param">bar=xxx</div>
      <div class="urlN-lbl">Parameter</div>
    </div>
  </div>

  <!-- Stacked: vertical table -->
  <div class="urlN-mobile">
    <div class="urlN-m-row">
      <div class="urlN-m-label">Base URL</div>
      <div class="urlN-m-val"><span class="urlN-chip urlN-chip-base" style="white-space:normal;word-break:break-all;">https://example.com</span></div>
    </div>
    <div class="urlN-m-row">
      <div class="urlN-m-label">Parameter</div>
      <div class="urlN-m-val"><span class="urlN-chip urlN-chip-param">foo=xxx</span></div>
    </div>
    <div class="urlN-m-row">
      <div class="urlN-m-label">Parameter</div>
      <div class="urlN-m-val"><span class="urlN-chip urlN-chip-param">bar=xxx</span></div>
    </div>
  </div>
</div>
```

Use a unique prefix per component on the same page (e.g. `url1-`, `url2-`, `url3-`) to avoid CSS/JS collisions.

## Chip Color Variants

| Class | Color | Use for |
|-------|-------|---------|
| `urlN-chip-base` | Purple `#5654A2` / `#EEEDF8` bg | Base URL |
| `urlN-chip-param` | Blue `#2471A3` / `#EBF5FB` bg | Standard query parameters |
| `urlN-chip-rst` | Orange `#CA6F1E` / `#FEF5E7` bg | Special status parameters (e.g. `rst=1`) |

## Optional: Legend Row

For parameters with enumerated values (e.g. `rst=1/2/3`), add a legend row below the stacked layout:

```html
<div class="urlN-legend">
  <span class="urlN-legend-label">rst:</span>
  <span class="urlN-badge urlN-badge-complete">1 = Complete</span>
  <span class="urlN-badge urlN-badge-screenout">2 = Screenout</span>
  <span class="urlN-badge urlN-badge-quotafull">3 = Quotafull</span>
</div>
```

Badge colors: green for complete, orange for screenout, purple for quotafull.

## CSS Specifications

```css
.urlN-outer {
  width: 100%;
  margin: 1em 0;
  border: 1.5px solid #5654A2;
  border-radius: 14px;
  overflow: hidden;
}
.urlN-header {
  background: #5654A2;
  padding: 10px 16px;
  font-family: 'Maple Mono', monospace;
  font-size: 0.85em;
  font-weight: bold;
  color: #F8F7F0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
/* Desktop: plain text full-bar */
.urlN-full-bar {
  padding: 12px 16px;
  font-family: 'Maple Mono', monospace;
  font-size: 0.88em;
  color: #564232;
  background: #F8F7F0;
  border-bottom: 1px solid #D4D3EE;
  word-break: break-all;
}
/* Stacked: chip+separator full-bar */
.urlN-full-bar-chips {
  display: none;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  background: #F8F7F0;
  border-bottom: 1px solid #D4D3EE;
}
.urlN-full-chip {
  font-family: 'Maple Mono', monospace;
  font-size: 0.82em;
  padding: 3px 9px;
  border-radius: 8px;
  white-space: nowrap;
}
.urlN-full-chip-base  { background: #EEEDF8; color: #5654A2; border: 1px solid #C4C3E8; }
.urlN-full-chip-param { background: #EBF5FB; color: #2471A3; border: 1px solid #A9CCE3; }
.urlN-full-chip-rst   { background: #FEF5E7; color: #CA6F1E; border: 1px solid #F5CBA7; }
.urlN-full-sep {
  font-family: 'Maple Mono', monospace;
  font-size: 0.82em;
  color: #B0A8C0;
  padding: 0 1px;
  flex-shrink: 0;
}
.urlN-breakdown {
  display: flex;
  flex-wrap: nowrap;   /* MUST be nowrap — overflow detection depends on this */
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  background: #F8F7F0;
  /* Do NOT set overflow: hidden here — it breaks scrollWidth measurement */
}
.urlN-mobile { display: none; }
.urlN-stacked .urlN-full-bar { display: none; }
.urlN-stacked .urlN-full-bar-chips { display: flex; }
.urlN-stacked .urlN-breakdown { display: none; }
.urlN-stacked .urlN-mobile { display: block; }
.urlN-chunk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.urlN-chip {
  font-family: 'Maple Mono', monospace;
  font-size: 0.82em;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
}
.urlN-chip-base  { background: #EEEDF8; color: #5654A2; border: 1px solid #C4C3E8; }
.urlN-chip-param { background: #EBF5FB; color: #2471A3; border: 1px solid #A9CCE3; }
.urlN-chip-rst   { background: #FEF5E7; color: #CA6F1E; border: 1px solid #F5CBA7; }
.urlN-lbl {
  font-family: 'Maple Mono', monospace;
  font-size: 0.7em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9B8EA0;
  white-space: nowrap;
}
.urlN-sep {
  font-family: 'Maple Mono', monospace;
  font-size: 0.88em;
  color: #B0A8C0;
  padding: 4px 2px 0;
  flex-shrink: 0;
}
/* Stacked table */
.urlN-m-row {
  display: grid;
  grid-template-columns: 36% 1fr;
  border-top: 1px solid #D4D3EE;
  background: #F8F7F0;
}
.urlN-m-label {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  font-family: 'Maple Mono', monospace;
  font-size: 0.8em;
  color: #5654A2;
  background: #EEEDF8;
  border-right: 1px solid #D4D3EE;
}
.urlN-m-val {
  display: flex;
  align-items: center;
  padding: 10px 14px;
}
```

## JavaScript (ResizeObserver)

```html
<script>
(function() {
  var outer = document.currentScript.previousElementSibling;
  var breakdown = outer.querySelector('.urlN-breakdown');
  var observer = new ResizeObserver(function() {
    outer.classList.remove('urlN-stacked');
    if (breakdown.scrollWidth > breakdown.clientWidth + 1) {
      outer.classList.add('urlN-stacked');
    }
  });
  observer.observe(outer);
})();
</script>
```

**Key rules:**
- Never set `overflow: hidden` on `.urlN-breakdown` — it makes `scrollWidth` unreliable
- Never do a synchronous check before `observer.observe()` — layout isn't ready yet
- Always remove the stacked class before measuring (measure in desktop context)
- No `disconnect()` — keep observing so switching back on widen also works

## Required Boilerplate

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono@5.2.5/index.min.css">
```

No Lucide needed.

## Reference Implementations

- Basic: `blog/2025-07-07-dynata-tutorial/resources/url-anatomy.qmd`
- With named params: `blog/2025-07-07-dynata-tutorial/resources/url-anatomy-dynata.qmd`
- With special param + legend: `blog/2025-07-07-dynata-tutorial/resources/url-anatomy-ending.qmd`
