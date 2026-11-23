"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

import { strumChord } from "./strum";

const BRASS = "bg-linear-to-b from-[#f6dc95] via-[#b8904a] to-[#6e4e20]";

const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * The Yamaha F310 on a wall hanger: a walnut plate on the wall and two brass
 * arms cradling the neck below the headstock. Click it to strum a G chord;
 * it swings a little on the hanger. `className` positions and sizes it.
 */
export function GuitarOnWall({ className = "" }: { className?: string }) {
  const swingRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      void ctxRef.current?.close().catch(() => undefined);
    },
    [],
  );

  /** Plays the chord (audio is only allowed after a click) and swings the guitar. */
  const strum = () => {
    try {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        ctxRef.current ??= new AudioCtor();
        const ctx = ctxRef.current;
        void ctx.resume().catch(() => undefined);
        strumChord(ctx);
      }
    } catch {
      // No audio on this device; the guitar still swings.
    }
    if (reducedMotion() || !swingRef.current) return;
    gsap.killTweensOf(swingRef.current);
    gsap.fromTo(
      swingRef.current,
      { rotation: 1.6 },
      { rotation: 0, duration: 2.2, ease: "elastic.out(1, 0.25)", transformOrigin: "50% 14%" },
    );
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={strum}
        aria-label="Strum my Yamaha F310"
        className="group relative block h-full w-fit cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#8a5426]"
      >
        {/* the walnut plate, behind the neck */}
        <span className="absolute top-[12.6%] left-1/2 h-[3.2%] w-[34%] -translate-x-1/2 rounded-[6px] bg-linear-to-b from-[#7a4a2a] to-[#4a2a16] shadow-[0_3px_6px_rgb(40_20_8/0.45),inset_0_1px_0_rgb(255_255_255/0.2)]" />
        <div ref={swingRef} className="relative h-full">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
          <img
            src="/personal/guitar.webp"
            alt=""
            className="h-full w-auto max-w-none drop-shadow-[8px_14px_12px_rgb(60_35_15/0.42)] transition-[filter] duration-300 group-hover:drop-shadow-[10px_18px_16px_rgb(60_35_15/0.5)]"
            draggable={false}
          />
        </div>
        {/* the brass arms, in front of the neck */}
        {[-1, 1].map((dir) => (
          <span
            key={dir}
            className={`absolute top-[12.9%] h-[3.6%] w-[3.4%] -translate-x-1/2 rounded-full ${BRASS} shadow-[1px_2px_3px_rgb(0_0_0/0.4)]`}
            style={{ left: `${50 + dir * 8}%` }}
          />
        ))}
        <span className="absolute inset-x-0 top-full mt-3 text-center font-[family-name:var(--font-serif)] text-[15px] text-[#6a5a45] italic opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          give it a strum
        </span>
      </button>
    </div>
  );
}
