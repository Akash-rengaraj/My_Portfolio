"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { createBass, type Bass } from "./bass";
import { createSparkField, type SparkField } from "./spark-field";
import { SplitFlap } from "./split-flap";

gsap.registerPlugin(useGSAP);

const NAME = "AKASH";
export const TITLE = "Akash — off the clock";
export const ROLES = ["CODER", "RIDER", "GAMER", "GUITARIST", "POET", "BAKER"] as const;

type Phase = "intro" | "title" | "menu";

/** Brushed gold, with a band of light parked off to the right for the sheen sweep. */
const METAL: CSSProperties = {
  backgroundImage:
    "linear-gradient(105deg, transparent 42%, rgb(255 255 255 / 0.95) 50%, transparent 58%), linear-gradient(180deg, #ffffff 0%, #ffe6c2 26%, #d4924a 49%, #fff1d8 51%, #8a5426 100%)",
  backgroundSize: "300% 100%, 100% 100%",
  backgroundPosition: "150% 0, 0 0",
  backgroundRepeat: "no-repeat",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const RAYS: CSSProperties = {
  background:
    "repeating-conic-gradient(from 0deg, rgb(255 170 90 / 0.10) 0deg 4deg, transparent 4deg 14deg)",
  maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
  WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
};

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const menuItem =
  "group/item flex items-center gap-3 rounded-full px-6 py-2.5 font-mono text-sm tracking-[0.3em] text-white/75 uppercase outline-none transition-colors hover:bg-white/5 hover:text-[#ffd9a8] focus-visible:bg-white/8 focus-visible:text-[#ffd9a8] sm:text-base";

/** The "▸" that marks the menu item you're on. */
function Marker() {
  return (
    <span
      aria-hidden="true"
      className="text-[#ff9a3c] opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
    >
      ▸
    </span>
  );
}

/**
 * The personal side's opening, as a blockbuster title sequence: letterbox,
 * a lens flare, the name slamming in letter by letter (camera shake, sparks,
 * shockwaves, a metallic sheen), a departure-board of roles, then "press any
 * key" into a game-style menu. Optional sound is synthesised in the browser.
 */
export function TitleCardHero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const field = useRef<SparkField | null>(null);
  const bass = useRef<Bass | null>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const phaseRef = useRef<Phase>("intro");
  const [phase, setPhaseState] = useState<Phase>("intro");
  const [sound, setSound] = useState(false);
  const [run, setRun] = useState(0);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  /** A hit: sparks, a shockwave and a bass drop at an element, and a camera shake. */
  const impact = useCallback((el: Element | null, power: number) => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!el || !root || !stage) return;
    const box = root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - box.left + r.width / 2;
    const y = r.top - box.top + r.height * 0.82;
    field.current?.burst(x, y, power);
    field.current?.ring(x, y, power);
    bass.current?.hit(power);
    if (reducedMotion()) return;
    gsap.fromTo(
      stage,
      { x: (Math.random() - 0.5) * 18 * power, y: (Math.random() - 0.5) * 14 * power },
      { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.35)", overwrite: true },
    );
  }, []);

  const skipIntro = useCallback(() => {
    intro.current?.progress(1, true);
    setPhase("title");
  }, [setPhase]);

  const enterMenu = useCallback(() => {
    setPhase("menu");
    impact(nameRef.current, 2.4);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    gsap.to(q("[data-bar='top']"), { yPercent: -100, duration: 0.8, ease: "power3.inOut" });
    gsap.to(q("[data-bar='bottom']"), { yPercent: 100, duration: 0.8, ease: "power3.inOut" });
    gsap.fromTo(
      q("[data-menu-item]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.15 },
    );
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>("a, button")?.focus());
  }, [impact, setPhase]);

  const replay = () => {
    setPhase("intro");
    setRun((r) => r + 1);
  };

  // The canvas of sparks and the synth live as long as the hero.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sparks = createSparkField(canvas);
    const synth = createBass();
    field.current = sparks;
    bass.current = synth;
    return () => {
      sparks.destroy();
      synth.close();
    };
  }, []);

  // "Press any key": a key skips the intro, then opens the menu.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        ["Tab", "Shift", "Control", "Alt", "Meta"].includes(event.key)
      )
        return;
      if (phaseRef.current === "intro") skipIntro();
      else if (phaseRef.current === "title") {
        event.preventDefault();
        enterMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterMenu, skipIntro]);

  // The title sequence. Reduced motion lands on the final frame at once.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const reduce = Boolean(context.conditions?.reduce);
          const letters = q("[data-letter]");
          const tl = gsap.timeline({
            onComplete: () => {
              if (phaseRef.current === "intro") setPhase("title");
            },
          });
          intro.current = tl;

          tl.set(
            letters,
            { opacity: 0, scale: 3.4, filter: "blur(18px)", backgroundPosition: "150% 0, 0 0" },
            0,
          )
            .set(q("[data-bar='top']"), { yPercent: -100 }, 0)
            .set(q("[data-bar='bottom']"), { yPercent: 100 }, 0)
            .set(q("[data-flare]"), { scaleX: 0, opacity: 0 }, 0)
            .set(q("[data-starring]"), { opacity: 0, letterSpacing: "0.2em" }, 0)
            .set(q("[data-after]"), { opacity: 0, y: 16 }, 0)
            .set(q("[data-rays]"), { opacity: 0 }, 0);

          tl.to(q("[data-bar]"), { yPercent: 0, duration: 0.7, ease: "power3.out" }, 0)
            .to(
              q("[data-flare]"),
              {
                scaleX: 1,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
                onStart: () => bass.current?.whoosh(),
              },
              0.3,
            )
            .to(q("[data-flare]"), { opacity: 0, duration: 0.9 }, 1)
            .to(
              q("[data-starring]"),
              { opacity: 1, letterSpacing: "0.6em", duration: 1.2, ease: "power1.out" },
              0.5,
            )
            .to(q("[data-starring]"), { opacity: 0, duration: 0.4 }, 1.6);

          letters.forEach((letter, i) => {
            const last = i === letters.length - 1;
            tl.to(
              letter,
              {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.26,
                ease: "power4.in",
                onComplete: () => impact(letter, last ? 2.2 : 1 + i * 0.12),
              },
              1.7 + i * 0.24,
            );
          });

          tl.to(q("[data-rays]"), { opacity: 1, duration: 1.2 }, 2.9)
            .to(
              letters,
              {
                backgroundPosition: "-60% 0, 0 0",
                duration: 1.1,
                stagger: 0.07,
                ease: "power2.inOut",
              },
              3,
            )
            .to(q("[data-after]"), { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 }, 3.3);

          const spin = reduce
            ? null
            : gsap.to(q("[data-rays]"), { rotation: 360, duration: 120, repeat: -1, ease: "none" });

          if (reduce) {
            tl.progress(1, true);
            setPhase("title");
          }
          return () => {
            tl.kill();
            spin?.kill();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [run], revertOnUpdate: true },
  );

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (phaseRef.current === "intro") return;
    const root = rootRef.current;
    const name = nameRef.current;
    if (!root || !name) return;
    const box = root.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    name.style.setProperty("--tx", `${(px - 0.5) * 14}deg`);
    name.style.setProperty("--ty", `${(0.5 - py) * 10}deg`);
    if (!reducedMotion() && Math.random() < 0.6)
      field.current?.trail(event.clientX - box.left, event.clientY - box.top);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as Element).closest("a, button")) return;
    if (phaseRef.current === "intro") {
      skipIntro();
      return;
    }
    if (phaseRef.current === "title") {
      enterMenu();
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    field.current?.burst(x, y, 0.8);
    field.current?.ring(x, y, 0.6);
    bass.current?.hit(0.6);
  };

  const onMenuKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = (at + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  const toggleSound = () => {
    if (sound) {
      bass.current?.close();
      setSound(false);
      return;
    }
    bass.current?.unlock();
    setSound(true);
    replay();
  };

  return (
    <section
      ref={rootRef}
      data-phase={phase}
      aria-label={TITLE}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      className="group/hero relative isolate h-svh min-h-[36rem] w-full touch-manipulation overflow-hidden bg-[#050404] text-white select-none"
    >
      {/* Warm darkness, slow god rays, sparks */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_46%,#2c1508_0%,#0d0907_55%,#050404_100%)]"
      />
      <div
        aria-hidden="true"
        data-rays
        className="absolute top-1/2 left-1/2 size-[170vmax] -translate-x-1/2 -translate-y-1/2"
        style={RAYS}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
      />

      {/* The stage (this is what shakes) */}
      <div
        ref={stageRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-7 px-4 text-center"
      >
        <p data-starring className="font-mono text-[11px] text-[#ffb36b] uppercase sm:text-xs">
          the personal side of
        </p>
        <h1>
          <span className="sr-only">{TITLE}</span>
          <span
            ref={nameRef}
            aria-hidden="true"
            className="flex [transform:perspective(900px)_rotateX(var(--ty,0deg))_rotateY(var(--tx,0deg))] leading-[0.82] [filter:drop-shadow(0_0_34px_rgb(255_110_40/0.35))] transition-transform duration-300 ease-out"
          >
            {Array.from(NAME, (ch, i) => (
              <span
                key={i}
                data-letter
                className="inline-block text-[clamp(5.5rem,23vw,22rem)] font-black tracking-[-0.045em]"
                style={METAL}
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>

        <div data-after className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/45 uppercase">
            now showing
          </span>
          <SplitFlap words={ROLES} width={9} />
          <span className="sr-only">Coder, rider, gamer, guitarist, poet and baker.</span>
        </div>

        <div data-after className="min-h-24">
          <p className="font-mono text-xs tracking-[0.45em] text-white/70 uppercase group-data-[phase=menu]/hero:hidden">
            <span className="motion-safe:animate-pulse">press any key</span>
          </p>
          <nav
            ref={menuRef}
            aria-label="Personal menu"
            onKeyDown={onMenuKey}
            className="hidden flex-col items-center gap-1 group-data-[phase=menu]/hero:flex"
          >
            <Link href="/" data-menu-item className={menuItem}>
              <Marker />
              the developer side
            </Link>
            <Link href={{ pathname: "/", hash: "contact" }} data-menu-item className={menuItem}>
              <Marker />
              say hi
            </Link>
            <button type="button" data-menu-item onClick={replay} className={menuItem}>
              <Marker />
              replay the intro
            </button>
          </nav>
        </div>
      </div>

      {/* Lens flare, letterbox, grain, vignette */}
      <div
        aria-hidden="true"
        data-flare
        className="pointer-events-none absolute inset-x-0 top-1/2 z-30 h-[3px] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#4fd1ff_22%,#ffffff_50%,#ff9a3c_78%,transparent)] shadow-[0_0_60px_14px_rgb(255_170_90/0.4)]"
      />
      <div
        aria-hidden="true"
        data-bar="top"
        className="absolute inset-x-0 top-0 z-20 h-[9vh] bg-black"
      />
      <div
        aria-hidden="true"
        data-bar="bottom"
        className="absolute inset-x-0 bottom-0 z-20 h-[9vh] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 opacity-[0.08] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle,transparent_55%,rgb(0_0_0/0.7)_100%)]"
      />

      {/* Controls */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        className="absolute top-20 right-4 z-40 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-[11px] tracking-[0.2em] text-white/75 uppercase backdrop-blur-sm transition-colors hover:border-[#ff9a3c] hover:text-[#ffd9a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9a3c] sm:right-8"
      >
        {sound ? "♪ sound on" : "♪ sound off"}
      </button>
      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-[11vh] z-40 hidden font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase group-data-[phase=intro]/hero:block"
      >
        click to skip
      </p>
    </section>
  );
}
