# HTML Intro Button Standard

For blog posts that introduce a software project or package, use this standard to render a small centered row of pill buttons near the top of the post. Unlike `html-table-button.md`, there is no frame, no label column, and no desktop/mobile split — just a uniform centered flex row.

## When to Use

Use when a post has only a handful of top-level links (2–4) that don't need category labels — typically a project website and its GitHub repo.

## Structure

Write the HTML directly in the main `.qmd` file — no `{=html}` fence, no separate component file.

```html
<div class="intro-links">
  <a href="https://example.org" class="intro-btn" target="_blank"><i class="bi bi-browser-safari"></i> Website</a>
  <a href="https://github.com/org/repo" class="intro-btn" target="_blank"><i class="bi bi-github"></i> GitHub</a>
</div>
```

## CSS

All styles live in `styles/theme.scss` under `// ---- Intro Links ----`. The equalize-width script (mobile button sizing) lives in `styles/site.js`. **Do not add `<style>` blocks or `<link>` tags to component files.**

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

None. CSS and JS are already in `theme.scss` and `site.js`. Component files need only the HTML content inside a `{=html}` fence.

## Mobile Responsiveness

Already handled in `theme.scss` and `site.js` — stacks vertically at 520px and equalizes button widths.

## Notes
- Use the shared `.intro-links` / `.intro-btn` class names — CSS is global in `theme.scss`, no scoped names needed.
- If two intro-link components on the same page need different styles, create a modifier class in `theme.scss`.

## Reference Implementation

- `blog/2025-11-21-surveydown-version-1/index.qmd` (line 17)
