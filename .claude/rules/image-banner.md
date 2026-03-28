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

Always include these constraints in the prompt:

- **Background**: any light, comfortable color — e.g. light lavender, light blue, light orange, light green, or light pink. Never dark, never the same cream as the page background (`#F8F7F0`). Choose a color that suits the mood and topic of the post.
- **Accent color**: muted purple/indigo (`#5654A2`) for cards, lines, badges, icons
- **Illustration style**: clean flat design, minimal depth — NOT sci-fi, NOT neon, NOT 3D render
- **Illustration concept**: choose freely based on the post's title and content — it does NOT have to be a person at a computer. Pick a metaphor or visual that best represents the post's ideas (e.g. a branching tree for a decision-making post, stacked building blocks for an architecture post, a magnifying glass over data for an analysis post, etc.).
- **No busy backgrounds**: no gradients, no grids
- **Text layout**: strong typographic hierarchy — content words large and bold, function words and secondary text visually diminished. See typography rules below.
- **Typography hierarchy** (critical):
  - **Content words** (nouns, verbs, key adjectives — e.g. "Logit", "Bootcamp", "Code"): large, heavy/bold, dark near-black, in a bold sans-serif font
  - **Function words** (prepositions, articles, conjunctions — e.g. "The History of", "from", "to"): rendered in the accent purple (#5654A2) at a medium size — visible and readable, but clearly subordinate to the content word. This purple treatment is preferred over light gray for function words.
  - **Part pill** (if applicable): small rounded purple pill `Part N` inline on the last title line, text in monospace font
  - **Subtitle / secondary label** (e.g. "Statistical Modeling", "URSSI Winter School 2025"): small, light gray, quiet monospace — a whisper beneath the title
  - The overall effect: eye lands on the dark near-black content word first, reads the purple function words second, notices the gray subtitle last
  - **Text size**: content words large and prominent but NOT oversized — title occupies roughly the left half of the banner, right half stays clean for the illustration. Good breathing room around all elements.
  - **Capitalization**: NEVER use all-capitals or all-uppercase for any word in the title or subtitle. Always use title case (e.g. "Smart Charging Adoption", not "SMART CHARGING ADOPTION"). This applies to every word, including single-word package names like "surveydown" or "sdstudio" — render them exactly as written (lowercase), never uppercased.
  - **Illustration style**: the illustration can include subtle decorative scatter elements (small dots, short dashes) floating around it to add visual depth without busyness.

## Ideal Layout Reference

`blog/banners/2024-05-20-history-of-logit.png` is the approved gold standard for layout:
- Function words ("The History of") in accent purple, medium size
- Content word ("Logit") very large, bold, dark near-black
- "Statistical Modeling" as small gray monospace subtitle
- S-curve illustration floats on the right with scatter dots
- Generous padding, nothing feels crowded
- **Fonts**:
  - **Title text**: bold sans-serif font — elegant, high-contrast strokes. Use for all title words (both content words bold and function words lighter).
  - **Secondary labels and pills**: monospace font — clean, quiet, code-adjacent feel.

## Prompt Template

```
Blog banner for a tech blog post. Light [COLOR] background ([HEX]).
Right side: flat illustration of [ILLUSTRATION CONCEPT THAT FITS THE POST TOPIC].
Left side: typographic title with strong hierarchy in a bold sans-serif font —
content words ([KEY WORDS]) are large and bold dark near-black,
function words ([PREPOSITIONS/ARTICLES]) are smaller and lighter in the same sans-serif font
so they recede; then below a small light gray label reading '[SUBTITLE]' in a monospace font
that whispers rather than shouts; with a small rounded purple pill labeled 'Part N'
in monospace inline on the last title line if applicable.
Muted purple (#5654A2) accent color throughout. Clean minimal flat design,
academic aesthetic, no dark background, no neon, no sci-fi.
```

When filling in the template:
- Choose `[COLOR]` and `[HEX]` to match the emotional tone of the post.
- Design `[ILLUSTRATION CONCEPT]` to visually represent the post's core idea, not a generic desk scene.
- Identify `[KEY WORDS]` (the nouns/verbs that carry meaning) and `[PREPOSITIONS/ARTICLES]` (the connective words that should recede).

## Reference

- Approved example: `blog/banners/2026-03-26-agentic-engineering-1.png`
  - Background: light lavender (`#E8E7F8`)
  - Concept: person at desk from behind, conducting four floating UI cards — chosen because the post is about orchestrating AI agents
  - Text layout: "Agentic Engineering" large and bold, "Part 1" pill inline, "Basics" as a small quiet gray pill below — excellent typographic hierarchy
  - Style: flat illustration, lavender bg, purple accent, conductor metaphor
