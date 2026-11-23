"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/** How far the cord must be pulled (px) before it switches; less than that is treated as a click. */
const PULL_TRIGGER = 16;
const PULL_MAX = 46;

/** The lamp's falloff over the room: 0 = fully lit, 1 = fully in shadow. */
const FALLOFF =
  "radial-gradient(ellipse 42% 105% at 50% -8%, transparent 0%, rgb(0 0 0 / 0.08) 18%, rgb(0 0 0 / 0.26) 34%, rgb(0 0 0 / 0.5) 50%, rgb(0 0 0 / 0.72) 66%, rgb(0 0 0 / 0.88) 82%, #000 100%)";

/** Warmth where the light falls (blended soft-light, so it tints rather than paints). */
const WALL_WASH =
  "radial-gradient(ellipse 34% 80% at 50% -6%, rgb(255 214 150 / 0.55) 0%, rgb(255 214 150 / 0.28) 35%, rgb(255 214 150 / 0.1) 60%, transparent 85%)";

/** The bright spot on the wall just under the fixture. */
const HOT_SPOT =
  "radial-gradient(ellipse 16% 22% at 50% -4%, rgb(255 244 220 / 0.32) 0%, rgb(255 238 205 / 0.12) 55%, transparent 100%)";

/** A barely-there cone of light in the air, soft at its sides. */
const HAZE =
  "conic-gradient(from 150deg at 50% -12%, transparent 0deg, rgb(255 232 190 / 0.05) 16deg, rgb(255 232 190 / 0.09) 30deg, rgb(255 232 190 / 0.05) 44deg, transparent 60deg)";

/** The haze thins out as it gets further from the lamp. */
const HAZE_FADE = "linear-gradient(180deg, #000 0%, rgb(0 0 0 / 0.6) 45%, transparent 95%)";

const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** A short mechanical click, synthesised so no audio file is needed. */
function playClick(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 6);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const tone = ctx.createBiquadFilter();
  tone.type = "bandpass";
  tone.frequency.value = 2400;
  const level = ctx.createGain();
  level.gain.value = 0.5;
  source.connect(tone).connect(level).connect(ctx.destination);
  source.start();
}

/**
 * A pull-cord switch hanging from the top of the hero. Pull it (drag down, or
 * click) and the parlour dims to evening, lit only by a soft beam falling from
 * the centre of the ceiling. It changes the hero only, not the page theme.
 */
