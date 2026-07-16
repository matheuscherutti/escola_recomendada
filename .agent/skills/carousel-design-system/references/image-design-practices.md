# Visual Design & Image Creation — Best Practices (Full Reference)

> Adapted from [renatoasse/opensquad](https://github.com/renatoasse/opensquad) (MIT), its
> `_opensquad/core/best-practices/image-design.md`. Imported 2026-07-04. Read the relevant
> section on demand — the entry point is `../SKILL.md`.

## Core Principles

1. **Design system before individual pieces.** Before creating any visual, define: primary
   and secondary colors, font family and scale, spacing unit, border radius, shadow style,
   and grid structure. Every element draws from this system — no ad-hoc styling.

2. **Platform-aware viewport and typography.** Respect minimum font sizes:

   | Platform / Format | Hero | Heading | Body | Caption |
   |---|---|---|---|---|
   | Instagram Post/Carousel | 58px | 43px | 34px | 24px |
   | Instagram Story/Reel | 56px | 42px | 32px | 20px |
   | LinkedIn Post | 40px+ | — | 24px+ | 20px+ |

   Absolute minimum for any readable text on any platform: **20px**. Never include slide
   counters ("7/8", "1/7") — the platform's native UI already shows position. Font weight
   for body text and above: 500 or higher.

3. **Visual hierarchy through contrast and scale.** Clear reading order: hero → supporting
   → details. Minimum 1.5x font-size ratio between hierarchy levels. Never rely on color
   alone for hierarchy.

4. **Self-contained HTML is non-negotiable.** Inline CSS only, no external stylesheets, no
   JS, no external font files (Google Fonts `@import` is the only allowed external
   resource). Images as absolute paths or base64. Body sets exact pixel dimensions with
   `margin: 0; padding: 0; overflow: hidden`.

5. **Accessibility and contrast.** WCAG AA minimum 4.5:1 for all text against its
   background. Never place text directly on a complex image without a solid or gradient
   overlay.

6. **Batch consistency for multi-slide content.** One HTML file per slide, same design
   system across all. Zero-padded filenames (`slide-01.html`). First slide = hook/cover;
   last slide = CTA.

7. **CSS Grid and Flexbox for layout.** Never absolute positioning for primary content
   (reserve it for decorative overlays only) — Grid/Flexbox render consistently across
   headless-browser engines.

8. **Brand alignment from context.** Read brand colors/fonts/tone before designing. If no
   brand guidance exists, ask — never default to generic corporate blue/white.

9. **Verify before batch.** Render and visually inspect slide 1 before generating the rest
   of a multi-slide set.

## Design Methodology

1. **Load context and brief** — company/brand context, upstream copy, target platform,
   format (single/carousel/story), text content to visualize.
2. **Confirm design direction** — platform + viewport, mood, colors, slide count. Ask if
   ambiguous.
3. **Define the design system** — colors (hex), typography (family + hero/heading/
   body/caption scale + weight), spacing (base unit + multiples), grid, visual elements
   (radius, shadows, patterns).
4. **Create the HTML/CSS** — one self-contained file per slide/image, following the system
   strictly, semantic class names, exact viewport dimensions.
5. **Render and verify** (via `visual-renderer`) — check text readability, color accuracy,
   no clipping, balanced layout.
6. **Iterate if needed** — fix HTML, re-render. Do not proceed to the next slide until the
   current one passes.
7. **Batch render remaining slides** using the verified design system.
8. **Deliver** all rendered images plus the design system documentation, so the visual
   identity is reusable in future content.

## Platform Specifications

### Instagram Post / Carousel
- Viewport: 1080 x 1440 (3:4)
- Min fonts: Hero 58px, Heading 43px, Body 34px, Caption 24px
- Optimal slide count: 5-10 (under 5 feels incomplete, over 10 causes drop-off)
- Structure: hook on slide 1, CTA on last, value in between. No slide counters.

### Instagram Story / Reel
- Viewport: 1080 x 1920 (9:16)
- Min fonts: Hero 56px, Heading 42px, Body 32px, Caption 20px

### LinkedIn Post
- Viewport: 1200 x 627 (1.91:1)
- Min fonts: Hero 40px+, Body 24px+, Caption 20px+

### General
- Absolute minimum: 20px for any readable text, any platform.
- Font weight floor: 500+ for body text and above.

## Decision Criteria

- **Font family:** sans-serif for social (Inter, Montserrat, Open Sans, Poppins); serif
  only for editorial/luxury; monospace only for technical content.
- **Color palette size:** 3-5 colors max (primary, secondary, accent, background, text).
- **Slide count:** 5-10 for Instagram carousels.
- **Gradients:** for background overlays, hero sections, CTAs — never body-text
  backgrounds. Linear only (radial renders inconsistently in headless browsers).
- **Images vs. solid colors:** solid for text-heavy slides (readability); images for
  cover/mood slides where the visual carries the message.

## Quality Checklist

- [ ] Design system documented before any slide is built
- [ ] All HTML self-contained (inline CSS, only Google Fonts external)
- [ ] All text meets platform minimum font sizes
- [ ] All text meets WCAG AA 4.5:1 contrast
- [ ] Body dimensions match target viewport exactly
- [ ] Grid/Flexbox used for layout, no absolute positioning for primary structure
- [ ] Multi-slide content shares one consistent design system
- [ ] Slide 1 rendered and verified before batch
- [ ] No placeholder text (Lorem ipsum, "Text here")
- [ ] Design rationale documented alongside the output

## Anti-Patterns — Never Do

1. External dependencies in HTML (CDN CSS frameworks, external JS, externally hosted
   images) — only Google Fonts `@import` is allowed.
2. Design without a system defined first — leads to drift across slides.
3. Font sizes below platform minimums — 20px is the absolute floor, not a suggestion.
4. Absolute positioning for primary layout — fragile against content-length variation.
5. Skipping rendering verification — browser fallback fonts/spacing can differ from the
   HTML's apparent intent.
6. Text on images without contrast protection (60%+ opacity overlay, gradient, or
   backdrop blur) — fails 4.5:1 contrast.
7. More than 5 colors in one design system.
8. Slide-number counters ("7/8") in carousel images — redundant with native platform UI.

## Always Do

1. Document the design system before any HTML.
2. Verify slide 1 before batch-rendering the rest.
3. Document design rationale (color/font/layout choices) alongside the output.
4. Match viewport exactly: body `width`/`height` in CSS = the render script's `--width`/
   `--height`.

## Worked Examples

### Example: Instagram Carousel Design System + Slide 1

```
DESIGN SYSTEM
Platform: Instagram Carousel · Viewport: 1080 x 1440 · Slides: 7 (hook + 5 + CTA)

Colors:
  Primary:   #1A1A2E (deep navy, background)
  Secondary: #E94560 (coral, accent/CTAs)
  Text:      #FFFFFF
  Muted:     #A0A0B8 (captions)
  Highlight: #FFD93D (emphasis)

Typography: 'Inter', sans-serif (Google Fonts @import)
  Hero 67px/700 (slide 1 only) · Heading 48px/700 · Body 34px/500 · Caption 24px/500

Spacing: base 24px · content margin 72px (3x) · section gap 48px (2x)
Grid: single column, centered, max content width 936px
Visual elements: border-radius 16px; CTA button coral bg/white text/16px radius
```

```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1440px; overflow: hidden; background: #1A1A2E;
    font-family: 'Inter', sans-serif; display: flex; flex-direction: column;
    justify-content: center; align-items: center; padding: 72px; }
  .hook { font-size: 67px; font-weight: 700; color: #FFFFFF; text-align: center;
    line-height: 1.25; max-width: 936px; }
  .hook .accent { color: #E94560; }
  .subtitle { font-size: 34px; font-weight: 500; color: #A0A0B8; text-align: center;
    margin-top: 32px; max-width: 800px; line-height: 1.5; }
  .swipe-cta { position: absolute; bottom: 48px; right: 72px; font-size: 24px;
    font-weight: 500; color: #A0A0B8; display: flex; align-items: center; gap: 8px; }
</style></head>
<body>
  <h1 class="hook">You are doing <span class="accent">100 things</span> to grow.<br>
    And ignoring the <span class="accent">ONE</span> that works.</h1>
  <p class="subtitle">Swipe to learn the strategy that grew 3 accounts from 0 to 50K in 90 days.</p>
  <span class="swipe-cta">Swipe →</span>
</body></html>
```

Rationale: navy/white gives 15.3:1 contrast; coral accent draws the eye to key numbers;
67px hero for mobile impact; 34px subtitle stays secondary; muted swipe CTA stays visible
without competing.
