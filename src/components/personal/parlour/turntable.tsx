"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { RECORDS, recordSrc, type VinylRecord } from "./records";

/** The arm's rest angle and its angle with the needle on the outer grooves. */
const ARM_REST = 0;
const ARM_PLAY = 36;
const ARM_PIVOT = "262 40";
/** One revolution at 33⅓ rpm. */
const REV_SECONDS = 1.8;
const VOLUME = 0.85;

const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** A record's face: centre label, run-out, then fine grooves. */
const vinylFace = (label: string): CSSProperties => ({
  background: `radial-gradient(circle, #0c0c0d 0 2.6%, ${label} 3% 32%, #0b0b0c 32.6% 35%, transparent 35.4%), repeating-radial-gradient(circle, #121214 0 1px, #1e1e22 1.4px 2.3px), #121214`,
});

/** Light catching the grooves. It doesn't turn with the record, which is what sells the spin. */
const SHEEN: CSSProperties = {
  background:
    "conic-gradient(from 20deg, transparent 0deg 18deg, rgb(255 255 255 / 0.16) 34deg, transparent 52deg 196deg, rgb(255 255 255 / 0.11) 214deg, transparent 232deg)",
};

const WALNUT: CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(255 255 255 / 0.14), rgb(0 0 0 / 0.2)), repeating-linear-gradient(93deg, #6b3f22 0 7px, #77492b 7px 10px, #5d351c 10px 17px, #6f4224 17px 22px)",
};

const WALNUT_DARK: CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(0 0 0 / 0.1), rgb(0 0 0 / 0.35)), repeating-linear-gradient(90deg, #5a331b 0 6px, #64391f 6px 11px, #4e2c17 11px 16px)",
};

/** The record's paper label: title and composer around the spindle. */
function Label({ record }: { record: VinylRecord }) {
  return (
    <span className="absolute inset-0 grid place-items-center">
      <span className="flex max-w-[3.8rem] flex-col items-center text-center font-[family-name:var(--font-serif)] text-[8.5px] leading-tight text-black/75">
        <span className="font-semibold">{record.title}</span>
        <span className="mt-1 text-[6px] tracking-[0.12em] uppercase opacity-80">
          {record.composer}
        </span>
      </span>
    </span>
  );
}

/**
 * The record corner: three records mounted on the wall above a walnut side table
 * with a turntable on it. Click a record and it lifts off its nail and flies
 * onto the platter, the arm swings over, the platter spins up and the music
 * fades in. Click it again (or another) to stop or swap.
 */
