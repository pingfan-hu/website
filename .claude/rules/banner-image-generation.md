# Blog Banner Image Generation Standard

When generating a banner image for a blog post, always use the **nano-banana skill** (Gemini CLI). Never use Pillow, HTML/CSS+puppeteer, or any other method.

## API Key Safety

**NEVER** write, echo, export, or reference the Gemini API key as a literal value in any command, file, or permission entry. The key lives exclusively in `~/.zshrc` and is available as `$GEMINI_API_KEY` at shell startup. If the key is not set, tell the user to run `source ~/.zshrc` — do not attempt to set it inline.

## Workflow

1. **Invoke the skill** via `Skill tool → nano-banana`
2. **Run the generation command** from the target directory:
   ```bash
   export GEMINI_API_KEY="$NANOBANANA_GEMINI_API_KEY"
   cd /Users/pingfan/Documents/GitHub/website/blog/banners
   gemini --yolo "/generate '...prompt...'"
   ```
3. **Find the output** in `./nanobanana-output/` and preview it with the Read tool
4. **Convert and copy to final path** once approved — nanobanana outputs JPEGs with a `.png` extension, which Quarto rejects. Always re-encode as a real PNG:
   ```python
   from PIL import Image
   img = Image.open('blog/banners/nanobanana-output/<generated-file>.png')
   img.save('blog/banners/<date-slug>.png', format='PNG')
   ```

## Output Path Convention

All banner images live at:
```
blog/banners/{YYYY-MM-DD}-{slug}.png
```
This matches the `image:` field in the post's front matter.

## Visual Style Standard

Always include these constraints in the prompt to stay consistent with the site aesthetic:

- **Background**: warm cream/off-white (`#F8F7F0`), never dark
- **Accent color**: muted purple/indigo (`#5654A2`) for cards, lines, badges, icons
- **Illustration style**: clean flat design, minimal depth — NOT sci-fi, NOT neon, NOT 3D render
- **Icon style**: simple line icons (Lucide-style)
- **No busy backgrounds**: no gradients, no grids unless very subtle
- **Text in image**: include the post title split as a small label + large bold main title + small `Part N` pill if applicable

## Prompt Template

```
Blog banner image for a post titled '[FULL TITLE]'. Clean modern flat illustration style.
Warm cream off-white background (#F8F7F0). [VISUAL CONCEPT — one sentence describing the scene].
Muted purple (#5654A2) as the dominant accent color. Text overlaid: small label '[SUBTITLE]'
above large bold '[MAIN TITLE]' [and a small purple pill badge saying 'Part N' if applicable].
Minimal, academic, professional tech blog aesthetic. Flat design, subtle depth,
no dark backgrounds, no neon, no sci-fi.
```

## Reference

- Approved example: `blog/banners/2026-03-26-agentic-engineering-1.png`
  - Concept: person at desk conducting floating AI agent cards (file, code, terminal, search) connected by lines
  - Style: flat illustration, cream bg, purple accent, conductor metaphor for agentic orchestration
