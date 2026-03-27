# Blog Banner Image Generation Standard

When generating a banner image for a blog post, use the **claude-image-gen CLI** (guinacio/claude-image-gen). Never use Pillow, HTML/CSS+puppeteer, SVG, or any other method.

## API Key Safety

**NEVER** write, echo, export, or reference the Gemini API key as a literal value in any command, file, or permission entry. The key lives exclusively in `~/.zshrc` as `$NANOBANANA_GEMINI_API_KEY`. If it is not set, tell the user to run `source ~/.zshrc`.

## Prerequisites

The CLI must be built once before use. If `/tmp/claude-image-gen/mcp-server/build/cli.bundle.js` does not exist:

```bash
cd /tmp && git clone https://github.com/guinacio/claude-image-gen.git --depth=1
cd /tmp/claude-image-gen/mcp-server && npm install && npm run bundle
```

## Workflow

1. **Run the CLI** from the banners directory:
   ```bash
   GEMINI_API_KEY="$NANOBANANA_GEMINI_API_KEY" node /tmp/claude-image-gen/mcp-server/build/cli.bundle.js \
     --prompt "...prompt..." \
     --aspect-ratio "16:9"
   ```
   The output directory defaults to the current working directory.

2. **Preview** the generated `.jpg` with the Read tool.

3. **Convert to PNG and save** to the final path once approved:
   ```python
   from PIL import Image
   img = Image.open('blog/banners/generated-<uuid>.jpg')
   img.save('blog/banners/<date-slug>.png', format='PNG')
   ```

4. **Delete** the temporary `.jpg` after conversion.

## Output Path Convention

All banner images live at:
```
blog/banners/{YYYY-MM-DD}-{slug}.png
```
This matches the `image:` field in the post's front matter.

## Visual Style Standard

Always include these constraints in the prompt to stay consistent with the approved reference:

- **Background**: light lavender (`#E8E7F8`), never dark, never the same cream as the page background (`#F8F7F0`)
- **Accent color**: muted purple/indigo (`#5654A2`) for cards, lines, badges, icons
- **Illustration style**: clean flat design, minimal depth — NOT sci-fi, NOT neon, NOT 3D render
- **Card style**: UI-window cards with simple line icons only (no text labels inside cards)
- **No busy backgrounds**: no gradients, no grids
- **Text layout**: large bold main title on the left (mixed case, NOT all-caps), with a small rounded purple pill `Part N` inline on the last title line if applicable, and a small plain gray subtitle label below

## Prompt Template

```
Blog banner for a tech blog post. Light lavender background (#E8E7F8).
Right side: flat illustration of a person sitting at a desk viewed from behind,
raising a conductor baton toward four floating UI card panels connected by curved
purple lines — the cards show small icons only ([ICON 1], [ICON 2], [ICON 3], [ICON 4]),
no text inside the cards.
Left side: large bold dark mixed-case text '[MAIN TITLE]' across two or three lines,
then on the same line as the last title word a small rounded purple pill labeled 'Part N',
then below all of that a small plain gray label reading '[SUBTITLE]'.
Muted purple (#5654A2) accent color throughout. Clean minimal flat design,
academic aesthetic, no dark background, no neon, no sci-fi.
```

## Reference

- Approved example: `blog/banners/2026-03-26-agentic-engineering-1.png`
  - Background: light lavender (`#E8E7F8`)
  - Concept: person at desk from behind, conducting four floating UI cards (document, code brackets, terminal, magnifying glass) connected by curved purple lines
  - Text layout: large bold "Agentic Engineering" + "Part 1" pill inline, "Basics" label below
  - Style: flat illustration, lavender bg, purple accent, conductor metaphor
