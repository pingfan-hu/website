# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal academic website for Pingfan Hu, built with **Quarto** (a scientific publishing system). The site is deployed to `pingfan.org` and uses R for dynamic content generation.

## Build Commands

```bash
# Preview site locally (live reload)
quarto preview

# Build the full site
quarto render

# Render a single file
quarto render about.qmd
```

The rendered output goes to `_site/`. CV and Resume are rendered as PDF with Quarto's Typst format.

Local R dependencies (install once): `tidyverse`, `htmltools`, `commonmark`, `kableExtra`, `here`, `surveydown`.

## Architecture

### Site Configuration
- **`_quarto.yml`** — master config: navbar, theme, CSS, global R chunk options, resource paths. Also excludes `**/resources/*.qmd` from rendering at the project level.
- **`_variables.yml`** — reusable shortcodes like `{{< var rnolink >}}` and `{{< var sloan >}}` used site-wide
- **`resources/styles/styles.scss`** — custom SCSS on top of the `flatly`/`darkly` Bootstrap themes, background `#F8F7F0`
- **`resources/styles/styles.js`** — injected after body on every page via `_quarto.yml`. Responsibilities: dynamic footer year, scroll fade-in animations (via IntersectionObserver on `.quarto-post`, `.quarto-grid-item`, `.presentation-box`; the reveal is **one-shot** — once a card's fade-in transition ends the JS removes the `animate-on-scroll`/`is-visible` classes so they stop owning `transform`/`transition`, which is what lets the cards' hover border and `:active` press effects work), the **"Back to &lt;Section&gt;" pill** injected above the title on subpages (`.subpage-back-btn`), language labels above code blocks, copy-button UX cleanup, and the **recipe step timer** (scoped to `/recipes/` paths): each step's `.step-time` chip becomes a clickable countdown drawer that mounts in-flow under the card, auto-scrolls into view (desktop centers the card+drawer; mobile pins the drawer's bottom just above the fixed footer, in absolute coords so re-toggling never drifts), and gives the running step's card the accent on its border. A floating `.recipe-timer-jump` button (bottom-right, above the footer) appears only when a timer is open and its drawer has scrolled off-screen, and taps back to the active card via the same scroll logic. Cocktail pages reuse the same `.step-*` markup but the timer is intentionally disabled there (the JS bails outside `/recipes/`).

