# Image Embedding Standard

Use raw HTML for all images in blog posts. Never use Quarto's native markdown image syntax (`![caption](path){attrs}`) — it wraps the image in a `<p>` tag that adds unwanted bottom margin, and the figcaption cannot be reliably centered via CSS.

## Standard Template

```html
<figure style="margin: 1rem 0;">
  <img src="resources/image-name.png" style="width: 100%; border: 1.5px solid #5654A2; border-radius: 14px;" />
  <figcaption style="text-align: center; color: #6c757d; font-size: 0.875em; margin-top: 0.5rem;">Concise caption here</figcaption>
</figure>
```

## Rules

- **Border**: always `border: 1.5px solid #5654A2; border-radius: 14px;`
- **Width**: always `width: 100%`
- **Caption**: centered, gray (`#6c757d`), `0.875em`, `margin-top: 0.5rem`
- **Figure margin**: `1rem 0` — no extra spacing above or below
- **Caption text**: concise, describes what is visible in the image

## Why Not Markdown Syntax

Quarto wraps `![caption](path)` in `<figure><p><img/></p><figcaption>` — the inner `<p>` carries Bootstrap's paragraph `margin-bottom`, creating a large gap between the image and its caption. CSS overrides on `figure.figure > p` do not reliably suppress this. Inline HTML avoids the issue entirely.
