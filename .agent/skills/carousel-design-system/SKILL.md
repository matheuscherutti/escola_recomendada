---
name: carousel-design-system
description: "Use when designing visual content — Instagram carousels, social posts, LinkedIn banners, infographics, quote cards — as HTML/CSS templates for rendering. Triggers: 'design a carousel', 'cria o carrossel', 'monta os slides', 'design system para posts'. Covers design-system-first methodology, platform viewport/typography specs (Instagram, LinkedIn, Stories), WCAG contrast rules, and anti-patterns. NOT for copywriting, research, or publishing — pair with `visual-renderer` (HTML→PNG), `ai-image-generator` (AI imagery), and `humanizer` (the copy that goes ON the slides)."
allowed-tools: Read, Write, Edit, Bash
---

# Carousel Design System

Design methodology for turning approved copy into on-brand, platform-correct visual
content, expressed as self-contained HTML/CSS templates. Adapted from
[renatoasse/opensquad](https://github.com/renatoasse/opensquad) (MIT).

**Full reference (platform specs, worked examples, anti-patterns):**
`references/image-design-practices.md` — read sections on demand, not the whole file.

## When to use

A squad step or agent needs to produce the VISUAL design for social/marketing content —
before any image exists. This skill decides colors, typography, layout, and viewport; it
does not render (`visual-renderer`) or write the words (the copy comes from the squad's
copywriting step, then gets run through `humanizer` before it lands on a slide).

## Workflow

1. **Load context** — brand colors/fonts if known, target platform, format (single
   image/carousel/story), the approved copy to visualize.
2. **Confirm direction** — platform+viewport, visual mood, color preference, slide count.
   Ask if the brief doesn't specify (Socratic Gate — this is a business/taste decision).
3. **Define the design system FIRST**, before any slide: colors (3-5 max, hex values),
   typography (family + hero/heading/body/caption sizes, see platform table in the
   reference), spacing (base unit), grid, visual elements. Write this down — it is also
   part of the deliverable, not just a working note.
4. **Write self-contained HTML** — one file per slide, following the system. Exact
   viewport dimensions (`body { width; height; }`, no `auto`). See the reference's HARD
   RULES for the non-negotiable constraint list (inline CSS only, WCAG 4.5:1, no slide
   counters, Grid/Flexbox only).
5. **Render slide 1 first** via `visual-renderer`, inspect it, THEN batch the rest.
6. **Deliver** the rendered images plus the design-system documentation (reusable for the
   next piece of content from the same client/brand).

## Hard constraints (non-negotiable — see reference for full rationale)

- Minimum font sizes: Instagram carousel hero 58px / body 34px / caption 24px; LinkedIn
  hero 40px+ / body 24px+. Absolute floor anywhere: 20px.
- Self-contained HTML: inline CSS, only Google Fonts `@import` as external resource.
- WCAG AA 4.5:1 contrast minimum for all text.
- CSS Grid/Flexbox for structural layout — no absolute positioning for primary content.
- No slide-number counters in carousel images (native platform UI already shows this).
- Max 5 colors per design system.

## Where this plugs into the kit

- **Squads:** a content-production squad's "Design" step loads this skill (+
  `visual-renderer` + `ai-image-generator` if AI imagery is needed), with a checkpoint
  after the first rendered slide (design approval), per the Matriz de Decisão.
- **Copy on slides:** always run copy through `humanizer` BEFORE it goes into the HTML —
  AI-sounding hooks/CTAs are as visible on a slide as in a paragraph.
