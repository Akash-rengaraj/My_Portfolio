"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { saveBestScore, useBestScore } from "@/components/play/use-best-score";
import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { Confetti } from "@/components/world/confetti";
import { SKILL_DOMAINS } from "@/content/skills";
import {
  along,
  axisFor,
  BASE_SIZE,
  drop,
  sizeOf,
  SLAB_HEIGHT,
  speedFor,
  startOf,
  TRAVEL,
  verdictFor,
  type Axis,
  type Slab,
} from "@/lib/stack-game";

const BEST_KEY = "stack-it-best";
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

/** Skills in round-robin order across the layers, so every slab changes colour. */
const SEQUENCE: readonly { label: string; hue: string }[] = (() => {
  const out: { label: string; hue: string }[] = [];
  const longest = Math.max(...SKILL_DOMAINS.map((d) => d.skills.length));
  for (let i = 0; i < longest; i++) {
    for (const domain of SKILL_DOMAINS) {
      const skill = domain.skills[i];
      if (skill) out.push({ label: skill, hue: domain.hue });
    }
  }
  return out;
})();

const BASE: Slab = {
  x: -BASE_SIZE / 2,
  z: -BASE_SIZE / 2,
  w: BASE_SIZE,
  d: BASE_SIZE,
  y: 0,
  hue: "#a59f94",
  label: "foundations",
};

interface Moving {
  slab: Slab;
  axis: Axis;
  offset: number;
  dir: 1 | -1;
  speed: number;
}

interface Fading {
  slab: Slab;
  vy: number;
  age: number;
}

type Phase = "ready" | "playing" | "over";

function skillFor(level: number) {
  return SEQUENCE[(level - 1) % SEQUENCE.length] ?? { label: "skill", hue: "#8ab4ff" };
}

/** A new slab for `level`, starting at the far end of its run over `below`. */
function makeMoving(level: number, below: Slab, slow: boolean): Moving {
  const axis = axisFor(level);
  const { label, hue } = skillFor(level);
  const slab = along(
    { ...below, y: level * SLAB_HEIGHT, label, hue },
    axis,
    startOf(below, axis) - TRAVEL,
    sizeOf(below, axis),
  );
  return { slab, axis, offset: -TRAVEL, dir: 1, speed: speedFor(level) * (slow ? 0.6 : 1) };
}

/** Darkens a #rrggbb colour by `amount` (0..1). */
function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const f = 1 - amount;
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Stack It: build the stack one skill at a time. Each slab slides over the
 * tower; tap, click or press Space to drop it. Whatever overhangs is sliced
 * off, and a perfect drop keeps the tower wide.
 */
