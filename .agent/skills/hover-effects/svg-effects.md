# SVG Element & Filter Effects

> Technique: the effect *is* a set of SVG elements (blades, dots) or an SVG filter (`feTurbulence` + `feDisplacementMap`) applied to the surface. Use when the visual is organic/structural — things CSS gradients can't draw.

---

## 1. GRASS — blades that part away from the cursor

A row of blades (thin paths). Each blade rotates away from the pointer's x, strength decaying with distance. Direct style writes (no React state per move).

```tsx
import { useEffect, useRef } from "react";

const BLADES = 40;

export function GrassButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const bladeRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const part = (e: PointerEvent) => {
      if (reduced) return;
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      bladeRefs.current.forEach((blade, i) => {
        if (!blade) return;
        const bx = (i / BLADES) * r.width;
        const d = px - bx;
        // push away from cursor, exponential falloff over ~40px
        const angle = Math.sign(-d) * 28 * Math.exp(-Math.abs(d) / 40);
        blade.style.transform = `rotate(${angle}deg)`;
      });
    };
    const rest = () =>
      bladeRefs.current.forEach((b) => b && (b.style.transform = "rotate(0deg)"));

    el.addEventListener("pointermove", part);
    el.addEventListener("pointerleave", rest);
    return () => {
      el.removeEventListener("pointermove", part);
      el.removeEventListener("pointerleave", rest);
    };
  }, []);

  return (
    <button
      ref={ref}
      className="relative overflow-hidden rounded-md bg-[#0c1a0c] px-12 py-4 font-bold tracking-widest text-lime-100"
    >
      <span className="relative z-10">{children}</span>
      <svg aria-hidden className="absolute inset-x-0 bottom-0 z-0 h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: BLADES }, (_, i) => {
          const x = (i / BLADES) * 100 + Math.random() * 1.5;
          const h = 55 + Math.random() * 40; // % height, randomized
          return (
            <path
              key={i}
              ref={(n) => { bladeRefs.current[i] = n; }}
              d={`M ${x} 100 Q ${x + 1} ${100 - h / 2} ${x + (Math.random() - 0.5) * 3} ${100 - h}`}
              stroke={`hsl(${105 + Math.random() * 25} 65% ${28 + Math.random() * 18}%)`}
              strokeWidth="1.1"
              fill="none"
              style={{ transformOrigin: `${x}% 100%`, transition: "transform 350ms cubic-bezier(.2,.8,.3,1)" }}
              // SVG viewBox is 0-100 in both axes via preserveAspectRatio=none
            />
          );
        })}
      </svg>
    </button>
  );
}
```

Add `viewBox="0 0 100 100"` to the `<svg>`. The `transition` on each blade gives the spring-back when the cursor leaves; randomized height/hue per blade sells the organic look.

---

## 2. THERMAL / HEAT — surface distorts and glows like a heat map

Two ingredients: (a) a thermal-palette radial gradient at the pointer (via `--x/--y`, see SKILL.md hook), (b) an SVG `feTurbulence` displacement filter that makes content shimmer.

```tsx
export function HeatButton({ children }: { children: React.ReactNode }) {
  const ref = usePointerPosition<HTMLButtonElement>();
  return (
    <>
      {/* declare once per page */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="heat-haze">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.06" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="4s" repeatCount="indefinite"
              values="0.015 0.06; 0.02 0.08; 0.015 0.06" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </svg>

      <button
        ref={ref}
        className="group relative overflow-hidden rounded-md bg-zinc-950 px-12 py-4 font-bold tracking-widest text-zinc-100"
      >
        {/* thermal bloom following the cursor */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          style={{
            background:
              "radial-gradient(110px circle at var(--x) var(--y), #f8fafc 0%, #fde047 18%, #f97316 40%, #dc2626 60%, #1e3a5f 85%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />
        <span className="relative z-10 motion-safe:group-hover:[filter:url(#heat-haze)]">
          {children}
        </span>
      </button>
    </>
  );
}
```

Notes: thermal palette runs white→yellow→orange→red→cold blue (real FLIR order). `mix-blend-mode: screen` makes it glow over dark surfaces. The `<animate>` on `baseFrequency` produces the haze wobble; `motion-safe:` gates the distortion for reduced-motion users (the color bloom alone remains).

---

## 3. DNA HELIX — two intertwined dot strands that twist on hover

Two rows of dots; strand B is phase-shifted 180° from strand A. Each dot animates `translateY` on a sine wave via staggered `animation-delay`. Hover speeds the twist up.

```tsx
const DOTS = 24;

export function HelixButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="helix-btn group relative overflow-hidden rounded-lg bg-slate-950 px-12 py-4 font-bold tracking-widest text-cyan-50">
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="absolute inset-0 flex items-center justify-between px-2">
        {Array.from({ length: DOTS }, (_, i) => (
          <span key={i} className="relative h-full w-px">
            <i className="helix-dot bg-cyan-400" style={{ animationDelay: `${i * -0.12}s` }} />
            <i className="helix-dot bg-teal-300" style={{ animationDelay: `${i * -0.12 - 0.9}s` }} />
          </span>
        ))}
      </span>
    </button>
  );
}
```

```css
.helix-dot {
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: helix-wave 1.8s ease-in-out infinite;
  animation-play-state: paused;      /* idle until hover/focus */
  opacity: 0.85;
}
.helix-btn:hover .helix-dot,
.helix-btn:focus-visible .helix-dot {
  animation-play-state: running;
}
@keyframes helix-wave {
  0%, 100% { transform: translateY(-9px) scale(1);   z-index: 1; }
  50%      { transform: translateY(9px)  scale(0.6); z-index: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .helix-dot { animation: none; transform: translateY(0); }
}
```

The second dot's extra `-0.9s` delay (half of 1.8s) is the 180° phase shift — that offset is what reads as two crossing strands. The `scale(0.6)` at the bottom of the wave fakes depth (far strand smaller). Delay of `-0.12s` per column controls the helix pitch.

> Palette warning: reference images of this effect are usually purple/violet — Purple Ban. Cyan/teal above; recolor to the project palette.
