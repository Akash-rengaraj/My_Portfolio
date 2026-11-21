"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { Confetti } from "@/components/world/confetti";
import {
  blastOver,
  blastRadius,
  LANTERN_RADIUS,
  LEVELS,
  passed,
  roundMessage,
  scaledRadius,
  touches,
} from "@/lib/one-spark";

import { saveBestScore, useBestScore } from "./use-best-score";

const BEST_KEY = "one-spark-best";
const COLORS = ["#ffb347", "#ff6b6b", "#ffd93d", "#ff8fb3", "#8ab4ff", "#c4b5fd", "#7ee8a1"];
/** Lanterns stay above the rooftops. */
const SKY_FLOOR = 0.74;

/** Deterministic star field in 0..1 space. */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 7919) % 1000) / 1000,
  y: (((i * 104729) % 1000) / 1000) * 0.7,
  r: 0.5 + ((i * 31) % 10) / 10,
  t: (i * 0.37) % (Math.PI * 2),
}));

interface Lantern {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  flicker: number;
}

interface Blast {
  x: number;
  y: number;
  age: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
}

type Phase = "ready" | "aim" | "burning" | "result" | "won";

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)] as T;

/** A fresh sky of drifting lanterns. */
function makeLanterns(count: number, w: number, h: number, slow: boolean): Lantern[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (18 + Math.random() * 26) * (slow ? 0.5 : 1);
    return {
      x: 20 + Math.random() * (w - 40),
      y: 20 + Math.random() * (h * SKY_FLOOR - 40),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: pick(COLORS),
      flicker: Math.random() * Math.PI * 2,
    };
  });
}

/** Adds a firework burst of `count` sparks to `into`. */
function burst(
  into: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
  small: boolean,
) {
  const n = small ? Math.ceil(count / 2) : count;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 50 + Math.random() * 130;
    into.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 0.9 + Math.random() * 0.7,
      color: Math.random() < 0.25 ? "#fff6d8" : color,
    });
  }
}

/** Gopuram-and-rooftops skyline along the bottom of the sky. */
function Skyline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] w-full"
    >
      <path
        fill="#0a0716"
        d="M0 120 V84 H40 V70 H72 V88 H110 V62 H150 V80 H190 V74 H214 V58 L226 58 L230 44 L238 44 L242 30 L252 30 L256 16 L270 16 L274 30 L284 30 L288 44 L296 44 L300 58 L312 58 V76 H350 V66 H392 V86 H430 V54 H470 V72 H520 V60 H556 V82 H600 V68 H640 V50 H676 V76 H720 V64 H760 V80 H800 V120 Z"
      />
      {[
        [56, 92],
        [126, 76],
        [134, 92],
        [368, 78],
        [444, 66],
        [452, 82],
        [534, 72],
        [652, 62],
        [652, 80],
        [736, 76],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="6" fill="#ffcf73" opacity="0.8" />
      ))}
    </svg>
  );
}

/**
 * One Spark: sky lanterns drift over Sivakasi after dark. You get one spark a
 * round — every blast that touches a lantern sets it off too, so pick the
 * crowded spot and watch the chain reaction light up the sky.
 */
