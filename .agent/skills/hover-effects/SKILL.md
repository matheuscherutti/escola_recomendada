---
name: hover-effects
description: "Use when a button, card, or link needs a hover/press micro-interaction beyond a color change — ripple, spotlight, magnetic pull, scratch-off, particle or SVG-driven effects — or when the user shares an effect image/video from social media to reproduce. Also triggers on: \"hover effect\", \"button effect\", \"micro-interaction\", \"efeito hover\", \"efeito de botão\", \"botão animado\"."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Hover Effects — Pointer-Driven Micro-Interactions

> **Philosophy:** A hover effect is physics, not decoration. The pointer is an input device — the surface must *react* to it (position, velocity, pressure), not just swap a color. `opacity: 0.8` on hover is a failure state.

---

## ⚠️ Social-Media Pseudo-CSS (READ FIRST)

Effect showcase images from Instagram/TikTok (e.g. "Hover Button Effects Pt.X") often display **fake CSS** as visual shorthand — `surface: wave(x, y)`, `blades: part(x)`, `filter: thermal()` are **not real properties**. Treat those images as a *visual brief*, never as code to copy. Identify which real technique produces the shown result using the catalog below, and say so explicitly to the user when they share one.

---

## 🎯 Selective Reading Rule (MANDATORY)

Read only the file matching the requested effect's technique:

| File | Technique | Effects covered |
|------|-----------|-----------------|
| [cursor-effects.md](cursor-effects.md) | CSS custom props tracking the pointer (no re-renders) | Ripple, Spotlight/Lantern, Magnetic, Gradient-border follow, 3D Tilt |
| [canvas-effects.md](canvas-effects.md) | `<canvas>` overlay + composite operations | Scratch-off foil, Particle burst/trail |
| [svg-effects.md](svg-effects.md) | SVG elements & filters | Grass blades, Thermal/Heat (feTurbulence), DNA Helix |
| [motion-effects.md](motion-effects.md) | Motion (framer-motion) springs & variants | Shine sweep, Press physics, Glitch, Text stagger/scramble |

**Effect name → file lookup:** RIPPLE → cursor · SCRATCH/WIN → canvas · GRASS → svg · HEAT → svg · LANTERN → cursor · HELIX → svg · MAGNETIC → cursor · SHINE → motion · GLITCH → motion · TILT → cursor · PARTICLES → canvas.

---

## 🚫 Non-Negotiables (apply to EVERY effect)

1. **Keyboard parity:** every hover effect must also trigger on `:focus-visible` (or `onFocus`). A keyboard user gets the same feedback, minus pointer-position data (fall back to element center).
2. **`prefers-reduced-motion`:** mandatory. Use Motion's `useReducedMotion()` or a CSS `@media` query — reduce to a simple, instant state change (never remove feedback entirely).
3. **GPU-only animation:** animate `transform` and `opacity`. Pointer position goes into **CSS custom properties written directly on the element** (`el.style.setProperty`) — never through React state on `pointermove` (re-render per frame kills performance).
4. **Touch fallback:** hover does not exist on touch. Every effect defines its press/tap behavior (usually: fire the effect on `pointerdown`).
5. **Purple Ban applies:** never default to purple/violet/magenta for glows and gradients (frontend-specialist rule). Reference images from social media are usually purple — recolor to the project's palette.
6. **Cleanup:** listeners removed on unmount, spawned nodes (ripples, particles) removed on `animationend`, canvas contexts released. No leaks.
7. **Contrast survives the effect:** text must stay ≥ 4.5:1 against the animated background at every frame of the effect.

---

## Shared Foundation: the `usePointerPosition` hook

All cursor-tracked effects share this pattern (defined once per project, imported everywhere):

```tsx
import { useEffect, useRef } from "react";

/** Writes pointer coords as --x/--y CSS vars on the element. Zero re-renders. */
export function usePointerPosition<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    };
    const reset = () => {
      // focus-visible fallback: effect anchors to center
      el.style.setProperty("--x", "50%");
      el.style.setProperty("--y", "50%");
    };
    reset();
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  return ref;
}
```

Stack assumption: **React 18+ / TypeScript strict / Tailwind / Motion** (`motion` package — already the kit baseline). For non-React projects, transpose the same technique to vanilla JS; the physics does not change.

---

## Delivery Checklist (before claiming done)

- [ ] Effect visually verified in the browser (not assumed from code)
- [ ] Works via keyboard focus
- [ ] `prefers-reduced-motion` path tested (DevTools → Rendering → emulate)
- [ ] No re-render per `pointermove` (React DevTools profiler or reasoning from code: state is not set in the move handler)
- [ ] Colors match project palette, not the reference image

## Related Skills

- `frontend-design/animation-guide.md` — timing, easing and choreography principles (when/why to animate)
- `frontend-design/visual-effects.md` — static depth (shadows, gradients, grain)
- This skill — *pointer-driven* micro-interaction recipes (how to build the effect itself)
