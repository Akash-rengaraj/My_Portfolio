"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

/** Deterministic pseudo-random numbers, so server and client render the same motes. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const rand = seeded(1897);
const MOTES = Array.from({ length: 26 }, () => ({
  left: 28 + rand() * 44,
  top: 18 + rand() * 60,
  size: 1.5 + rand() * 2.5,
  drift: 20 + rand() * 40,
  duration: 9 + rand() * 10,
}));

/** Dust drifting in the light from the window. */
export function DustMotes() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils
        .selector(rootRef)("[data-mote]")
        .forEach((mote, i) => {
          const m = MOTES[i]!;
          gsap.fromTo(
            mote,
            { y: 0, x: 0, opacity: 0 },
            {
              keyframes: {
                y: [0, -m.drift * 0.6, -m.drift],
                x: [0, m.drift * 0.3, -m.drift * 0.2],
                opacity: [0, 0.8, 0],
              },
              duration: m.duration,
              ease: "sine.inOut",
              repeat: -1,
              delay: -i * 0.7,
            },
          );
        });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
      {MOTES.map((m, i) => (
        <span
          key={i}
          data-mote
          className="absolute rounded-full bg-[#fff6dc] opacity-0 shadow-[0_0_6px_rgb(255_240_200/0.9)]"
          style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size }}
        />
      ))}
    </div>
  );
}