export function OneSpark() {
  const reduced = useReducedMotion();
  const bestLevel = useBestScore(BEST_KEY);
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(0);
  const [caught, setCaught] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [party, setParty] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, "100px");

  const phaseRef = useRef<Phase>("ready");
  const levelRef = useRef(0);
  const caughtRef = useRef(0);
  const lanterns = useRef<Lantern[]>([]);
  const blasts = useRef<Blast[]>([]);
  const particles = useRef<Particle[]>([]);
  const aim = useRef({ x: 0, y: 0, visible: false });

  const current = LEVELS[level] ?? LEVELS[0]!;

  const setPhaseBoth = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const sky = () => {
    const canvas = canvasRef.current;
    return { w: canvas?.clientWidth || 800, h: canvas?.clientHeight || 440 };
  };

  const startLevel = (index: number) => {
    levelRef.current = index;
    caughtRef.current = 0;
    blasts.current = [];
    setLevel(index);
    setCaught(0);
    setCleared(false);
    const { w, h } = sky();
    lanterns.current = makeLanterns(LEVELS[index]?.lanterns ?? 8, w, h, reduced);
    aim.current = { x: w / 2, y: h * 0.4, visible: aim.current.visible };
    setPhaseBoth("aim");
  };

  const fire = (x: number, y: number) => {
    if (phaseRef.current !== "aim") return;
    blasts.current.push({ x, y, age: 0, color: "#fff3c4" });
    burst(particles.current, x, y, "#fff3c4", 18, reduced);
    setPhaseBoth("burning");
  };

  /** Primary action outside aiming: start, next level or retry. */
  const proceed = () => {
    const p = phaseRef.current;
    if (p === "ready" || p === "won") startLevel(0);
    else if (p === "result") startLevel(cleared ? levelRef.current + 1 : levelRef.current);
  };

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let last = performance.now();
    let frame = 0;
    let ambient = 0;
    const settle = (next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
    };
    // Ambient lanterns before the first game.
    if (phaseRef.current === "ready" && lanterns.current.length === 0) {
      lanterns.current = makeLanterns(
        12,
        canvas.clientWidth || 800,
        canvas.clientHeight || 440,
        reduced,
      );
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = scaledRadius(W);
      const phaseNow = phaseRef.current;

      // Stars.
      for (const star of STARS) {
        const twinkle = reduced ? 0.7 : 0.45 + 0.4 * Math.sin(now / 900 + star.t);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Lanterns drift and bounce inside the sky.
      const floor = H * SKY_FLOOR;
      for (const l of lanterns.current) {
        l.x += l.vx * dt;
        l.y += l.vy * dt;
        if (l.x < 12 || l.x > W - 12) {
          l.vx *= -1;
          l.x = Math.min(W - 12, Math.max(12, l.x));
        }
        if (l.y < 12 || l.y > floor) {
          l.vy *= -1;
          l.y = Math.min(floor, Math.max(12, l.y));
        }
        l.flicker += dt * 6;
      }

      // Blasts grow, catch lanterns, and fade.
      for (const blast of blasts.current) blast.age += dt;
      const fresh: Blast[] = [];
      lanterns.current = lanterns.current.filter((l) => {
        const hit = blasts.current.some((b) =>
          touches(l.x - b.x, l.y - b.y, blastRadius(b.age, R), LANTERN_RADIUS),
        );
        if (!hit) return true;
        fresh.push({ x: l.x, y: l.y, age: 0, color: l.color });
        burst(particles.current, l.x, l.y, l.color, 26, reduced);
        return false;
      });
      if (fresh.length && (phaseNow === "burning" || phaseNow === "aim")) {
        caughtRef.current += fresh.length;
        setCaught(caughtRef.current);
      }
      blasts.current = [...blasts.current.filter((b) => !blastOver(b.age)), ...fresh];

      // Round over once the last blast has faded.
      if (phaseNow === "burning" && blasts.current.length === 0) {
        const lvl = LEVELS[levelRef.current] ?? LEVELS[0]!;
        const ok = passed(lvl, caughtRef.current);
        setCleared(ok);
        if (ok) {
          saveBestScore(BEST_KEY, levelRef.current + 1);
          for (let i = 0; i < 3; i++) {
            burst(
              particles.current,
              W * (0.2 + Math.random() * 0.6),
              H * (0.15 + Math.random() * 0.3),
              pick(COLORS),
              40,
              reduced,
            );
          }
        }
        if (ok && levelRef.current === LEVELS.length - 1) {
          setParty((n) => n + 1);
          settle("won");
        } else {
          settle("result");
        }
      }

      // Idle fireworks while the menu cards are up.
      if (phaseNow === "ready" || phaseNow === "result" || phaseNow === "won") {
        ambient -= dt;
        if (ambient <= 0 && !reduced) {
          ambient = 1.1 + Math.random() * 1.2;
          burst(
            particles.current,
            W * (0.1 + Math.random() * 0.8),
            H * (0.1 + Math.random() * 0.35),
            pick(COLORS),
            34,
            false,
          );
        }
      }

      ctx.globalCompositeOperation = "lighter";

      // Blasts: a soft glow with a bright rim.
      for (const b of blasts.current) {
        const r = blastRadius(b.age, R);
        if (r <= 0) continue;
        const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        glow.addColorStop(0, `${b.color}cc`);
        glow.addColorStop(0.6, `${b.color}44`);
        glow.addColorStop(1, `${b.color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `${b.color}99`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Lanterns: warm glow and a bright core.
      for (const l of lanterns.current) {
        const pulse = 1 + 0.12 * Math.sin(l.flicker);
        const glow = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 20 * pulse);
        glow.addColorStop(0, `${l.color}aa`);
        glow.addColorStop(1, `${l.color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(l.x, l.y, 20 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.arc(l.x, l.y, LANTERN_RADIUS * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Firework particles with short trails.
      particles.current = particles.current.filter((p) => p.age < p.life);
      for (const p of particles.current) {
        const px = p.x;
        const py = p.y;
        p.age += dt;
        p.vy += 70 * dt;
        p.vx *= 1 - dt * 0.8;
        p.vy *= 1 - dt * 0.8;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - p.vx * 0.04, py - p.vy * 0.04);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Aim preview: exactly how big your spark will be.
      if (phaseNow === "aim" && aim.current.visible) {
        const { x, y } = aim.current;
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(255,243,196,0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#fff3c4";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  const pointAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const { x, y } = pointAt(event);
    aim.current = { x, y, visible: event.pointerType !== "touch" };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (phaseRef.current !== "aim") return;
    event.preventDefault();
    const { x, y } = pointAt(event);
    fire(x, y);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = 24;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move && phaseRef.current === "aim") {
      event.preventDefault();
      const { w, h } = sky();
      aim.current = {
        x: Math.min(w, Math.max(0, aim.current.x + move[0])),
        y: Math.min(h, Math.max(0, aim.current.y + move[1])),
        visible: true,
      };
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (phaseRef.current === "aim") fire(aim.current.x, aim.current.y);
      else proceed();
    }
  };

  const progress = Math.min(1, caught / current.goal);

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 select-none sm:h-[500px]"
      style={{ background: "linear-gradient(180deg, #090d2a 0%, #1c1346 55%, #4b1d4c 100%)" }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <Skyline />

      <div
        role="button"
        tabIndex={0}
        aria-label={
          phase === "aim"
            ? "Night sky. Move the spark with the mouse or arrow keys, then click or press Space to set it off."
            : "Night sky"
        }
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          aim.current.visible = false;
        }}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={`absolute inset-0 touch-manipulation rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ffd93d] ${
          phase === "aim" ? "cursor-none" : "cursor-default"
        }`}
      />

      {/* HUD */}
      {phase !== "ready" ? (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-4 font-mono text-xs text-white/85">
          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 tracking-[0.14em] uppercase backdrop-blur-sm">
            level {level + 1} / {LEVELS.length}
          </span>
          <div className="w-44 rounded-xl border border-white/15 bg-black/30 px-3 py-2 backdrop-blur-sm">
            <p className="flex justify-between tabular-nums">
              <span className="tracking-[0.12em] text-white/60 uppercase">lit</span>
              <span>
                {caught} / {current.goal}
              </span>
            </p>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full origin-left rounded-full bg-[#ffd93d] transition-transform duration-300"
                style={{ transform: `scaleX(${progress})` }}
              />
            </span>
          </div>
        </div>
      ) : null}

      {phase === "aim" ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-[26%] text-center font-hand text-2xl text-[#fff3c4]/80">
          one spark. make it count.
        </p>
      ) : null}

      {phase === "won" ? <Confetti key={party} /> : null}

      {/* Menu cards */}
      {phase === "ready" || phase === "result" || phase === "won" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-5">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/15 bg-[#120c2c]/75 p-6 text-center text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md">
            {phase === "ready" ? (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#ffd93d] uppercase">
                  sivakasi · after dark
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  Light up the sky.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Sky lanterns are drifting over town. You get{" "}
                  <span className="text-[#ffd93d]">one spark</span> per round — set it off where
                  they&apos;re crowded, and every lantern it touches goes off too.
                </p>
              </>
            ) : phase === "won" ? (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#ffd93d] uppercase">
                  all {LEVELS.length} levels
                </p>
                <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                  You lit up the whole sky.
                </p>
                <p className="mt-1 font-hand text-2xl text-[#ffb347]">Sivakasi would be proud.</p>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                  level {level + 1} · {caught} of {current.lanterns} lit
                </p>
                <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                  {cleared ? "Level cleared!" : `Needed ${current.goal}`}
                </p>
                <p className="mt-1 font-hand text-2xl text-[#ffb347]">
                  {roundMessage(current, caught)}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={proceed}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#ffd93d] px-6 font-mono text-xs font-semibold tracking-[0.14em] text-[#1c1346] uppercase shadow-[0_10px_30px_-10px_#ffd93d] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd93d]"
            >
              {phase === "ready"
                ? "light the first spark"
                : phase === "won"
                  ? "play again"
                  : cleared
                    ? "next level →"
                    : "try again"}
            </button>
            <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-white/50 uppercase">
              best · level {bestLevel} of {LEVELS.length}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