export function RoomLights() {
  const [dim, setDim] = useState(false);
  const pullRef = useRef<HTMLButtonElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  useEffect(
    () => () => {
      void audioRef.current?.close().catch(() => undefined);
    },
    [],
  );

  /** Flips the lights, with a little flicker as the room goes down. */
  const toggle = () => {
    const next = !dim;
    setDim(next);
    try {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        audioRef.current ??= new AudioCtor();
        void audioRef.current.resume().catch(() => undefined);
        playClick(audioRef.current);
      }
    } catch {
      // Silent on devices without audio.
    }
    const shade = shadeRef.current;
    const beam = beamRef.current;
    if (!shade || !beam) return;
    gsap.killTweensOf([shade, beam]);
    if (reducedMotion()) {
      gsap.set([shade, beam], { opacity: next ? 1 : 0 });
      return;
    }
    if (next) {
      gsap
        .timeline()
        .to(shade, { opacity: 0.55, duration: 0.06 })
        .to(shade, { opacity: 0.15, duration: 0.08 })
        .to(shade, { opacity: 1, duration: 0.7, ease: "power2.out" })
        .fromTo(beam, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "sine.inOut" }, 0.35);
    } else {
      gsap.to(beam, { opacity: 0, duration: 0.4 });
      gsap.to(shade, { opacity: 0, duration: 0.6, ease: "power2.out" });
    }
  };

  /** Lets the cord spring back up after a pull. */
  const release = () => {
    if (!pullRef.current) return;
    gsap.to(pullRef.current, {
      y: 0,
      duration: reducedMotion() ? 0 : 0.9,
      ease: "elastic.out(1.1, 0.3)",
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startY: event.clientY, dy: 0 };
    gsap.killTweensOf(pullRef.current);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const dy = Math.max(0, Math.min(PULL_MAX, event.clientY - drag.current.startY));
    drag.current.dy = dy;
    gsap.set(pullRef.current, { y: dy });
  };

  const onPointerUp = () => {
    const pulled = drag.current?.dy ?? 0;
    drag.current = null;
    if (pulled < 4) {
      // a click: give it a quick tug of its own
      gsap.fromTo(
        pullRef.current,
        { y: 0 },
        { y: 22, duration: 0.12, ease: "power2.out", onComplete: release },
      );
      toggle();
      return;
    }
    if (pulled >= PULL_TRIGGER) toggle();
    release();
  };

  /** Keyboard users get the same tug. */
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    gsap.fromTo(
      pullRef.current,
      { y: 0 },
      { y: 22, duration: 0.12, ease: "power2.out", onComplete: release },
    );
    toggle();
  };

  return (
    <>
      {/*
        The room in shadow. Multiplying by a warm brown (rather than laying black
        over it) keeps the colours rich, the way a lamp-lit room looks to the eye.
        The mask is the lamp's falloff: clear under the fixture, then darkening
        smoothly with distance, roughly inverse-square.
      */}
      <div
        ref={shadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-[#3a2a1c] opacity-0 mix-blend-multiply"
        style={{ maskImage: FALLOFF, WebkitMaskImage: FALLOFF }}
      />
      <div
        ref={beamRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 opacity-0"
      >
        {/* warm light on the wall nearest the lamp: a soft scallop, brightest at the top */}
        <div className="absolute inset-0 mix-blend-soft-light" style={{ background: WALL_WASH }} />
        <div className="absolute inset-0" style={{ background: HOT_SPOT }} />
        {/* the faintest haze in the air: a cone with angular falloff, no hard edges anywhere */}
        <div
          className="absolute inset-0 blur-xl"
          style={{ background: HAZE, maskImage: HAZE_FADE, WebkitMaskImage: HAZE_FADE }}
        />
        {/* where the light lands on the floor */}
        <div className="absolute bottom-[-2vh] left-1/2 h-[14vh] w-[56%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_226_175/0.2),rgb(255_226_175/0.07)_60%,transparent)] blur-md" />
      </div>

      {/* the pull cord */}
      <div className="absolute top-0 right-6 z-40 flex flex-col items-center xl:right-auto xl:left-[18%]">
        <button
          ref={pullRef}
          type="button"
          aria-pressed={dim}
          aria-label={
            dim ? "Pull the cord to turn the lights back up" : "Pull the cord to dim the lights"
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className="group flex cursor-grab touch-none flex-col items-center select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a5426] active:cursor-grabbing"
        >
          {/* the twisted cotton cord */}
          <span
            aria-hidden="true"
            className="block h-28 w-[3px] rounded-full shadow-[1px_0_1px_rgb(60_40_20/0.3)] xl:h-[9.5rem]"
            style={{
              background: "repeating-linear-gradient(180deg, #efe4cd 0 3px, #c8b796 3px 5px)",
            }}
          />
          {/* brass cap, porcelain drop, brass foot */}
          <span
            aria-hidden="true"
            className="flex flex-col items-center drop-shadow-[2px_6px_5px_rgb(60_35_15/0.45)]"
          >
            <span className="h-2 w-2.5 rounded-t-[3px] bg-linear-to-r from-[#7a5a28] via-[#e6c77c] to-[#7a5a28]" />
            <span className="h-1.5 w-3.5 rounded-[2px] bg-linear-to-r from-[#6e4e20] via-[#d9b56a] to-[#6e4e20]" />
            <span
              className="-mt-px h-12 w-[1.15rem]"
              style={{
                borderRadius: "45% 45% 50% 50% / 30% 30% 70% 70%",
                background:
                  "radial-gradient(ellipse 60% 50% at 35% 55%, #fffdf6 0%, #efe6d2 45%, #cdbf9f 100%)",
              }}
            />
            <span className="-mt-1 h-2 w-3 rounded-b-[4px] bg-linear-to-r from-[#6e4e20] via-[#d9b56a] to-[#6e4e20]" />
            <span className="size-1.5 rounded-full bg-linear-to-r from-[#7a5a28] via-[#e6c77c] to-[#7a5a28]" />
          </span>
        </button>
        <span
          aria-hidden="true"
          className={`mt-2 font-[family-name:var(--font-serif)] text-[14px] whitespace-nowrap italic transition-opacity duration-500 ${dim ? "text-[#e9d9b6]" : "text-[#6a5a45]"}`}
        >
          {dim ? "pull for daylight" : "pull for evening"}
        </span>
      </div>
    </>
  );
}
