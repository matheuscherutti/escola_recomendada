# Motion (framer-motion) Spring & Variant Effects

> Technique: Motion's springs, variants and stagger orchestration. Use when the effect is about *timing and physics across multiple elements* (letters, layers) rather than pointer position.
>
> Import from `"motion/react"` (the `motion` package — kit baseline). Always check `useReducedMotion()` before animating transforms.

---

## 1. SHINE SWEEP — light band sweeping across on hover

```tsx
export function ShineButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="group relative overflow-hidden rounded-lg bg-zinc-900 px-10 py-3 font-semibold text-zinc-100">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent
                   transition-transform duration-700 ease-out group-hover:translate-x-[300%] group-focus-visible:translate-x-[300%]
                   motion-reduce:transition-none"
      />
    </button>
  );
}
```

CSS-only (no Motion needed) — listed here because it pairs with press physics below. The sweep must run once per hover-enter, not loop.

---

## 2. PRESS PHYSICS — tactile scale/spring on hover and tap

The baseline micro-interaction every clickable element should have (frontend-specialist mandate: physical feedback on all interactive elements).

```tsx
import { motion, useReducedMotion } from "motion/react";

export function PressButton({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      whileHover={reduced ? undefined : { scale: 1.04, y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      whileFocus={reduced ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="rounded-lg bg-orange-500 px-8 py-3 font-bold text-orange-950"
    >
      {children}
    </motion.button>
  );
}
```

Spring 400/17 = crisp and physical. Never use `transition={{ duration }}` (linear) for press feedback — it reads as dead.

---

## 3. GLITCH — RGB-split flicker on hover

Two absolutely-positioned copies of the label, clipped and offset in opposite directions with steps() timing.

```tsx
export function GlitchButton({ label }: { label: string }) {
  return (
    <button className="glitch-btn relative rounded-none border-2 border-zinc-100 bg-zinc-950 px-10 py-3 font-mono font-bold uppercase tracking-widest text-zinc-100">
      <span className="relative z-10">{label}</span>
      <span aria-hidden data-text={label} className="glitch-layer glitch-r" />
      <span aria-hidden data-text={label} className="glitch-layer glitch-c" />
    </button>
  );
}
```

```css
.glitch-layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: 0;
}
.glitch-layer::before { content: attr(data-text); }
.glitch-btn:hover .glitch-layer,
.glitch-btn:focus-visible .glitch-layer { opacity: 1; }
.glitch-btn:hover .glitch-r { color: #f43f5e; animation: glitch-shift 350ms steps(2) infinite; }
.glitch-btn:hover .glitch-c { color: #22d3ee; animation: glitch-shift 350ms steps(2) infinite reverse; }
@keyframes glitch-shift {
  0%   { transform: translate(0, 0);      clip-path: inset(0 0 65% 0); }
  25%  { transform: translate(-3px, 1px); clip-path: inset(35% 0 30% 0); }
  50%  { transform: translate(3px, -1px); clip-path: inset(60% 0 5% 0); }
  75%  { transform: translate(-2px, 0);   clip-path: inset(10% 0 75% 0); }
  100% { transform: translate(0, 0);      clip-path: inset(0 0 65% 0); }
}
@media (prefers-reduced-motion: reduce) {
  .glitch-btn:hover .glitch-layer { animation: none; opacity: 0.3; transform: translate(1px, 0); }
}
```

Cap the glitch: infinite while hovered is acceptable *only* because hover is transient; never auto-play it on page load. Red/cyan split above — recolor to palette, avoid magenta (Purple Ban).

---

## 4. TEXT STAGGER — letters ripple upward on hover

Split the label into letters; hover triggers a staggered variant cascade.

```tsx
import { motion, useReducedMotion } from "motion/react";

export function StaggerButton({ label }: { label: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      initial="rest"
      whileHover={reduced ? undefined : "hover"}
      whileFocus={reduced ? undefined : "hover"}
      className="rounded-lg bg-zinc-100 px-10 py-3 font-bold text-zinc-900"
      aria-label={label}
    >
      <span aria-hidden className="flex">
        {label.split("").map((ch, i) => (
          <motion.span
            key={i}
            variants={{
              rest: { y: 0 },
              hover: { y: [-0, -6, 0], transition: { delay: i * 0.03, duration: 0.35 } },
            }}
            className="inline-block whitespace-pre"
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </motion.button>
  );
}
```

`aria-label` on the button + `aria-hidden` on the split span: screen readers hear one word, not 6 letters.

---

## 5. TEXT SCRAMBLE — label decodes through random characters

```tsx
import { useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#";

export function ScrambleButton({ label }: { label: string }) {
  const [text, setText] = useState(label);
  const frame = useRef(0);
  const raf = useRef(0);

  const scramble = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    frame.current = 0;
    const tick = () => {
      frame.current += 1;
      const progress = frame.current / 3; // letters resolved so far
      setText(
        label
          .split("")
          .map((ch, i) => (i < progress ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join("")
      );
      if (progress < label.length) raf.current = requestAnimationFrame(tick);
    };
    tick();
  };

  return (
    <button
      onPointerEnter={scramble}
      onFocus={scramble}
      aria-label={label}
      className="rounded-md border border-zinc-700 bg-zinc-950 px-10 py-3 font-mono font-semibold uppercase tracking-widest text-lime-300"
    >
      <span aria-hidden>{text}</span>
    </button>
  );
}
```

This one *does* re-render per frame — acceptable because it's text content (no layout thrash) and runs ~1s once per hover-enter, not continuously. `aria-label` keeps the accessible name stable while visible text scrambles.
