"use client";

import { useEffect, useRef, useState } from "react";

const HAND = "font-['Caveat','Segoe_Print','Bradley_Hand',cursive]";

/**
 * "Lights out" hero: the page opens in a dark room and the pointer is a
 * torch. Sweep it to find the objects (each one a link to part of your site);
 * flip the light switch to light the whole room and say hello. With no
 * pointer, the torch sweeps on its own (not for reduced-motion users).
 */
export function LightsOutHero({
  name = "Akash",
  rooms = { map: "#trips", guitar: "#music", shelf: "#games", notebook: "#poems" },
}: {
  name?: string;
  rooms?: { map: string; guitar: string; shelf: string; notebook: string };
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const onRef = useRef(on);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const objects = Array.from(el.querySelectorAll<HTMLElement>("[data-object]"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let touched = false;
    let frame = 0;

    const light = (x: number, y: number) => {
      el.style.setProperty("--tx", `${x}px`);
      el.style.setProperty("--ty", `${y}px`);
      const box = el.getBoundingClientRect();
      for (const object of objects) {
        const b = object.getBoundingClientRect();
        const d = Math.hypot(
          b.left - box.left + b.width / 2 - x,
          b.top - box.top + b.height / 2 - y,
        );
        object.dataset.lit = String(d < Math.max(110, box.width * 0.12));
      }
    };
    const onMove = (event: PointerEvent) => {
      touched = true;
      const box = el.getBoundingClientRect();
      light(event.clientX - box.left, event.clientY - box.top);
    };
    const onLeave = () => {
      touched = false;
    };
    const sweep = (now: number) => {
      if (!touched && !onRef.current && !reduced) {
        const box = el.getBoundingClientRect();
        const s = (now - started) / 1000;
        light(
          box.width * (0.5 + 0.35 * Math.sin(s * 0.9)),
          box.height * (0.45 + 0.3 * Math.sin(s * 0.55)),
        );
      }
      frame = requestAnimationFrame(sweep);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(sweep);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const label = `${HAND} mt-1 block text-center text-xl text-orange-300 opacity-0 transition-opacity duration-300 group-data-[lit=true]/obj:opacity-100 group-data-[on=true]/room:opacity-100`;
  const object =
    "group/obj absolute block rounded-xl focus-visible:outline-2 focus-visible:outline-orange-400";

  return (
    <section
      ref={stage}
      data-on={on}
      aria-label={`${name}'s room`}
      className="group/room relative h-full min-h-[32rem] w-full overflow-hidden rounded-3xl bg-[radial-gradient(120%_80%_at_50%_10%,#2a2118,#120e0b_70%)] text-white [--tx:50%] [--ty:40%]"
    >
      {/* Window with the moon */}
      <div
        aria-hidden="true"
        className="absolute top-[8%] left-[42%] h-[22%] w-[16%] rounded-t-full border-4 border-[#3b2a1a] bg-[radial-gradient(circle_at_70%_30%,#f6f1d5_0_8%,#1b2340_9%_100%)]"
      />

      <a
        href={rooms.map}
        data-object
        className={`${object} top-[10%] left-[6%] w-[28%]`}
        aria-label="Places I've been"
      >
        <svg viewBox="0 0 120 80" className="w-full" aria-hidden="true">
          <rect
            x="2"
            y="2"
            width="116"
            height="76"
            rx="4"
            fill="#d9c59a"
            stroke="#7a6440"
            strokeWidth="3"
          />
          <path
            d="M14 60 C 30 30 50 66 64 40 S 96 24 106 18"
            stroke="#c0392b"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            fill="none"
          />
          {[
            [14, 60],
            [64, 40],
            [106, 18],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5" fill="#e74c3c" />
          ))}
        </svg>
        <span className={label}>places I&apos;ve been</span>
      </a>

      <a
        href={rooms.guitar}
        data-object
        className={`${object} top-[24%] right-[8%] w-[13%]`}
        aria-label="Songs I wrote"
      >
        <svg viewBox="0 0 60 150" className="w-full" aria-hidden="true">
          <ellipse cx="30" cy="112" rx="26" ry="30" fill="#b5651d" />
          <ellipse cx="30" cy="78" rx="19" ry="22" fill="#b5651d" />
          <circle cx="30" cy="100" r="8" fill="#3b2412" />
          <rect x="26" y="6" width="8" height="78" fill="#5a3a1c" />
          <rect x="22" y="0" width="16" height="14" rx="2" fill="#3b2412" />
        </svg>
        <span className={label}>songs I wrote</span>
      </a>

      <a
        href={rooms.shelf}
        data-object
        className={`${object} top-[52%] left-[8%] w-[34%]`}
        aria-label="Every game I've beaten"
      >
        <svg viewBox="0 0 140 60" className="w-full" aria-hidden="true">
          <rect x="0" y="50" width="140" height="8" fill="#5a3a1c" />
          {["#e74c3c", "#3498db", "#f1c40f", "#2ecc71", "#9b59b6", "#e67e22", "#ecf0f1"].map(
            (fill, i) => (
              <rect
                key={fill}
                x={6 + i * 18}
                y={8 + ((i * 7) % 12)}
                width="16"
                height={42 - ((i * 7) % 12)}
                fill={fill}
              />
            ),
          )}
        </svg>
        <span className={label}>every game I&apos;ve beaten</span>
      </a>

      <a
        href={rooms.notebook}
        data-object
        className={`${object} bottom-[8%] left-[46%] w-[24%]`}
        aria-label="Things I write at night"
      >
        <svg viewBox="0 0 120 70" className="w-full" aria-hidden="true">
          <g transform="rotate(-6 60 36)">
            <rect x="4" y="6" width="112" height="60" rx="3" fill="#f5ecd7" />
            <path d="M16 22 H96 M16 34 H86 M16 46 H100" stroke="#8a7a5a" strokeWidth="2" />
          </g>
        </svg>
        <span className={label}>things I write at night</span>
      </a>

      <p
        aria-live="polite"
        className={`${HAND} pointer-events-none absolute inset-x-0 top-[38%] z-10 text-center text-6xl text-[#ffe2c2] opacity-0 transition-[opacity,scale] delay-300 duration-700 [text-shadow:0_0_24px_rgb(255_160_80/0.6)] group-data-[on=true]/room:scale-100 group-data-[on=true]/room:opacity-100 sm:text-7xl`}
      >
        {on ? `hey, I'm ${name}` : ""}
      </p>

      {/* The darkness, with a hole where the torch points */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_130px_at_var(--tx)_var(--ty),transparent_0,rgb(0_0_0/0.25)_55%,rgb(4_4_6/0.97)_100%)] transition-opacity duration-1000 group-data-[on=true]/room:opacity-0"
      />

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Light switch"
        onClick={() => setOn((o) => !o)}
        className="absolute top-5 right-5 z-20 h-12 w-8 rounded-md border border-zinc-600 bg-zinc-800 focus-visible:outline-2 focus-visible:outline-orange-400"
      >
        <span
          className={`absolute inset-x-2 h-4 rounded-sm transition-[top,background-color] duration-200 ${on ? "top-6 bg-orange-300" : "top-2 bg-zinc-500"}`}
        />
      </button>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.15em] text-white/50 uppercase">
        {on ? "click anything to step inside" : "move the torch · flip the switch"}
      </p>
    </section>
  );
}
