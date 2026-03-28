# HTML Intro Button Standard

For blog posts that introduce a software project or package, use this standard to render a small centered row of pill buttons near the top of the post. Unlike `html-table-button.md`, there is no frame, no label column, and no desktop/mobile split — just a uniform centered flex row.

## When to Use

Use when a post has only a handful of top-level links (2–4) that don't need category labels — typically a project website and its GitHub repo.

## Structure

A single `div` wrapper with flex centering, containing `<a>` tags with Bootstrap Icons:

```html
<div class="intro-links">
  <a href="https://example.org" class="intro-btn" target="_blank"><i class="bi bi-browser-safari"></i> Website</a>
  <a href="https://github.com/org/repo" class="intro-btn" target="_blank"><i class="bi bi-github"></i> GitHub</a>
</div>
```

## CSS Specifications

```css
.intro-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 1em 0;
  justify-content: center;
}
.intro-btn {
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
.intro-btn:hover {
  background: #5654A2;
  color: #F8F7F0;
  text-decoration: none;
}
```

## Icons

Use Bootstrap Icons (`bi` classes) — already loaded by Quarto's Bootstrap theme, no extra import needed. Common ones:

| Icon | Class |
|------|-------|
| Website / Safari | `bi bi-browser-safari` |
| GitHub | `bi bi-github` |
| Document / Paper | `bi bi-file-earmark-text` |
| Package | `bi bi-box-seam` |
| Globe | `bi bi-globe` |

## Required Boilerplate

Only the Maple Mono font import is needed (no Lucide):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/maple-mono@5.2.5/index.min.css">
```

## Mobile Responsiveness (Required)

On narrow screens, buttons wrap at different widths and look uneven. Fix by stacking vertically with a fixed width:

```css
@media (max-width: 520px) {
  .xyz-links { flex-direction: column; align-items: center; }
  .xyz-btn { width: 150px; text-align: center; }
}
```

## Notes
- Use scoped class names per post (e.g. `.sd-links` / `.sd-btn`) to avoid collisions if multiple components appear on the same page.

## Reference Implementation

- `blog/2025-11-21-surveydown-version-1/resources/useful-links.qmd`
