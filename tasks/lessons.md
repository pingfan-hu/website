# Lessons

Corrections and patterns from past sessions. Review before working on related areas.

## Image generation (cocktail / recipe ingredient icons)

- **Liquid containers ALWAYS stand perfectly upright.** Any glass, bottle, jar, cup, or siphon holding liquid must have its central vertical axis exactly vertical — never tilted, leaning, or rotated. A tilted vessel of liquid reads as spilling and is always wrong. This is a permanent default, not something to decide per image. The `BOTTLE_PROMPT_TEMPLATE` (image-to-image) bakes it in; **bespoke text-to-image icons must state it explicitly**, or the model tilts them for a "dynamic" look (this happened to lemon-juice / simple-syrup / soda-water).
- **One continuous background — no caption band.** Captioned icons reserve an empty bottom strip for the composited caption, but the background must be the SAME color there as behind the subject — no seam, band, shelf, tabletop, or ground line. The `composite_labels.py` script only draws text + shadow; it never paints a box, so any "label background" is baked into the generated image. Causes: (a) props (fruit, sugar cubes) resting on an implied surface → make them **float**; (b) cool/blue gradients band more than warm/cream → prefer a warm neutral field when a clear liquid needs no color cue.
- **Cocktail bottle paradigms** live in `~/.claude/skills/ph-image/resources/`: `spirit-bottle-reference.png` (tall cork, all base spirits + liqueurs incl. triple sec, recolored by liquid), `mixer-bottle-reference.png` (crown-cap contour — cola/sodas only). All other mixers are bespoke, case by case (juice in a glass with fruit, syrup bottle + sugar cubes, split coconut, lidded glass of soda). Registry: `BOTTLES` dict in `image_to_image.py`.
- **Gemini API has a monthly spending cap.** When exhausted, the CLI returns HTTP 429 `RESOURCE_EXHAUSTED` and writes no file. Resets monthly; raise at https://ai.studio/spend. Not a prompt bug — check this first if a batch silently produces no images.

## Site UI / Quarto

- **The subpage "Back to <section>" button is injected at runtime by `resources/styles/styles.js`** (function `addBackButton`, reads the section title from the navbar), NOT a Quarto built-in. It will NOT appear in a static-HTML grep — check `styles.js` for any runtime-injected UI before concluding "the feature doesn't exist." Per-section label overrides live in the `BACK_LABELS` map (recipes → 回到菜谱总览, cocktails → 回到鸡尾酒总览; others fall back to "Back to <title>").
- **Listing item "Back to listing" links are NOT a Quarto built-in** — Quarto only ships `back-to-top` and `notebook-preview-back` language strings. Any back-to-listing button here is the custom `styles.js` one above.
- **Customizable Quarto UI strings** go in a top-level `language:` block in `_quarto.yml` (e.g. `listing-page-filter: "查找"`, `toc-title-website: "Table of contents"`). Per-page TOC title override: `toc-title:` in the page or directory `_metadata.yml` (used `目录` for cocktails/recipes). Listing search box: `filter-ui: [title]` (built-in, filters by title).
- **Single-file `quarto render <file>` does NOT inject listing-context features** (and resources/JS copying differs). Use a full `quarto render` to reproduce listing-related behavior.
