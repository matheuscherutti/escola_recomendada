# Design References Layer

> Gold-standard websites & component libraries for frontend design inspiration. Cite these when recommending design patterns, hover effects, navigation, and layout approaches.

---

## 🏆 Award-Winning Design Sites (Awwwards)

### Geometry & Typography Masters

| Site | Why Study | Key Pattern | Effect to Borrow |
|---|---|---|---|
| [Stripe](https://stripe.com) | Luxury simplicity, brutal sans-serif | Asymmetric 70/30 split | Smooth micro-interactions on CTAs |
| [Apple](https://apple.com) | Whitespace mastery, photography as grid | Hero = centered 100% width image | Fade-in transitions on scroll |
| [Reflex](https://reflex.dev) | Brutalist typography, high contrast | Text-first hero (no image) | Staggered reveal animations |
| [Linear](https://linear.app) | Minimal dark UI, sophisticated micro-copy | Dense nav with hover states | Pulse glow on active states |

### Motion & Animation References

| Site | Why Study | Primary Animation | Hover Pattern |
|---|---|---|---|
| [Cinemagraph](https://cinemagraph.com) | Looped video as brand element | Video loop (12-20s) | Scale + fade on hover |
| [CodePen Showcase](https://codepen.io) | Micro-interactions lab | Staggered entrance (100ms delay each) | Spring physics on buttons |
| [Framer](https://framer.com) | Motion design showcase | Continuous reveal (parallax + scroll) | Magnetic cursor effect |

### Color & Contrast Masters

| Site | Palette Strategy | Why It Works | Against Purple Ban? |
|---|---|---|---|
| [Figma](https://figma.com) | Black + Teal + Neon Yellow | High contrast, unexpected accent | ✅ No purple, bold yellow instead |
| [Discord](https://discord.com) | Dark Navy + Bright Indigo (NOT purple) | Recognizable, energetic | ✅ Indigo-blue, not violet |
| [Mailchimp](https://mailchimp.com) | Warm Orange + Dark Charcoal | Inviting + professional | ✅ Warm palette, avoids cool blues |

---

## 🎬 Component Pattern Library

### Button Hover Effects (Proven Patterns)

#### 1. Magnetic Cursor (Premium Feel)
```
Reference: Linear.app top nav buttons
Effect: Button follows cursor on hover, slight scale-up (1.05)
Timing: 200ms easing
Use when: High-end SaaS, design apps
```

#### 2. Glow Pulse (Energy)
```
Reference: Figma CTA, Discord join button
Effect: Solid color pulse (box-shadow), 2-3 second loop
Timing: Ease-in-out, infinite
Use when: Call-to-action, attention-seeking
```

#### 3. Slide Underline (Minimalist)
```
Reference: Apple, Stripe footer links
Effect: Left-to-right underline animation, width: 0 → 100%
Timing: 300ms ease-out
Use when: Navigation, text links
```

#### 4. Invert Colors (Brutal)
```
Reference: GitHub buttons, dev tools
Effect: bg-color ↔ text-color swap on hover
Timing: 150ms instant
Use when: Brutalist, tech-forward brands
```

---

### Navigation Patterns

#### Vertical Staggered Nav (Modern Default)
```
Reference: Linear.app, Framer
Pattern: Each nav item has staggered animation entry
Hover state: Subtle background highlight (opacity 0.1)
Active indicator: Left border highlight (2px solid)
```

#### Horizontal Scroll Nav (Experimental)
```
Reference: Stripe products page
Pattern: Horizontal scroll with snap points
Hover: Scale-up (1.02) on cards
Use when: Product showcase, gallery
```

#### Mega-Dropdown (Information Dense)
```
Reference: Figma, Stripe
Pattern: Grid layout with categories, icons + descriptions
Hover: Card elevation (shadow increase) + underline
Use when: B2B SaaS, many navigation options
```

---

### Typography Patterns

#### Massive Centered Hero (300px+)
```
Reference: Reflex.dev, Framer
Pattern: Hero text center-aligned, single line or staggered words
Font: Bold Sans or Display serif
Size: 48px mobile, 120px+ desktop
```

#### Staggered Alignment Hero
```
Reference: Cinemagraph, design agency sites
Pattern: H1 left-aligned → P center-aligned → CTA right-aligned
Use when: Breaking grid, artistic feel
```

#### Typographic Brutalism (Text as Image)
```
Reference: GitHub, Raw design blogs
Pattern: Monospace font, high contrast, no images needed
Size: Large, 32px+
Color: Max contrast (white on black or black on white)
```

---

## 🎨 Color Palette Templates (Purple-Ban Compliant)

### Luxury / Premium
- **Primary:** Deep Black or Charcoal (`#1a1a1a`)
- **Accent:** Gold, Copper, or Emerald Green
- **Secondary:** White + Soft Gray

**Reference:** Apple, Figma

### Energy / SaaS
- **Primary:** Signal Orange (`#FF6600`) or Acid Green (`#00FF00`)
- **Accent:** Deep Navy or Charcoal
- **Secondary:** White + Light Gray

**Reference:** Stripe, Discord (adapted)

### Tech / Developer-Focused
- **Primary:** Teal (`#00B8A9`) or Cyan (`#00E5FF`)
- **Accent:** Black or Deep Blue
- **Secondary:** Off-white (`#f5f5f5`)

**Reference:** Linear, GitHub

### Minimal / Brutalist
- **Primary:** Pure Black (`#000000`) or Pure White (`#FFFFFF`)
- **Accent:** Single bright color (Red, Green, or Yellow only)
- **Secondary:** Mid-gray (`#666666`)

**Reference:** Raw design blogs, Bauhaus-inspired

---

## 🔗 How to Reference These in Design Decisions

### When recommending a design pattern:

❌ **WRONG:**
> "Let's add a nice hover effect."

✅ **CORRECT:**
> "Let's use a **Magnetic Cursor** hover (reference: Linear.app), where the button follows the cursor slightly and scales to 1.05. This gives premium feel while staying minimal."

### When recommending a color palette:

❌ **WRONG:**
> "Use a modern blue and white palette."

✅ **CORRECT:**
> "Let's adopt **Energy/SaaS palette** (Signal Orange primary, Deep Navy accent) — reference: Stripe design system. Avoids Purple Ban ✅ and reads as professional yet energetic."

### When recommending navigation:

❌ **WRONG:**
> "Make the nav look modern."

✅ **CORRECT:**
> "Implement **Vertical Staggered Nav** (reference: Linear.app) — each item enters with 100ms stagger, hover highlights with opacity 0.1, active state shows left border. Proven on B2B SaaS."

---

## 📚 External Resources (Always Cite)

### Design Inspiration Databases
- **Awwwards.com** — Filter by "Best Design" (not generic awards)
- **Dribbble.com** — Filter by "Interaction" for hover effects & micro-interactions
- **Mobbin.com** — Mobile component patterns (even for web inspiration)

### Animation Libraries (Reference, Don't Copy)
- **Framer Motion** examples — Spring physics for natural motion
- **GSAP Showcase** — Advanced scroll animations
- **CodePen** — Micro-interaction experiments

### Color & Typography Tools
- **Tailwind UI** — Study component patterns (but don't use directly)
- **shadcn/ui** — Component structure (but prefer custom CSS)
- **Coolors.co** — Palette generation (validate against Purple Ban)

---

## 🚨 When to Cite References

**ALWAYS include a reference when:**
1. Recommending a hover effect (cite: Linear, Stripe, etc.)
2. Suggesting a color palette (cite: Apple, Figma, etc.)
3. Proposing a layout pattern (cite: Awwwards example or specific site)
4. Implementing micro-interactions (cite: Framer, CodePen, or specific company)

**This gives the user:**
- A real example to study
- Proof the pattern works at scale
- Permission to "steal" the idea confidently
- A reference point for iteration

---

## 💡 Usage in Frontend-Specialist Decisions

**Before code, include in Design Commitment:**

```markdown
🎨 DESIGN COMMITMENT: [RADICAL STYLE]

- **Hover Effects:** [Magnetic Cursor from Linear.app]
- **Color Palette:** [Luxury template, Emerald Green accent from Figma]
- **Typography:** [Massive Centered Hero, 120px at desktop]
- **Navigation:** [Vertical Staggered, reference: Linear.app]
- **Animations:** [Staggered entrance reveals, 100ms delay between items]
```

This gives users **confidence** that the design is not made-up, but **proven at scale**.