export function Turntable() {
  const rootRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<SVGGElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const [current, setCurrent] = useState<VinylRecord | null>(null);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(
    () => () => {
      spinRef.current?.kill();
      audioRef.current?.pause();
    },
    [],
  );

  /** Lifts the arm, lets the platter coast to a stop and fades the music out. */
  const stop = () => {
    const audio = audioRef.current;
    if (audio) gsap.to(audio, { volume: 0, duration: 0.5, onComplete: () => audio.pause() });
    gsap.to(armRef.current, {
      rotation: ARM_REST,
      svgOrigin: ARM_PIVOT,
      duration: 0.9,
      ease: "power2.inOut",
    });
    const spin = spinRef.current;
    if (spin)
      gsap.to(spin, {
        timeScale: 0,
        duration: 1.6,
        ease: "power2.out",
        onComplete: () => spin.pause(),
      });
    setPlaying(false);
  };

  /** Arm over, platter up to speed, music in. */
  const start = (record: VinylRecord, audio: HTMLAudioElement) => {
    setCurrent(record);
    setPlaying(true);
    const reduce = reducedMotion();
    gsap.to(armRef.current, {
      rotation: ARM_PLAY,
      svgOrigin: ARM_PIVOT,
      duration: reduce ? 0 : 0.9,
      ease: "power2.inOut",
    });
    if (!reduce) {
      spinRef.current?.kill();
      spinRef.current = gsap.to(discRef.current, {
        rotation: "+=360",
        duration: REV_SECONDS,
        ease: "none",
        repeat: -1,
      });
      spinRef.current.timeScale(0);
      gsap.to(spinRef.current, { timeScale: 1, duration: 1.2, ease: "power1.in" });
    }
    gsap.to(audio, { volume: VOLUME, duration: 1.2, delay: reduce ? 0 : 0.8 });
  };

  const choose = (record: VinylRecord, event: MouseEvent<HTMLButtonElement>) => {
    if (current?.id === record.id && playing) {
      stop();
      return;
    }
    if (playing) stop();
    setMissing(false);

    // Start the audio inside the click (browsers only allow sound after a gesture), silent at first.
    audioRef.current?.pause();
    const audio = new Audio(recordSrc(record));
    audio.volume = 0;
    audio.addEventListener("ended", stop, { once: true });
    audioRef.current = audio;
    const root = rootRef.current;
    const fly = flyRef.current;
    const disc = discRef.current;
    // If the file can't play, the record goes back on the wall instead of onto the platter.
    let failed = false;
    audio.play().catch(() => {
      failed = true;
      if (fly) {
        gsap.killTweensOf(fly);
        gsap.set(fly, { display: "none" });
      }
      setMissing(true);
      if (audioRef.current === audio) stop();
    });

    if (reducedMotion() || !root || !fly || !disc) {
      start(record, audio);
      return;
    }
    // The corner may be scaled down on mid-size screens; convert screen pixels to its own.
    const box = root.getBoundingClientRect();
    const scale = box.width / root.offsetWidth || 1;
    const from = event.currentTarget.getBoundingClientRect();
    const to = disc.getBoundingClientRect();
    Object.assign(fly.style, vinylFace(record.label));
    gsap.set(fly, {
      display: "block",
      x: (from.left - box.left) / scale,
      y: (from.top - box.top) / scale,
      width: from.width / scale,
      height: from.height / scale,
      rotation: 0,
    });
    gsap.to(fly, {
      x: (to.left - box.left) / scale,
      y: (to.top - box.top) / scale,
      width: to.width / scale,
      height: to.height / scale,
      rotation: 300,
      duration: 1,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(fly, { display: "none" });
        if (!failed) start(record, audio);
      },
    });
  };

  return (
    <div ref={rootRef} className="relative flex w-[25rem] flex-col items-center">
      {/* Records mounted flat on the wall */}
      <ul className="flex w-full items-start justify-between px-1">
        {RECORDS.map((record, i) => {
          const away = current?.id === record.id && playing;
          return (
            <li key={record.id} style={{ marginTop: `${[0.8, 0, 1.4][i] ?? 0}rem` }}>
              <button
                type="button"
                onClick={(event) => choose(record, event)}
                aria-pressed={away}
                aria-label={`${away ? "Stop" : "Play"} ${record.title} by ${record.composer}`}
                className="relative block size-[7.5rem] rounded-full shadow-[3px_9px_12px_-3px_rgb(60_35_15/0.55),1px_2px_3px_rgb(60_35_15/0.35)] transition-[opacity,scale,translate] duration-500 hover:-translate-y-1 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a5426] aria-pressed:opacity-0"
                style={vinylFace(record.label)}
              >
                <span aria-hidden="true" className="absolute inset-0 rounded-full" style={SHEEN} />
                <Label record={record} />
              </button>
            </li>
          );
        })}
      </ul>

      <p
        aria-live="polite"
        className="mt-4 min-h-10 text-center font-[family-name:var(--font-serif)] text-[17px] leading-snug text-[#2b2118]"
      >
        {missing ? (
          "This record is still on its way."
        ) : current && playing ? (
          <>
            <span className="italic">now playing</span> — {current.title}
            <span className="block text-[13px] text-[#6a5a45]">
              {current.composer} · {current.performer}
            </span>
          </>
        ) : (
          <span className="text-[#6a5a45] italic">take a record off the wall</span>
        )}
      </p>

      {/* The turntable */}
      <div
        className="relative z-10 mt-3 h-[13.75rem] w-[19rem] rounded-[14px] shadow-[0_18px_24px_-16px_rgb(20_12_5/0.8),0_2px_0_rgb(255_255_255/0.25)_inset,0_-3px_0_rgb(0_0_0/0.25)_inset]"
        style={WALNUT}
      >
        {/* platter */}
        <div
          aria-hidden="true"
          className="absolute top-[16px] left-[24px] size-[192px] rounded-full bg-[conic-gradient(#d9d9de,#9c9ca4,#e8e8ec,#8f8f97,#d9d9de,#a3a3ab,#e3e3e8,#9c9ca4,#d9d9de)] p-[6px] shadow-[0_6px_14px_rgb(0_0_0/0.45)]"
        >
          <div className="relative size-full rounded-full bg-[#141416]">
            <div
              ref={discRef}
              className={`absolute inset-[3px] rounded-full transition-opacity duration-300 ${current ? "opacity-100" : "opacity-0"}`}
              style={vinylFace(current?.label ?? "#333")}
            >
              {current ? <Label record={current} /> : null}
            </div>
            <div className="absolute inset-[3px] rounded-full" style={SHEEN} />
            <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-white to-zinc-400" />
          </div>
        </div>

        {/* tonearm */}
        <svg
          viewBox="0 0 304 220"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="arm-metal" x1="0" x2="1">
              <stop offset="0" stopColor="#f1f1f4" />
              <stop offset=".5" stopColor="#a6a6ae" />
              <stop offset="1" stopColor="#e2e2e6" />
            </linearGradient>
          </defs>
          <circle cx="262" cy="40" r="17" fill="#2a2a2e" />
          <circle cx="262" cy="40" r="11" fill="url(#arm-metal)" />
          <g ref={armRef}>
            <rect x="258" y="14" width="8" height="16" rx="2" fill="#3a3a40" />
            <path
              d="M262 40 L262 168 L254 194"
              stroke="url(#arm-metal)"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="244"
              y="190"
              width="16"
              height="12"
              rx="2"
              fill="#1f1f23"
              transform="rotate(20 252 196)"
            />
            <circle cx="262" cy="40" r="4" fill="#55555c" />
          </g>
          <rect x="276" y="186" width="10" height="20" rx="3" fill="#2a2a2e" />
        </svg>

        <span
          aria-hidden="true"
          className={`absolute bottom-4 left-4 size-2 rounded-full transition-colors ${playing ? "bg-amber-400 shadow-[0_0_8px_rgb(251_191_36/0.9)]" : "bg-[#3a2a1c]"}`}
        />
        <span
          aria-hidden="true"
          className="absolute right-4 bottom-3 font-mono text-[9px] tracking-[0.2em] text-[#f3e3c8]/70"
        >
          33 · 45
        </span>
      </div>

      {/* The side table */}
      <div aria-hidden="true" className="relative w-[21rem]">
        <div
          className="relative h-4 rounded-[3px] shadow-[0_2px_0_rgb(255_255_255/0.2)_inset,0_6px_10px_-4px_rgb(0_0_0/0.6)]"
          style={WALNUT}
        />
        <div className="mx-3 h-9 shadow-[0_8px_12px_-6px_rgb(0_0_0/0.55)]" style={WALNUT_DARK}>
          <div className="mx-auto h-full w-1/2 border-x border-black/25 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]">
            <span className="mx-auto mt-3.5 block h-2 w-8 rounded-full bg-linear-to-b from-[#f0d58e] via-[#b38a45] to-[#6a4a1e]" />
          </div>
        </div>
        <div className="mx-5 flex justify-between">
          {[0, 1].map((leg) => (
            <span
              key={leg}
              className="block h-[clamp(7rem,17vh,11rem)] w-4"
              style={{ ...WALNUT_DARK, clipPath: "polygon(0 0, 100% 0, 78% 100%, 22% 100%)" }}
            />
          ))}
        </div>
        <span className="absolute -bottom-2 left-1/2 h-4 w-[110%] -translate-x-1/2 rounded-[50%] bg-black/30 blur-md" />
      </div>

      {/* the record in flight */}
      <div
        ref={flyRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-30 hidden rounded-full shadow-[0_12px_24px_rgb(0_0_0/0.45)]"
      />
    </div>
  );
}
