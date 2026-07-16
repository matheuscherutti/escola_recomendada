---
name: ai-image-generator
description: "Use when a visual asset needs to be generated from a text prompt — a photo-style hero image, an illustration, a mascot variant — and no suitable image already exists (check assets/stock first). Triggers: 'gera uma imagem de', 'generate an image of', 'crie uma ilustração para o post'. Calls an AI image-generation API via a deterministic script (test mode for cheap iteration, production mode for final output), supports reference images for brand consistency. Does NOT create HTML-based designs (use `carousel-design-system` + `visual-renderer` for text/layout-heavy slides — image models render text poorly)."
allowed-tools: Read, Write, Bash
---

# AI Image Generator

Generates visual assets from text prompts via an AI image model, called through a
deterministic script (Script-First — one prompt in, one image out, no judgment needed in
the call itself). Adapted from [renatoasse/opensquad](https://github.com/renatoasse/opensquad)
(MIT).

## Before generating — think twice

Image generation costs money and time. In order:
1. Check if a suitable image already exists in the project's/squad's assets folder.
2. Check if a free/open stock image or web search result works (see `content-research`).
3. Confirm the image is actually necessary for content quality.
4. Only generate when no existing alternative is good enough.
5. **Generate exactly what you need** — one image validates a concept, not three or five.

## Provider

Uses [OpenRouter](https://openrouter.ai) as the model gateway (one API key, many image
models) — the same choice opensquad made, since it avoids locking the skill to one AI
vendor. Requires `OPENROUTER_API_KEY` in the environment or a local `.env` file.

## Modes

| Mode | Model | Cost (approx.) | When |
|---|---|---|---|
| `test` (default) | `sourceful/riverflow-v2-fast` | very low | Iterating on composition/layout — not for final output |
| `production` | `google/gemini-3.1-flash-image-preview` | higher | Only after the user approved the concept in test mode |

**Always generate in `test` mode first.** Switch to `production` only for the approved
final deliverable.

## Usage

Single image:
```bash
python .agent/skills/ai-image-generator/scripts/generate_image.py \
  --prompt "A detailed description of the image" \
  --output "squads/<name>/output/assets/hero.jpg" \
  --mode test
```

With a reference image (logo, mascot, brand asset) for brand-consistent generation:
```bash
python .agent/skills/ai-image-generator/scripts/generate_image.py \
  --prompt "A banner featuring the logo prominently, centered" \
  --output "squads/<name>/output/assets/banner.jpg" \
  --reference "squads/<name>/assets/logo.png" \
  --mode production
```
Supported reference formats: PNG, JPEG, WEBP.

Batch (JSON array of `{"prompt", "output", "reference"(optional)}` objects):
```bash
python .agent/skills/ai-image-generator/scripts/generate_image.py \
  --batch "squads/<name>/output/assets/batch.json" --mode production
```

## Prompt guidelines

- Be specific about composition, lighting, style, mood.
- State aspect ratio/orientation when it matters ("portrait 3:4", "landscape 16:9").
- Include "hyper realistic, 4K quality" for photographic style.
- Avoid asking the model to render text — image models handle text poorly; use
  `carousel-design-system` + `visual-renderer` (HTML) for anything with words on it.

## Error handling

- Missing `OPENROUTER_API_KEY` → the script exits with a clear message; set it in `.env`.
- API error → script prints the error code/body and exits non-zero — surface this to the
  user rather than retrying silently.
- Batch mode reports a success/failure count per item; a partial batch is not "done".
