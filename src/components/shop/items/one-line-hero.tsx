"use client";

import { useEffect, useRef, useState } from "react";

const SHAPES = [
  { label: "pluck me", d: "M80 260 L720 260" },
  {
    label: "every game",
    d: "M330 190 C 250 190 215 300 245 340 C 270 372 315 352 335 318 L 465 318 C 485 352 530 372 555 340 C 585 300 550 190 470 190 Z",
  },
  { label: "every trip", d: "M80 330 L200 200 L270 270 L380 140 L470 260 L540 210 L720 300" },
  {
    label: "every poem",
    d: "M300 380 C 360 300 470 190 560 110 C 545 210 470 300 380 360 C 360 372 330 380 300 380",
  },
  {
    label: "— akash",
    d: "M120 280 C 160 160 220 360 260 250 C 285 185 330 205 320 270 C 312 320 380 310 410 250 C 430 210 455 275 480 262 C 520 240 560 200 600 235 C 630 262 660 240 690 220",
  },
] as const;

const POINTS = 180;
const NOTES = [196, 247, 294, 330, 392];

/** Samples `POINTS` evenly spaced points along an SVG path. */
function samplePath(svg: SVGSVGElement, d: string): [number, number][] {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  const length = path.getTotalLength();
  const points = Array.from({ length: POINTS }, (_, i) => {
    const p = path.getPointAtLength((length * i) / (POINTS - 1));
    return [p.x, p.y] as [number, number];
  });
  path.remove();
  return points;
}

/** A plucked-string sound (Karplus–Strong), made in the browser — no audio file. */
function twang(context: AudioContext, frequency: number) {
  const rate = context.sampleRate;
  const length = Math.floor(rate * 1.6);
  const buffer = context.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  const period = Math.floor(rate / frequency);
  const ring = Array.from({ length: period }, () => Math.random() * 2 - 1);
  for (let i = 0; i < length; i++) {
    const j = i % period;
    const v = ring[j] ?? 0;
    ring[j] = 0.996 * 0.5 * (v + (ring[(j + 1) % period] ?? 0));
    data[i] = v * 0.45;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
}

/**
 * "One line" hero: a single glowing guitar string. Click it and it twangs
 * (a real plucked sound) then redraws itself into the next thing you love —
 * a controller, a mountain route, a quill — ending in your signature.
 */
export function OneLineHero({
  shapes = SHAPES,
}: {
  shapes?: readonly { label: string; d: string }[];
}) {
  const svg = useRef<SVGSVGElement>(null);
  const line = useRef<SVGPathElement>(null);
  const pluckRef = useRef<() => void>(() => undefined);
  const [label, setLabel] = useState(shapes[0]?.label ?? "");

  useEffect(() => {
    const root = svg.current;
    const path = line.current;
    if (!root || !path || typeof SVGPathElement.prototype.getTotalLength !== "function") return;
    const sampled = shapes.map((s) => samplePath(root, s.d));
    const timers: number[] = [];
    let from = 0;
    let to = 0;
    let progress = 1;
    let amp = 0;
    let pluckedAt = 0;
    let frame = 0;
    let audio: AudioContext | null = null;

    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    pluckRef.current = () => {
      amp = 40;
      pluckedAt = performance.now();
      try {
        audio ??= new AudioContext();
        twang(audio, NOTES[to % NOTES.length] ?? 196);
      } catch {
        // No Web Audio: the string still wobbles silently.
      }
      timers.push(
        window.setTimeout(() => {
          from = to;
          to = (to + 1) % sampled.length;
          progress = 0;
          setLabel(shapes[to]?.label ?? "");
        }, 650),
      );
    };

    const draw = (now: number) => {
      progress = Math.min(1, progress + 1 / 60);
      const e = ease(progress);
      const wobble = amp * Math.exp(-(now - pluckedAt) / 260) * Math.cos((now - pluckedAt) / 22);
      const a = sampled[from] ?? [];
      const b = sampled[to] ?? [];
      let d = "";
      for (let i = 0; i < POINTS; i++) {
        const [ax, ay] = a[i] ?? [0, 0];
        const [bx, by] = b[i] ?? [0, 0];
        const x = ax + (bx - ax) * e;
        const y = ay + (by - ay) * e + wobble * Math.sin((Math.PI * i) / (POINTS - 1));
        d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      pluckRef.current = () => undefined;
      void audio?.close();
    };
  }, [shapes]);

  return (
    <section className="relative h-full min-h-[32rem] w-full overflow-hidden rounded-3xl bg-[#070708] text-white">
      <p
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 top-[12%] text-center font-['Caveat',cursive] text-5xl text-orange-200"
      >
        {label}
      </p>
      <button
        type="button"
        onClick={() => pluckRef.current()}
        aria-label="Pluck the string"
        className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-orange-400"
      >
        <svg
          ref={svg}
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid meet"
          className="size-full"
          aria-hidden="true"
        >
          <defs>
            <filter id="one-line-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={line}
            d={shapes[0]?.d}
            fill="none"
            stroke="#ff8a3d"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#one-line-glow)"
          />
        </svg>
      </button>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.15em] text-white/50 uppercase">
        tap the string · sound on
      </p>
    </section>
  );
}
