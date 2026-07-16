# Canvas Overlay Effects

> Technique: a `<canvas>` positioned over (or under) the button content; the pointer draws into it each frame. Use for effects that erase, accumulate, or spawn many short-lived elements — DOM nodes would be too slow or too leaky.
>
> Canvas rules: size the canvas to `devicePixelRatio`, draw inside `requestAnimationFrame`, and stop the rAF loop when the pointer leaves — an idle rAF loop drains laptop batteries.

---

## 1. SCRATCH-OFF FOIL — cursor erases a layer revealing a prize ("WIN!")

Foil layer drawn on canvas; pointer strokes erase it via `globalCompositeOperation = "destination-out"`. Content beneath is normal DOM. Foil regenerates on leave.

```tsx
import { useEffect, useRef } from "react";

export function ScratchButton({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const paintFoil = () => {
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "#a7b0be");   // brushed-metal foil — recolor to project palette
      g.addColorStop(0.5, "#e4e9f0");
      g.addColorStop(1, "#8b93a1");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };
    paintFoil();

    const scratch = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(e.clientX - r.left, e.clientY - r.top, 18, 0, Math.PI * 2);
      ctx.fill();
    };
    // touch parity: pointermove covers mouse + touch + pen
    const restore = () => paintFoil();

    canvas.addEventListener("pointermove", scratch);
    canvas.addEventListener("pointerleave", restore);
    return () => {
      canvas.removeEventListener("pointermove", scratch);
      canvas.removeEventListener("pointerleave", restore);
    };
  }, []);

  return (
    <button
      ref={wrapRef}
      className="relative overflow-hidden rounded-lg px-12 py-4 font-black tracking-widest"
    >
      {/* prize layer underneath — style freely */}
      <span className="relative z-0">{children}</span>
      <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full touch-none" aria-hidden />
    </button>
  );
}
```

Notes:
- `touch-none` (Tailwind → `touch-action: none`) so scratching works on touch without scrolling the page.
- Keyboard/reduced-motion fallback: on `focus-visible`, fade the canvas to 30% opacity so the prize is perceivable without scratching.
- Accessibility: the prize text is real DOM under the canvas, so screen readers announce it regardless of foil state.

---

## 2. PARTICLE BURST / TRAIL — sparks following the cursor

Particles live in a plain array (not React state); one rAF loop updates and draws. Spawn on `pointermove`, kill when life ≤ 0.

```tsx
import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; life: number };

export function SparkButton({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    let raf = 0;
    let running = false;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.025;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#fbbf24"; // spark color — project palette
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      ctx.globalAlpha = 1;
      if (particles.length > 0) raf = requestAnimationFrame(tick);
      else running = false; // stop the loop when nothing is alive
    };

    const spawn = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX - r.left, y: e.clientY - r.top,
          vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.5,
          life: 1,
        });
      }
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };

    canvas.addEventListener("pointermove", spawn);
    canvas.addEventListener("pointerdown", spawn); // touch parity
    return () => {
      canvas.removeEventListener("pointermove", spawn);
      canvas.removeEventListener("pointerdown", spawn);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button ref={wrapRef} className="relative rounded-lg bg-zinc-900 px-10 py-3 font-semibold text-amber-100">
      <span className="relative z-0">{children}</span>
      <canvas ref={canvasRef} className="pointer-events-auto absolute inset-0 z-10 h-full w-full" aria-hidden />
    </button>
  );
}
```

Tuning: gravity `p.vy += 0.05`, decay `0.025` (~40 frames of life), 3 particles per move event. For a burst-on-click instead of a trail, spawn 20–30 particles in `pointerdown` only, with radial velocities.
