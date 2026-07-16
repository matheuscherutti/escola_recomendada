# Cursor-Tracked Effects (CSS Custom Properties)

> Technique: pointer coords → `--x`/`--y` CSS vars via `usePointerPosition` (see SKILL.md) → gradients/masks/transforms consume the vars. Zero React re-renders.

---

## 1. RIPPLE — expanding wave from the pointer

Spawn a circle at the pointer on hover-enter (or `pointerdown` on touch), scale it up, remove on `animationend`.

```tsx
import { useRef, type PointerEvent } from "react";

export function RippleButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);

  const spawnRipple = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(r.width, r.height) * 2;
    ripple.className = "hover-ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;`;
    ripple.addEventListener("animationend", () => ripple.remove());
    el.appendChild(ripple);
  };

  return (
    <button
      ref={ref}
      onPointerDown={spawnRipple}
      onFocus={() => ref.current && spawnRipple({ clientX: 0, clientY: 0 } as PointerEvent<HTMLButtonElement>)}
      className="relative overflow-hidden rounded-lg border border-sky-800 bg-slate-900 px-8 py-3 font-semibold tracking-widest text-sky-100"
    >
      {children}
    </button>
  );
}
```

```css
.hover-ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(56 189 248 / 0.35) 0%, transparent 70%);
  transform: scale(0);
  animation: ripple-grow 600ms ease-out forwards;
  pointer-events: none;
}
@keyframes ripple-grow {
  to { transform: scale(1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hover-ripple { animation-duration: 1ms; }
}
```

---

## 2. SPOTLIGHT / LANTERN — light cone revealing the surface

Dark overlay with a transparent radial hole at the pointer. For the "lantern in the dark" look, the button content sits *under* the overlay.

```tsx
export function LanternButton({ children }: { children: React.ReactNode }) {
  const ref = usePointerPosition<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      className="group relative overflow-hidden rounded-md border border-amber-900/60 bg-[#1a1208] px-10 py-3 font-serif tracking-[0.3em] text-amber-200"
    >
      <span className="relative z-10">{children}</span>
      {/* darkness with a light hole following the cursor */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-60"
        style={{
          background:
            "radial-gradient(140px circle at var(--x) var(--y), transparent 0%, rgba(8,5,0,0.92) 65%)",
        }}
      />
    </button>
  );
}
```

Variant — **glow spotlight** (light *added* instead of darkness removed): same structure, overlay uses `radial-gradient(120px circle at var(--x) var(--y), rgb(251 191 36 / 0.25), transparent 70%)` and `opacity-0 group-hover:opacity-100`.

---

## 3. MAGNETIC — button pulled toward the cursor

Motion springs; translate proportional to pointer offset from center, spring back on leave.

```tsx
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useRef, type PointerEvent } from "react";

export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const pull = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const release = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onPointerMove={pull}
      onPointerLeave={release}
      className="rounded-full bg-emerald-500 px-8 py-3 font-bold text-emerald-950"
    >
      {children}
    </motion.button>
  );
}
```

Tuning: multiplier `0.35` = pull strength; stiffness 300/damping 20 = snappy spring. For a lazier feel: stiffness 150, damping 15.

---

## 4. GRADIENT-BORDER FOLLOW — glowing border segment tracking the cursor

Border layer = element painted with a radial gradient at `--x/--y`, masked so only the border ring shows.

```tsx
export function GlowBorderCard({ children }: { children: React.ReactNode }) {
  const ref = usePointerPosition<HTMLDivElement>();
  return (
    <div ref={ref} className="group relative rounded-xl bg-zinc-900 p-6 text-zinc-100">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background: "radial-gradient(180px circle at var(--x) var(--y), rgb(45 212 191 / 0.9), transparent 70%)",
          padding: "1px",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  );
}
```

---

## 5. 3D TILT — card rotates toward the pointer

`rotateX/rotateY` from pointer offset; needs `perspective` on the parent. Cap rotation at ~10° — beyond that it reads as broken, not premium.

```tsx
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useRef, type PointerEvent } from "react";

export function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 });

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);  // max ±8°
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  };

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        ref={ref}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={tilt}
        onPointerLeave={() => { rx.set(0); ry.set(0); }}
        className="rounded-2xl bg-zinc-900 p-8 text-zinc-100 shadow-2xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

Depth bonus: give inner elements `translateZ(30px)` so they float above the card while it tilts.
