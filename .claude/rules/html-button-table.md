# HTML Table Button Style Standard

When creating a styled link/button group for a blog post, use this standard. It shares the same visual language as `html-table-description.md` but is simpler: a label on the left, pill buttons on the right.

## Structure

- One outer wrapper `div` with class `lnk-outer`
- Each row is a `lnk-row` div with two children: `lnk-label` (left) and `lnk-chips` (right)
- Each button is an `<a>` tag with class `lnk-btn` inside `lnk-chips`
- No header row needed

## Example HTML

Write the HTML directly in the main `.qmd` file — no `{=html}` fence needed. **Use 1-space indentation per level** — never 2 or more spaces per level. Pandoc processes HTML block contents as markdown and treats 4+ spaces of leading whitespace as a code block, which breaks the inner divs.

```html
<div class="lnk-outer">
 <div class="lnk-row lnk-purple">
  <div class="lnk-label">Research</div>
  <div class="lnk-chips">
   <a href="https://scholar.google.com" class="lnk-btn" target="_blank">Google Scholar</a>
   <a href="https://www.zotero.org" class="lnk-btn" target="_blank">Zotero</a>
  </div>
 </div>
 <div class="lnk-row lnk-blue">
  <div class="lnk-label">Coding</div>
  <div class="lnk-chips">
   <a href="https://github.com" class="lnk-btn" target="_blank">GitHub</a>
  </div>
 </div>
</div>
```

## CSS

All styles live in `styles/styles.scss` under `// ---- Link Table ----`. Color variants available: `lnk-purple`, `lnk-blue`, `lnk-green`, `lnk-orange`. Mobile stacking is handled there too. **Do not add `<style>` blocks or `<link>` tags to component files.**

## Required Boilerplate

None. Just write the HTML directly in the `.qmd` file.

## Reference Implementation

- `blog/2024-01-30-how-to-do-research/index.qmd` (line 12)
