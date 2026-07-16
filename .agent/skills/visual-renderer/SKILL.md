---
name: visual-renderer
description: "Use when you need to turn HTML/CSS into a production-ready image — social media graphics, carousel slides, infographics, quote cards, any visual defined by a template. Triggers: 'render this as an image', 'export this slide as PNG', 'gera a imagem do slide', 'renderiza esse carrossel'. Generic engine: the HTML IS the design, this skill only converts it to pixels via a deterministic Playwright script (Script-First — no browser tool choreography needed). Pair with `carousel-design-system` for the design rules and `ai-image-generator` for AI-generated (non-HTML) imagery."
allowed-tools: Read, Write, Edit, Bash, PowerShell
---

# Visual Renderer

Converts a self-contained HTML/CSS file into a pixel-perfect PNG at an exact viewport.
This is the deterministic half of visual content production — the design decisions
(colors, typography, layout) belong to `carousel-design-system`; this skill only renders.

## When to use

Any time an agent (or a squad step) has produced complete HTML/CSS for a slide, post,
banner, or card and needs it as an image file. Also the rendering step inside
`carousel-design-system`'s workflow when previewing template options to the user.

## How it works

`scripts/render.py` is a single deterministic script (Script-First Protocol — this task
has one correct output for a given input, so it is a script, not agent judgment): it
launches a headless Chromium via the `playwright` Python package, opens the HTML file
directly (`file://`), sets the viewport, and screenshots it. No local HTTP server, no
manual browser-tool navigation — one command, one file out.

### Setup (once per machine)

```bash
pip install playwright && python -m playwright install chromium
```

### Usage

```bash
python .agent/skills/visual-renderer/scripts/render.py \
  --html "path/to/slide-01.html" \
  --output "path/to/slide-01.png" \
  --width 1080 --height 1440
```

Batch mode (render every `*.html` in a folder to sibling `.png` files, same viewport):

```bash
python .agent/skills/visual-renderer/scripts/render.py \
  --html-dir "squads/<name>/output/slides" \
  --output-dir "squads/<name>/output/slides" \
  --width 1080 --height 1440
```

### Viewport presets (width x height)

| Format | Dimensions |
|---|---|
| Instagram Post | 1080 x 1080 |
| Instagram Carousel | 1080 x 1440 |
| Instagram Story/Reel | 1080 x 1920 |
| Facebook Post | 1200 x 630 |
| Twitter/X Post | 1200 x 675 |
| LinkedIn Post | 1200 x 627 |
| YouTube Thumbnail | 1280 x 720 |

## Rules

- **The HTML must be self-contained** (inline CSS, no external stylesheets/JS, only Google
  Fonts `@import` allowed) — see `carousel-design-system` for the full constraint list.
  A non-self-contained file will render inconsistently or fail silently on fonts/images.
- **Verify the first render before batching.** Read the output PNG back before rendering
  the rest of a multi-slide set — catches font fallback, clipping, or color drift early.
- **One render per HTML file.** If a design needs iteration, edit the HTML and re-render;
  do not try to patch the PNG.