### Content Sections
- **`index.qmd`** — homepage: a masthead written as raw HTML on a 12-column grid (`.masthead-*` in `styles.scss`): name (a `role="heading"` paragraph, since Quarto lifts a leading `<h1>` into its title block on a page with no `title`), a three-line facts list (location, role with Alkaline Software, degree, each behind a Tabler glyph), a short bio paragraph at the full width of the text column, Resume and CV pills, a short rule, the five profile glyphs each in Tabler's soft square (`-square`, 1.5 stroke, 24px), the square Amsterdam photo (`resources/images/homepage.png`, uncropped, exactly as wide as the third card), then three work cards. Each card is a `div` whose title link stretches over it (`::after`). A card with a paper (EV smart charging, surveydown) is a `.masthead-pair`: the card, whole with its four round corners, in front of a drawer of the same width (`.masthead-pub`, one DOI link over its whole area, venue and year centered in italic on one line, shrinking with container units). The drawer's top is tucked behind the card by one corner radius, so its sides continue the card's and its fill shows in the card's lower curves. Card and drawer each have their own hover and press (the card's edge takes the accent; the drawer's whole area fills with the accent's tint, its edge unchanged), and all three cards share one row height. Below 992px the three cards stack. surveydown and Emaki show their logos top right (`resources/images/logo-surveydown.png`, `logo-emaki.png`, 128px copies of the package hex and the app icon). Below 768px it is one column, led by the photo at the cards' width (up to 480px). Profile and document icons come from the `$glyphs` map in `styles.scss` (Tabler outline icons on its 24 grid and 2px stroke; the five profile marks come as a balanced set for the navbar and its phone menu, and in soft squares for the homepage, with in, iD and RG drawn to match since Tabler lacks them), used as `<span class="glyph glyph-NAME">` masks. The navbar tools use the same map, matched by link host. At 992px and wider the five profiles are segments of one capsule (the tile's fill and hairline drawn across the five links, ends rounded on the first and fifth) holding their marks (20px: in, iD and RG drawn on one cap height, Tabler's GitHub cat with its tail and school scaled to it, all at a 1.75 stroke). Below 992px the five links are hidden and a sixth tool, a `Profiles` menu in `_quarto.yml` with the same five links, shows instead as one tile; keep the two lists in sync. The theme toggle, search and profiles tile are bordered 30px tiles (`@mixin frame-tile`) that match the hamburger button. Do not use an SVG `<mask>` (or any `url(#id)`) inside a glyph: Quarto treats any `url()` in the stylesheet, even inside a data URI, as a file to copy, and the render fails. 
- **`about.qmd`**, **`blog.qmd`**, **`research.qmd`**, **`works.qmd`** — top-level pages
- **`cv.qmd`** / **`resume.qmd`** — rendered as PDF using `format: typst`
- **`recipes.qmd`** — personal recipe collection (Chinese). Grid listing reads from `recipes/`. Linked from the navbar 杂记 menu.
- **`cocktails.qmd`** — personal cocktail collection (Chinese). Grid listing reads from `cocktails/`. Linked from the navbar 杂记 menu.

### Reusable Chunks (`resources/chunks/`)
Partial `.qmd` files included via `{{< include /resources/chunks/filename.qmd >}}`:
- `intro.qmd`, `skills.qmd` — used in `about.qmd`
- `2025-plosone-surveydown.qmd`, `2025-erl-smart-charging.qmd`, etc. — paper citation blocks included by research pages (e.g. `research/2024-sc-adoption/index.qmd`). Note: the standalone Papers page was merged into the Works page, `works.qmd` (papers now live as `paper`-type rows in `works/works.csv`), but these chunks are retained because research pages still include them.

### Content Collections
- **`blog/`** — individual blog posts, each in their own subdirectory with an `index.qmd`. Listing auto-generated by `blog.qmd`.
- **`research/`** — research pages, same pattern. Listing auto-generated by `research.qmd` as a grid; `styles.scss` keeps each three-column card at least 280px wide, so a narrowing window drops to two columns, then one, rather than squeezing three.
- **`recipes/`** — individual recipe pages (Chinese), one subdirectory per recipe with an `index.qmd`. Listing auto-generated by `recipes.qmd` as a grid. Banner images live in `recipes/banners/`. All recipe **content** should be written in Chinese, but all **filenames** (recipe subdirectory names, `.qmd` filenames if any, and banner image filenames) must be in **English only** — no pinyin, no Chinese characters. Example: `recipes/tomato-beef-brisket/index.qmd` with banner `recipes/banners/tomato-beef-brisket.png`.
- **`cocktails/`** — individual cocktail pages (Chinese), one subdirectory per cocktail with an `index.qmd`, structurally identical to recipes. Listing auto-generated by `cocktails.qmd` as a grid. Banner images live in `cocktails/banners/`; reusable ingredient icons in `cocktails/resources/{base,mixer,garnish}/`; the five glass paradigm source images in `cocktails/example-banners/`. Cocktail pages reuse the recipe component CSS (`.recipe-*`, `.ing-*`, `.timeline-*`, `.step-*`, `.pairing-*`) — no separate SCSS. Use the **`/ph-cocktail`** skill to scaffold a new cocktail (the drink-world twin of `/ph-recipe`). Same English-filename / Chinese-content rule as recipes. Example: `cocktails/mojito/index.qmd` with banner `cocktails/banners/mojito.png`.
  - **`cocktails/pantry/index.qmd`** (原料图鉴) is a special **non-drink** reference page that catalogs every ingredient icon (基酒 / 调味 / 装饰) from `cocktails/resources/`. It follows the same thin-index + `html/` include pattern as a cocktail page (`html/{base,mixer,garnish}.qmd`, plus `html/_metadata.yml` with `draft: true`), but the three `.ing-outer` sections are wrapped in a centered `.pantry-page` div (the wrapper opens in the index's first `{=html}` block and closes in the last, with the includes between). It is surfaced on `cocktails.qmd` as a hero feature banner (`.pantry-hero`, art at `cocktails/banners/pantry-hero.png`) **above** the grid — not as a grid card — and is kept out of the grid listing by a negation glob: `listing.contents: [cocktails, "!cocktails/pantry/index.qmd"]`. The banner markup itself lives in `resources/chunks/cocktails-pantry-hero.qmd` and is pulled into `cocktails.qmd` via `{{< include /resources/chunks/cocktails-pantry-hero.qmd >}}`.
- **`works/works.csv`** — data-driven works listing (formerly Publications). `works.qmd` reads this CSV with R (`tidyverse`, `htmltools`, `commonmark`) and generates HTML cards grouped into Storybooks, Workshops, Papers, Slides, and Posters sections (a sticky right-hand "Categories" box acts as a TOC-style locator with scroll-spy). The locator's active highlight is a JS-driven "glider" pill (`.pres-filter-glider`, built in `styles.js`) that chases the active button's live geometry each frame — vertical in the desktop sidebar, horizontal in the mobile sticky bar. On mobile (≤1080px) the bar is `[name slot | 5 static icon pills]`: icons never move, and the active section's name lives in a fixed-width slot (`.pres-filter-current`, width = longest label in `ch`, exact because Maple Mono is monospace) that rolls vertically ticker-style on section change. Both the glider and the name slot are injected by `styles.js`, carry the section's `pres-*` accent variant class for color morphing, and respect `prefers-reduced-motion`. Adding an entry = adding a row to the CSV. Columns: `Date`, `Title`, `Event` (supports markdown links), `Location`, `Name`, `Type`, `Btn1Label`/`Btn2Label`/`Btn3Label` (button text, editable per row), and paper-only `Doc1Label`, `Doc1URL`, `Doc2Label`, `Doc2URL`. `Type` must be `"storybook"`, `"workshop"`, `"paper"`, `"slide"`, or `"poster"` — slides get three buttons (labels from `Btn1–3Label`, typically Slides/PDF/GitHub) linking to `https://pingfan-hu.github.io/{Name}/` and `/works/{Name}.pdf`; workshops and storybooks get two buttons (`Btn1–2Label`, site URL + GitHub); posters get one button (`Btn1Label`, PDF path); papers ignore the `Btn*` columns and build buttons from the `Doc*` columns (icon inferred from label) with the venue as a markdown link in `Event`. Button URLs stay derived from `Name` by type; only the labels are CSV-driven (blank label cells fall back to the defaults in `works.qmd`). Storybook dates render month-only ("July, 2026"); papers render year-only ("2025"). Each section has a soft accent color (violet/teal/rose/blue/amber). Section styling classes remain `.pres-*` / `.presentation-*` in `styles.scss`.

### Icons
The site has no Quarto extensions and does not use FontAwesome; do not add it back. Every icon is a glyph in the `$glyphs` map in `styles.scss` (Tabler outline icons, or drawn to match where Tabler lacks one), shown as `<span class="glyph glyph-NAME">`. The R logo is `{{< var rlink >}}` / `{{< var rnolink >}}`, which `_variables.yml` defines as the `glyph-r` span. The navbar's own links still use Bootstrap Icons (`icon:` in `_quarto.yml`), which Quarto ships.

## Standards and Rules

All component design standards live in `.claude/rules/`. Always consult the relevant rule before creating or modifying a styled HTML component or image:

| Rule file | Covers |
|-----------|--------|
| `html-table-description.md` | 2-column label → value tables with icons, mobile stacking |
| `html-table-icon.md` | Icon card grid with centered header and optional section bars |
| `html-button-table.md` | Label + pill button rows (`.lnk-*` classes) |
| `html-button-intro.md` | Centered intro pill buttons (`.intro-links` / `.intro-btn`) |
| `html-url.md` | URL anatomy diagrams with overflow detection |
| `image-banner.md` | Blog/project banner generation via claude-image-gen |
| `image-nav.md` | Section nav card images |
| `image-embedding.md` | Embedding images in blog posts (bordered, captioned) |

## Key Conventions

- **Research pages**: Each research lives in `research/{year}-{slug}/index.qmd`. Front matter includes `title`, `image`, `author`, `date`, `categories`, and `description`.
- **Blog posts**: Same pattern in `blog/{date}-{slug}/index.qmd`. `_metadata.yml` in `blog/` sets `author: "Pingfan Hu"` globally for all posts.
- **Banners**: Research/blog banner images live in `research/banners/` and `blog/banners/` (referenced in listing configs).
- **External links**: `link-external-newwindow: true` is global; internal links are filtered by `pingfan.org` domain.
- **`{{< include >}}`** paths are always absolute from project root (e.g., `/resources/chunks/intro.qmd`).
- **Intro buttons** (2–4 project links at the top of a post): write HTML directly in the `.qmd` using `.intro-links` / `.intro-btn` classes — CSS is global in `styles.scss`, no `<style>` block needed. See `.claude/rules/html-button-intro.md`.
- **Link tables** (label + multiple buttons): use `.lnk-outer` / `.lnk-row` / `.lnk-btn` with color variants `lnk-purple` (the accent, kept under its old name), `lnk-blue`, `lnk-green`, `lnk-orange`. CSS is global in `styles.scss`. See `.claude/rules/html-button-table.md`.
- **Styled HTML components in blog posts**: Use `{{< include resources/filename.qmd >}}` to embed styled HTML tables or visuals. The included file must be a `.qmd` (not `.html`) with content wrapped in a ```` ```{=html} ```` fence. Store these files in a `resources/` subdirectory within the post folder. Do NOT use iframes. See `.claude/rules/html-table-description.md` or `.claude/rules/html-table-icon.md` for the full design standards.
- **Styled HTML components in recipe and cocktail pages**: Same pattern as blog posts, but the subdirectory is named `html/` instead of `resources/` (semantically clearer for recipe/cocktail-specific HTML blocks). Example: `recipes/tomato-beef-brisket/html/ingredients.qmd` is included via `{{< include html/ingredients.qmd >}}`. The `html/` folder needs its own `_metadata.yml` with `draft: true` (same as `resources/`), and the project-level `_quarto.yml` excludes both `**/resources/*.qmd` and `**/html/*.qmd` from rendering.
- **Banner image generation**: Always use the claude-image-gen CLI to generate banner images. Never use Pillow or HTML/CSS rendering. See `.claude/rules/image-banner.md` for the full workflow, prompt template, and style standard. **Never write the Gemini API key as a literal value anywhere** — it lives in `~/.zshrc` as `$NANOBANANA_GEMINI_API_KEY`.
- **`resources/` and `html/` subdirectories**: Every such folder inside a post or recipe must contain a `_metadata.yml` with `draft: true` to prevent Quarto's listing from picking up the component `.qmd` files. (The project-level `_quarto.yml` also globally excludes `**/resources/*.qmd` and `**/html/*.qmd` from rendering as a second guard.)
- **`research/_metadata.yml`**: Hides the title metadata block for all research pages via injected CSS.
- **Blog post citations**: Posts can include a `references.bib` file in the post folder for Quarto-rendered citations.
- **Design tokens**: every colour in `resources/styles/styles.scss` is a CSS custom property declared once at the top of the sheet (`:root` for light, `body.quarto-dark` for dark): `--page`, `--ink`, `--muted`, `--panel`, `--panel-2`, `--border`, `--border-2`, `--frame` (navbar + footer, "dusk": a deep periwinkle in the accent's hue, `#3E4D93` light and `#273264` dark, with the name in `--accent-on-frame`), `--accent` (periwinkle, the blue emaki.lol uses, used only for what can be clicked; every supporting shade is drawn from it), `--wash` / `--wash-edge` (the accent as a plate), `--pop-bg` / `--shadow-float` (popovers only), and `--ease` (the one easing; 160ms hover, 240ms appear, 400ms page fade). The faces are tokens too: `--font-words` (TsangerJinKai), `--font-ui` (Maple Mono, for every label, chip, button, TOC entry), `--font-mono`, `--font-wordmark` (Optima, the name in the navbar, footer and homepage). New CSS must use tokens; a hex value outside the token block and the code window's own inverted palette is a mistake. The works sections' per-section accents (`--pa*`) and the recipe tip/warn tints are the deliberate exceptions.
- **No eyebrow lines**: do not put an uppercase, letter-spaced label line above a heading (e.g. `ROLE · PLACE` over the name). Pingfan finds it AI-generic. State such facts in sentence case, in the body or a facts list.
- **Card & button interactions** (kept consistent site-wide): every listing card (`.quarto-grid-item`, `.quarto-post`), the featured ribbon and the cocktails pantry hero share one hover/press language — the border brightens to the accent on `:hover` (**no lift, no glow, no shadow at rest or on hover**) and a subtle `transform: scale(0.992)` press on `:active`. Every HTML-generated button is a pill from the `@mixin pill` in `styles.scss` (`.intro-btn`, `.lnk-btn`, `.subpage-back-btn`, `.post-nav-btn`, paper `.btn-outline-primary`): a hairline in `--border-2`, the chrome face, quiet at rest; on hover the edge and the word take the accent on the accent's wash; `scale(0.96)` on `:active`. The only shadow on the site is `--shadow-float`, on things that float (the navbar dropdown, the recipe timer jump button). When adding a card or button, match this.
- **Theme**: light is `flatly`, dark is `darkly`; `respect-user-color-scheme: true` makes the appearance follow the system until the navbar toggle (Tabler's moon/sun inlined as an SVG mask in a bordered tile like the hamburger, styled under `.quarto-navbar-tools`) pins one. Both load `resources/styles/styles.scss`, and dark also loads `resources/styles/dark.scss` after it, which only sets the dark Bootstrap `$body-bg` / `$body-color` / `$primary` / `$link-color` defaults (Quarto gives a later sheet's `!default`s priority). Dark-mode styling lives in the token block, not in per-component overrides; the short `// ---- Dark Mode ----` section at the end holds only what differs by meaning (callout and tip tints, the works accent sets). Test SCSS changes in both modes.
- **TOC layout**: `_quarto.yml` sets `toc: true` with `toc-location: left` globally. Quarto reserves left-column space for the TOC. Pages that set `toc: false` in their front matter lose this reservation and their content shifts rightward. To keep content centered on no-TOC pages, use custom CSS to adjust the layout rather than simply disabling the TOC.
- **HTML indentation in `.qmd`**: Use 1-space indentation per level in raw HTML blocks. Pandoc treats 4+ leading spaces as a code block, which silently breaks inner `<div>` elements.

## Session Notes

`tasks/lessons.md` captures corrections and patterns from past sessions. Review it when working on areas that have been corrected before.

## Deployment

CI runs on every push to `main` via `.github/workflows/build.yml`. It installs R 4.3.2 with packages `tidyverse`, `kableExtra`, `here`, and `surveydown`, then runs `quarto render` and deploys to Netlify. The `SITE_PASSWORD` secret is passed as an environment variable during render.
