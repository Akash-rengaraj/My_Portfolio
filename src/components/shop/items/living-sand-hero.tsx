"use client";

import { useEffect, useRef, useState } from "react";

type Shape = { kind: "text" | "emoji"; value: string; caption: string };

const SHAPES: readonly Shape[] = [
  { kind: "text", value: "AKASH", caption: "hey, I'm akash" },
  { kind: "emoji", value: "🎸", caption: "makes music" },
  { kind: "emoji", value: "🎮", caption: "plays everything" },
  { kind: "emoji", value: "🗺️", caption: "goes places" },
  { kind: "emoji", value: "🪶", caption: "writes at 2am" },
];

type Grain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  color: string;
};
type Target = [number, number, string];

const GRAINS = 1800;

/** Draws a shape off-screen and returns its filled pixels as shuffled targets. */
function sampleShape(shape: Shape, w: number, h: number): Target[] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (shape.kind === "text") {
    let size = Math.min(h * 0.4, 220);
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    while (ctx.measureText(shape.value).width > w * 0.86 && size > 10) {
      size -= 4;
      ctx.font = `900 ${size}px system-ui, sans-serif`;
    }
    ctx.fillStyle = "#fff";
  } else {
    ctx.font = `${Math.floor(Math.min(w, h) * 0.55)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  }
  ctx.fillText(shape.value, w / 2, h * 0.45);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gap = Math.max(3, Math.round(Math.sqrt((w * h) / 9000)));
  const targets: Target[] = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      const i = (y * w + x) * 4;
      if ((data[i + 3] ?? 0) > 140) {
        const color =
          shape.kind === "text"
            ? `hsl(${22 + (x / w) * 18} 100% ${58 + ((x * 7 + y * 3) % 14)}%)`
            : `rgb(${Math.min(255, (data[i] ?? 0) + 30)} ${Math.min(255, (data[i + 1] ?? 0) + 30)} ${Math.min(255, (data[i + 2] ?? 0) + 30)})`;
        targets.push([x, y, color]);
      }
    }
  }
  for (let i = targets.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targets[i], targets[j]] = [targets[j]!, targets[i]!];
  }
  return targets;
}

/**
 * "Living sand" hero: your name made of ~1,800 glowing grains. Drag through
 * them and they scatter like sand, then flow back; click and they burst and
 * re-form into the next shape (emoji keep their colours). 2D canvas only.
 */
export function LivingSandHero({ shapes = SHAPES }: { shapes?: readonly Shape[] }) {
  const wrap = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<() => void>(() => undefined);
  const [caption, setCaption] = useState(shapes[0]?.caption ?? "");

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    let w = 0;
    let h = 0;
    let targets: Target[][] = [];
    let current = 0;
    let lastInput = performance.now();
    let px = -999;
    let py = -999;
    let frame = 0;
    const grains: Grain[] = Array.from({ length: GRAINS }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      color: "#ff8a3d",
    }));

    const assign = (index: number, burst: boolean) => {
      const t = targets[index];
      if (!t?.length) return;
      grains.forEach((g, i) => {
        const [x, y, color] = t[i % t.length]!;
        g.tx = x;
        g.ty = y;
        g.color = color;
        if (burst) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 6 + Math.random() * 14;
          g.vx += Math.cos(angle) * speed;
          g.vy += Math.sin(angle) * speed;
        }
      });
      setCaption(shapes[index]?.caption ?? "");
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      targets = shapes.map((s) => sampleShape(s, w, h));
      grains.forEach((g) => {
        g.x = Math.random() * w;
        g.y = Math.random() * h;
      });
      assign(current, false);
    };

    nextRef.current = () => {
      current = (current + 1) % shapes.length;
      lastInput = performance.now();
      assign(current, true);
    };

    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      px = event.clientX - box.left;
      py = event.clientY - box.top;
      lastInput = performance.now();
    };
    const onLeave = () => {
      px = -999;
      py = -999;
    };

    const tick = (now: number) => {
      if (now - lastInput > 4200) nextRef.current();
      ctx.fillStyle = "rgb(5 5 6 / 0.32)";
      ctx.fillRect(0, 0, w, h);
      for (const g of grains) {
        g.vx += (g.tx - g.x) * 0.045;
        g.vy += (g.ty - g.y) * 0.045;
        const dx = g.x - px;
        const dy = g.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 4900) {
          const force = ((4900 - d2) / 4900) * 9;
          const d = Math.sqrt(d2) || 1;
          g.vx += (dx / d) * force;
          g.vy += (dy / d) * force;
        }
        g.vx *= 0.84;
        g.vy *= 0.84;
        g.x += g.vx;
        g.y += g.vy;
        ctx.fillStyle = g.color;
        ctx.fillRect(g.x, g.y, 2.2, 2.2);
      }
      frame = requestAnimationFrame(tick);
    };

    // The observer's first callback does the initial sizing.
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      nextRef.current = () => undefined;
    };
  }, [shapes]);

  return (
    <section
      ref={wrap}
      className="relative h-full min-h-[32rem] w-full overflow-hidden rounded-3xl bg-[#050506]"
    >
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />
      <button
        type="button"
        onClick={() => nextRef.current()}
        aria-label="Change the shape"
        className="absolute inset-0 cursor-crosshair focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-orange-400"
      />
      <p
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-['Caveat',cursive] text-5xl text-orange-200"
      >
        {caption}
      </p>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.15em] text-white/50 uppercase">
        drag through it · tap to change
      </p>
    </section>
  );
}