export function StackIt() {
  const reduced = useReducedMotion();
  const best = useBestScore(BEST_KEY);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [current, setCurrent] = useState(skillFor(1));
  const [newBest, setNewBest] = useState(false);
  const [party, setParty] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, "100px");

  const phaseRef = useRef<Phase>("ready");
  const tower = useRef<Slab[]>([BASE]);
  const moving = useRef<Moving | null>(null);
  const debris = useRef<Fading[]>([]);
  const rings = useRef<Fading[]>([]);
  const pops = useRef<{ text: string; age: number }[]>([]);
  const streakRef = useRef(0);

  const setPhaseBoth = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const spawn = (level: number) => {
    const below = tower.current[tower.current.length - 1] ?? BASE;
    moving.current = makeMoving(level, below, reduced);
    setCurrent(skillFor(level));
  };

  const start = () => {
    tower.current = [BASE];
    debris.current = [];
    rings.current = [];
    pops.current = [];
    streakRef.current = 0;
    setScore(0);
    setStreak(0);
    setNewBest(false);
    spawn(1);
    setPhaseBoth("playing");
  };

  /** One input: start, drop, or restart, depending on the phase. */
  const act = () => {
    if (phaseRef.current !== "playing") {
      start();
      return;
    }
    const slab = moving.current;
    const below = tower.current[tower.current.length - 1];
    if (!slab || !below) return;

    const result = drop(below, slab.slab, slab.axis);
    if (result.debris) debris.current.push({ slab: result.debris, vy: 0, age: 0 });
    if (!result.placed) {
      moving.current = null;
      const height = tower.current.length - 1;
      const beat = saveBestScore(BEST_KEY, height);
      setNewBest(beat);
      if (beat) setParty((n) => n + 1);
      setPhaseBoth("over");
      return;
    }

    tower.current.push(result.placed);
    const height = tower.current.length - 1;
    setScore(height);
    if (result.perfect) {
      streakRef.current += 1;
      rings.current.push({ slab: result.placed, vy: 0, age: 0 });
      pops.current.push({
        text: streakRef.current > 1 ? `perfect ×${streakRef.current}` : "perfect!",
        age: 0,
      });
    } else {
      streakRef.current = 0;
    }
    setStreak(streakRef.current);
    spawn(height + 1);
  };

  // Demo slab sliding before the first game.
  useEffect(() => {
    if (!moving.current) moving.current = makeMoving(1, BASE, reduced);
  }, [reduced]);

  // Render loop (only while on screen).
  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const styles = getComputedStyle(canvas);
    const mono = styles.getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";
    let camera = 0;
    let zoom = 1;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Size the backing store to the element.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Slide the moving slab back and forth over the tower.
      const m = moving.current;
      const below = tower.current[tower.current.length - 1] ?? BASE;
      if (m) {
        m.offset += m.dir * m.speed * dt;
        if (m.offset > TRAVEL) {
          m.offset = TRAVEL;
          m.dir = -1;
        } else if (m.offset < -TRAVEL) {
          m.offset = -TRAVEL;
          m.dir = 1;
        }
        m.slab = along(m.slab, m.axis, startOf(below, m.axis) + m.offset, sizeOf(m.slab, m.axis));
      }

      // Camera follows the top; after a game it pulls back to show the whole tower.
      const height = tower.current.length;
      const over = phaseRef.current === "over";
      const baseScale = Math.min(W / (BASE_SIZE * 2.9), H / (BASE_SIZE * 2.3));
      const towerUnits = (height + 2) * SLAB_HEIGHT + BASE_SIZE;
      const zoomTarget = over ? Math.min(1, (H * 0.78) / (towerUnits * baseScale)) : 1;
      const cameraTarget = over
        ? (height * SLAB_HEIGHT) / 2 - BASE_SIZE * 0.3
        : Math.max(0, height - 5) * SLAB_HEIGHT;
      const ease = Math.min(1, dt * 4);
      camera += (cameraTarget - camera) * ease;
      zoom += (zoomTarget - zoom) * ease;

      const s = baseScale * zoom;
      const ox = W / 2;
      const oy = H * 0.64 + camera * s;
      const project = (x: number, y: number, z: number): [number, number] => [
        ox + (x - z) * COS * s,
        oy + ((x + z) * SIN - y) * s,
      ];

      const ink = styles.getPropertyValue("--stage-foreground").trim() || "#1b1a17";

      const drawSlab = (slab: Slab, alpha = 1, bottom = slab.y, top = slab.y + SLAB_HEIGHT) => {
        const { x, z, w, d } = slab;
        const poly = (points: [number, number][], fill: string) => {
          ctx.beginPath();
          points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.12)";
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        ctx.globalAlpha = alpha;
        // +z face, +x face, then the top.
        poly(
          [
            project(x, top, z + d),
            project(x + w, top, z + d),
            project(x + w, bottom, z + d),
            project(x, bottom, z + d),
          ],
          shade(slab.hue, 0.18),
        );
        poly(
          [
            project(x + w, top, z),
            project(x + w, top, z + d),
            project(x + w, bottom, z + d),
            project(x + w, bottom, z),
          ],
          shade(slab.hue, 0.34),
        );
        poly(
          [
            project(x, top, z),
            project(x + w, top, z),
            project(x + w, top, z + d),
            project(x, top, z + d),
          ],
          slab.hue,
        );

        // Label printed along the front face.
        const fontSize = SLAB_HEIGHT * s * 0.52;
        if (fontSize >= 7) {
          ctx.save();
          const [px, py] = project(x + 5, top - SLAB_HEIGHT * 0.7, z + d);
          ctx.transform(COS, SIN, 0, 1, px, py);
          ctx.font = `600 ${fontSize}px ${mono}`;
          ctx.fillStyle = "rgba(20,18,15,0.72)";
          let text = slab.label;
          const room = w * s - 10;
          while (text.length > 1 && ctx.measureText(text).width > room) text = text.slice(0, -1);
          if (text.length > 1)
            ctx.fillText(text === slab.label ? text : `${text.slice(0, -1)}…`, 0, 0);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      };

      // Soft shadow under the pedestal.
      const [sx, sy] = project(0, -SLAB_HEIGHT * 3, 0);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(sx, sy + 12 * s, BASE_SIZE * s, BASE_SIZE * s * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();

      tower.current.forEach((slab, i) =>
        i === 0 ? drawSlab(slab, 1, -SLAB_HEIGHT * 3, SLAB_HEIGHT) : drawSlab(slab),
      );
      if (m && phaseRef.current !== "over") drawSlab(m.slab);

      // Falling offcuts.
      debris.current = debris.current.filter((piece) => piece.age < 1.4);
      for (const piece of debris.current) {
        piece.age += dt;
        piece.vy -= 700 * dt;
        piece.slab = { ...piece.slab, y: piece.slab.y + piece.vy * dt };
        drawSlab(piece.slab, Math.max(0, 1 - piece.age / 1.2));
      }

      // Perfect-drop rings.
      rings.current = rings.current.filter((ring) => ring.age < 0.6);
      for (const ring of rings.current) {
        ring.age += dt;
        const grow = 1 + ring.age * 0.7;
        const { x, z, w, d, y } = ring.slab;
        const cx = x + w / 2;
        const cz = z + d / 2;
        const top = y + SLAB_HEIGHT;
        const corners: [number, number][] = [
          [x, z],
          [x + w, z],
          [x + w, z + d],
          [x, z + d],
        ];
        ctx.beginPath();
        corners.forEach(([px, pz], i) => {
          const [qx, qy] = project(cx + (px - cx) * grow, top, cz + (pz - cz) * grow);
          if (i) ctx.lineTo(qx, qy);
          else ctx.moveTo(qx, qy);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(255,255,255,${1 - ring.age / 0.6})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Floating "perfect!" text.
      pops.current = pops.current.filter((pop) => pop.age < 0.9);
      for (const pop of pops.current) {
        pop.age += dt;
        const [px, py] = project(0, height * SLAB_HEIGHT + 34 + pop.age * 30, 0);
        ctx.globalAlpha = Math.max(0, 1 - pop.age / 0.9);
        ctx.font = `700 ${Math.max(14, 20 * zoom)}px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillStyle = ink;
        ctx.fillText(pop.text, px, py);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    act();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      act();
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-line select-none sm:h-[500px]"
      style={{
        backgroundImage:
          "radial-gradient(70% 60% at 50% 40%, color-mix(in srgb, var(--cool) 10%, transparent), transparent), linear-gradient(var(--blueprint-line) 1px, transparent 1px), linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 24px 24px, 24px 24px",
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />

      {/* The whole sky is the button: tap / click / Space to drop. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={
          phase === "playing"
            ? `Drop ${current.label}. Tower height ${score}.`
            : "Start a new game of Stack It"
        }
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-pointer touch-manipulation rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal"
      />

      {/* Scoreboard */}
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <div className="rounded-xl border border-line bg-surface/85 px-4 py-2 backdrop-blur-sm">
          <p className="font-heading text-3xl leading-none font-semibold tabular-nums">{score}</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
            layers · best {best}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {phase === "playing" ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/85 px-3 py-1.5 font-mono text-xs backdrop-blur-sm">
              <span className="size-2.5 rounded-[3px]" style={{ background: current.hue }} />
              next: {current.label}
            </span>
          ) : null}
          {streak > 1 ? (
            <span className="rounded-full bg-signal px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
              combo ×{streak}
            </span>
          ) : null}
        </div>
      </div>

      {party > 0 && phase === "over" && newBest ? <Confetti key={party} /> : null}

      {/* Start / game-over card */}
      {phase !== "playing" ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-surface/90 p-5 text-center shadow-[0_20px_40px_-24px_var(--shadow-ink)] backdrop-blur-md">
            {phase === "ready" ? (
              <>
                <p className="font-heading text-xl font-semibold tracking-tight">
                  Build the stack, one skill at a time.
                </p>
                <p className="mt-1 text-sm text-stage-foreground/70">
                  Tap, click or press Space to drop each slab. Overhangs get sliced off — line it up
                  perfectly to keep it wide.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-stage-muted uppercase">
                  {newBest ? "new personal best" : "stack complete"}
                </p>
                <p className="mt-1 font-heading text-3xl font-semibold tracking-tight">
                  {score} {score === 1 ? "layer" : "layers"}
                </p>
                <p className="mt-1 font-hand text-2xl text-signal">{verdictFor(score)}</p>
              </>
            )}
            <button
              type="button"
              onClick={start}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-stage-foreground px-5 font-mono text-xs tracking-[0.14em] text-stage uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {phase === "ready" ? "start building" : "build again"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
