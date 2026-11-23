"use client";

import { useEffect, useRef, useState } from "react";

/** Sky colours (top, bottom) at key hours; 4 → 28 wraps one full day. */
const SKY: readonly [number, string, string][] = [
  [4, "#05060f", "#141a33"],
  [6, "#2b2350", "#f08a5d"],
  [8, "#f4a261", "#ffe0b0"],
  [12, "#3d8fd6", "#bfe3ff"],
  [16, "#4f8fc9", "#ffd9a0"],
  [18, "#5a3a7a", "#ff7b54"],
  [20, "#1c1840", "#7a3f6e"],
  [23, "#070a1c", "#1d2148"],
  [28, "#05060f", "#141a33"],
];

const ACTIVITIES = [
  { from: 5, to: 11, caption: "out on the road somewhere" },
  { from: 11, to: 17, caption: "levelling up" },
  { from: 17, to: 21, caption: "guitar on the terrace" },
  { from: 21, to: 29, caption: "writing poems under the lamp" },
] as const;

/** Fixed star field (seeded, so server and client agree). */
const STARS = (() => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 90 }, () => ({
    x: rand() * 800,
    y: rand() * 220,
    r: rand() * 1.4 + 0.3,
    o: rand() * 0.8 + 0.2,
  }));
})();

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + ((B[i] ?? v) - v) * t)).join(" ")})`;
};

/** The sky's two gradient colours at an hour between 4 and 28. */
export function skyAt(hour: number): [string, string] {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [h0, top0, bottom0] = SKY[i]!;
    const [h1, top1, bottom1] = SKY[i + 1]!;
    if (hour >= h0 && hour <= h1) {
      const t = (hour - h0) / (h1 - h0);
      return [mix(top0, top1, t), mix(bottom0, bottom1, t)];
    }
  }
  return [SKY[0]![1], SKY[0]![2]];
}

/** "7:30 AM" from a fractional hour. */
const clock = (hour: number) => {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/**
 * "A day with me" hero: a painted landscape around your place. Drag across it
 * to move the sun; the sky, the light and your day change with it — a trip at
 * dawn, games in the afternoon, guitar at sunset, poems under the stars.
 */
export function DayCycleHero() {
  const wrap = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [caption, setCaption] = useState<string>(ACTIVITIES[0].caption);
  const [time, setTime] = useState("7:00 AM");

  useEffect(() => {
    const el = wrap.current;
    const root = svg.current;
    if (!el || !root) return;
    const $ = (name: string) => root.querySelector<SVGElement>(`[data-part="${name}"]`);
    const parts = Object.fromEntries(
      [
        "s0",
        "s1",
        "orb",
        "glow",
        "stars",
        "h1",
        "h2",
        "h3",
        "road",
        "house",
        "bus",
        "win",
        "win2",
        "lamp",
        "guitarist",
        "notes",
      ].map((n) => [n, $(n)]),
    );
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let hour = 7;
    let dragging = false;
    let idleSince = performance.now();
    let frame = 0;
    let lastCaption = "";
    let lastTime = "";

    const setHour = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      hour = 5 + ((event.clientX - box.left) / box.width) * 23;
      idleSince = performance.now();
    };
    const down = (event: PointerEvent) => {
      dragging = true;
      el.setPointerCapture?.(event.pointerId);
      setHour(event);
    };
    const move = (event: PointerEvent) => {
      if (dragging) setHour(event);
    };
    const up = () => {
      dragging = false;
    };
    const set = (name: string, attr: string, value: string | number) =>
      parts[name]?.setAttribute(attr, String(value));
    const fade = (name: string, value: number) => {
      const part = parts[name];
      if (part) part.style.opacity = String(value);
    };

    const render = (now: number) => {
      if (!dragging && !reduced && now - idleSince > 2500) hour += 0.018;
      const hr = ((((hour - 4) % 24) + 24) % 24) + 4;
      const [top, bottom] = skyAt(hr);
      set("s0", "stop-color", top);
      set("s1", "stop-color", bottom);
      const day = Math.max(0, Math.sin(((hr - 6) / 12) * Math.PI));
      const isDay = hr >= 6 && hr <= 18;
      const arc = isDay ? (hr - 6) / 12 : ((hr - 18) % 12) / 12;
      const ox = 60 + arc * 680;
      const oy = 300 - Math.sin(arc * Math.PI) * 240;
      for (const n of ["orb", "glow"]) {
        set(n, "cx", ox);
        set(n, "cy", oy);
      }
      set("orb", "fill", isDay ? "#fff1c9" : "#e8ecff");
      fade("glow", isDay ? 1 : 0.35);
      fade("stars", Math.max(0, 1 - day * 3));
      const land = (c: string) => mix("#0c0a14", c, Math.min(1, 0.25 + day * 0.9));
      set("h1", "fill", land("#6b7f5a"));
      set("h2", "fill", land("#4f6a45"));
      set("h3", "fill", land("#33492f"));
      set("road", "stroke", land("#8a8478"));
      set("house", "fill", land("#2b2a33"));
      const act = Math.max(
        0,
        ACTIVITIES.findIndex((a) => hr >= a.from && hr < a.to),
      );
      const bx = -40 + ((now / 18) % 880);
      set("bus", "transform", `translate(${bx} ${350 + Math.sin(bx / 40) * 3})`);
      fade("bus", act === 0 ? 1 : 0);
      const flicker = `hsl(${200 + Math.sin(now / 90) * 40} 90% ${55 + Math.sin(now / 37) * 12}%)`;
      set("win", "fill", act === 1 ? flicker : act === 3 ? "#ffcf7a" : land("#556"));
      set("win2", "fill", act === 3 ? "#ffcf7a" : land("#556"));
      fade("lamp", act === 3 ? 0.9 : act === 1 ? 0.35 : 0);
      fade("guitarist", act === 2 ? 1 : 0);
      fade("notes", act === 2 ? 0.5 + 0.5 * Math.sin(now / 300) : 0);

      const nextCaption = ACTIVITIES[act]?.caption ?? "";
      if (nextCaption !== lastCaption) {
        lastCaption = nextCaption;
        setCaption(nextCaption);
      }
      const nextTime = clock(hr);
      if (nextTime !== lastTime) {
        lastTime = nextTime;
        setTime(nextTime);
      }
      frame = requestAnimationFrame(render);
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section
      ref={wrap}
      aria-label="A day in my life"
      className="relative h-full min-h-[32rem] w-full cursor-ew-resize touch-none overflow-hidden rounded-3xl bg-[#05060f] text-white select-none"
    >
      <svg
        ref={svg}
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="day-cycle-sky" x1="0" y1="0" x2="0" y2="1">
            <stop data-part="s0" offset="0" stopColor="#f4a261" />
            <stop data-part="s1" offset="1" stopColor="#ffe0b0" />
          </linearGradient>
          <radialGradient id="day-cycle-sun">
            <stop offset="0" stopColor="#fff6d8" />
            <stop offset=".35" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="day-cycle-lamp">
            <stop offset="0" stopColor="#ffcf7a" stopOpacity=".9" />
            <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="450" fill="url(#day-cycle-sky)" />
        <g data-part="stars">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
          ))}
        </g>
        <circle data-part="glow" r="90" fill="url(#day-cycle-sun)" />
        <circle data-part="orb" r="20" />
        <path
          data-part="h1"
          d="M0 250 C 160 200 300 240 420 215 C 560 190 680 235 800 215 L800 450 L0 450 Z"
        />
        <path
          data-part="h2"
          d="M0 300 C 140 270 320 295 450 270 C 590 245 700 285 800 275 L800 450 L0 450 Z"
        />
        <path
          data-part="road"
          d="M-20 360 C 200 345 560 375 820 352"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <g data-part="bus">
          <rect x="-28" y="-18" width="56" height="23" rx="6" fill="#ff7a1a" />
          <rect x="-22" y="-14" width="13" height="9" rx="1" fill="#fff4" />
          <rect x="-5" y="-14" width="13" height="9" rx="1" fill="#fff4" />
          <circle cx="-15" cy="6" r="5" fill="#111" />
          <circle cx="15" cy="6" r="5" fill="#111" />
        </g>
        <path data-part="h3" d="M0 385 C 220 365 520 395 800 372 L800 450 L0 450 Z" />
        <g>
          <rect data-part="house" x="520" y="290" width="120" height="82" />
          <rect x="512" y="282" width="136" height="10" fill="#1d1c24" />
          <rect data-part="win" x="540" y="312" width="30" height="26" rx="2" />
          <rect data-part="win2" x="590" y="312" width="30" height="26" rx="2" />
          <circle data-part="lamp" cx="555" cy="325" r="60" fill="url(#day-cycle-lamp)" />
          <g data-part="guitarist" transform="translate(600 282) scale(1.3)" fill="#1d1c24">
            <circle cx="0" cy="-30" r="6" />
            <path d="M-6 -23 L6 -23 L7 0 L-7 0 Z" />
            <ellipse cx="9" cy="-8" rx="9" ry="7" transform="rotate(-25 9 -8)" />
            <rect x="12" y="-30" width="3" height="22" transform="rotate(-55 13 -19)" />
          </g>
          <g data-part="notes" fontSize="18" fill="#ffd9b0">
            <text x="628" y="245">
              ♪
            </text>
            <text x="646" y="222">
              ♫
            </text>
            <text x="620" y="204">
              ♪
            </text>
          </g>
        </g>
      </svg>
      <p className="pointer-events-none absolute inset-x-0 top-5 text-center font-mono text-xs font-semibold tracking-[0.2em] text-white/80">
        {time}
      </p>
      <p
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 top-12 text-center font-['Caveat',cursive] text-5xl text-orange-100 [text-shadow:0_2px_18px_rgb(0_0_0/0.6)]"
      >
        {caption}
      </p>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.15em] text-white/60 uppercase">
        drag left / right to move the sun
      </p>
    </section>
  );
}
