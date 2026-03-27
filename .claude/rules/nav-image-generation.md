# Nav Card Image Generation Standard

Nav card images are used for the 4 main navigation sections of the website (Blog, Papers, Talks, Projects). They follow a similar style to blog banners but with fixed colors and no border.

## Layout

- **Left half**: typographic title — "Pingfan's" in accent purple (#5654A2) at medium size, section name (e.g. "Blog") bold dark near-black below it. No subtitle.
- **Right half**: flat illustration relevant to the section, with subtle scatter dots and small geometric shapes for depth
- Generous padding, nothing crowded
- **Absolutely no border, no frame, no outline, no stroke, no rounded rectangle, no 3D effect** — the background color extends fully to all edges of the image

## Typography

- **"Pingfan's"**: accent purple (#5654A2), medium size, bold sans-serif
- **Section name**: bold, dark near-black, bold sans-serif — moderate size, NOT excessively large. The text block should occupy roughly the top half of the left area, leaving breathing room above and below. Similar scale to the "How to Do Research" or "Pull Repos" blog banners.
- No subtitle or secondary label

## Color Assignments (fixed per section)

| Section | Background |
|---------|-----------|
| Blog | `#E3F0FC` (light blue) |
| Papers | `#FDF5E0` (light yellow) |
| Talks | `#FEF0E3` (light orange) |
| Projects | `#E0F5F0` (light mint) |

## Illustration per Section

- **Blog**: pen writing on an open document/book
- **Papers**: stacked academic papers with magnifying glass
- **Talks**: microphone with floating speech bubbles and presentation slide cards
- **Projects**: interlocking building blocks being assembled

## Prompt Template

```
Navigation card image for a personal academic website section. Solid [COLOR] background that fills the entire image edge to edge — absolutely no border, no frame, no outline, no stroke, no rounded rectangle around the image.
Right side: flat illustration of [ILLUSTRATION], with subtle scatter dots and small geometric shapes for depth.
Left side: 'Pingfan's' in accent purple (#5654A2) medium bold sans-serif above, '[SECTION]' in bold dark near-black at a moderate font size — not too large, with comfortable breathing room above and below the text block. No subtitle.
Generous padding. Muted purple (#5654A2) accent color throughout. Clean minimal flat design, academic aesthetic, no dark background, no neon, no sci-fi.
```

## Workflow

Use the claude-image-gen CLI, preview, convert JPG to PNG, save to `images/card-{section}.png`, delete temp JPG.
