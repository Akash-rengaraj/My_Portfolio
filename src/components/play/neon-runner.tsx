"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { Confetti } from "@/components/world/confetti";
import {
  COFFEE_POINTS,
  GROUND,
  jump,
  makeThing,
  nextGap,
  overlaps,
  RUNNER,
  RUNNER_X,
  runnerBox,
  runnerVerdict,
  scoreFor,
  speedAt,
  START_RUNNER,
  stepRunner,
  WORLD_HEIGHT,
  type Runner,
  type Thing,
} from "@/lib/neon-runner";

import { saveBestScore, useBestScore } from "./use-best-score";

const BEST_KEY = "neon-runner-best";
const JUMP_KEYS = new Set([" ", "ArrowUp", "w", "W", "Enter"]);

/** Deterministic skyline: [width, height] pairs, repeated to fill the screen. */
function skyline(seed: number, count: number, minH: number, maxH: number): [number, number][] {
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => [40 + random() * 70, minH + random() * (maxH - minH)]);
}
const FAR = skyline(11, 24, 40, 130);
const NEAR = skyline(97, 20, 30, 95);
const FAR_WIDTH = FAR.reduce((sum, [w]) => sum + w, 0);
const NEAR_WIDTH = NEAR.reduce((sum, [w]) => sum + w, 0);

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  color: string;
}

type Phase = "ready" | "running" | "over";

/**
 * Neon Runner: a little dev-bot sprints through a synthwave city at night.
 * Tap, click or press Space to jump (hold for higher, tap again mid-air to
 * double-jump) over bugs, and grab coffee for bonus points.
 */
export function NeonRunner() {
  const reduced = useReducedMotion();
  const best = useBestScore(BEST_KEY);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [coffees, setCoffees] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [party, setParty] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, "100px");

  const phaseRef = useRef<Phase>("ready");
  const runner = useRef<Runner>(START_RUNNER);
  const things = useRef<Thing[]>([]);
  const sparks = useRef<Spark[]>([]);
  const holding = useRef(false);
  const run = useRef({ time: 0, distance: 0, coffees: 0, nextAt: 700, id: 0, shake: 0 });

  const start = () => {
    runner.current = START_RUNNER;
    things.current = [];
    sparks.current = [];
    run.current = { time: 0, distance: 0, coffees: 0, nextAt: 700, id: 0, shake: 0 };
    setScore(0);
    setCoffees(0);
    setNewBest(false);
    phaseRef.current = "running";
    setPhase("running");
  };

  const press = () => {
    holding.current = true;
    if (phaseRef.current !== "running") {
      start();
      return;
    }
    runner.current = jump(runner.current);
  };

  const release = () => {
    holding.current = false;
  };

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let last = performance.now();
    let frame = 0;
    let lastScore = -1;
    let idleScroll = 0;

    const burst = (x: number, y: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 80 + Math.random() * 260;
        sparks.current.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 120,
          age: 0,
          color,
        });
      }
    };

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
      const k = H / WORLD_HEIGHT;
      const worldW = W / k;
      const state = run.current;
      const running = phaseRef.current === "running";

      // --- simulate -------------------------------------------------------
      let speed = 0;
      if (running) {
        state.time += dt;
        speed = speedAt(state.time) * (reduced ? 0.8 : 1);
        state.distance += speed * dt;
        runner.current = stepRunner(runner.current, dt, holding.current);

        // Spawn ahead of the screen.
        while (state.nextAt < state.distance + worldW + 60) {
          state.id += 1;
          things.current.push(makeThing(state.id, state.nextAt, Math.random()));
          state.nextAt += nextGap(speed, Math.random());
        }
        // Collide (positions are in distance space; the runner sits at RUNNER_X).
        const box = runnerBox(runner.current);
        const offset = state.distance;
        things.current = things.current.filter((thing) => {
          const screenX = thing.x - offset;
          if (screenX + thing.w < -40) return false;
          if (phaseRef.current !== "running") return true;
          const hit = overlaps(box, { ...thing, x: screenX });
          if (!hit) return true;
          if (thing.kind === "coffee") {
            state.coffees += 1;
            setCoffees(state.coffees);
            burst(screenX + 11, thing.y + 11, "#f5b84b", 16);
            return false;
          }
          // Crash.
          burst(RUNNER_X + RUNNER.w / 2, runner.current.y - RUNNER.h / 2, "#22d3ee", 40);
          burst(screenX + thing.w / 2, thing.y + thing.h / 2, "#ff3366", 24);
          state.shake = reduced ? 0 : 0.4;
          const final = scoreFor(state.distance, state.coffees);
          setScore(final);
          const beat = saveBestScore(BEST_KEY, final);
          setNewBest(beat);
          if (beat) setParty((n) => n + 1);
          phaseRef.current = "over";
          setPhase("over");
          return true;
        });
        const current = scoreFor(state.distance, state.coffees);
        if (
          current !== lastScore &&
          Math.floor(state.time * 10) !== Math.floor((state.time - dt) * 10)
        ) {
          lastScore = current;
          setScore(current);
        }
      } else if (phaseRef.current === "ready") {
        idleScroll += dt * 160;
      }
      const scroll = running || phaseRef.current === "over" ? state.distance : idleScroll;

      // --- draw -----------------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.shake = Math.max(0, state.shake - dt);
      if (state.shake > 0) {
        const m = state.shake * 22;
        ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      }
      const horizon = H * 0.58;

      // Sky.
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#0a0322");
      sky.addColorStop(0.55, "#2b0b4f");
      sky.addColorStop(1, "#6a1b6e");
      ctx.fillStyle = sky;
      ctx.fillRect(-30, -30, W + 60, horizon + 30);

      // Stars.
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137.5 + 40) % W;
        const sy = ((i * 71.3) % (horizon * 0.6)) + 6;
        ctx.globalAlpha = 0.3 + ((i * 13) % 7) / 10;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // Striped synthwave sun.
      const sunR = Math.min(W, H) * 0.24;
      const sunX = W / 2;
      const sun = ctx.createLinearGradient(0, horizon - sunR, 0, horizon);
      sun.addColorStop(0, "#ffe27a");
      sun.addColorStop(1, "#ff3c8e");
      ctx.save();
      ctx.shadowColor = "#ff4fa0";
      ctx.shadowBlur = 40;
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(sunX, horizon, sunR, Math.PI, 0);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#6a1b6e";
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        const y = horizon - sunR * 0.55 + t * sunR * 0.55;
        ctx.fillRect(sunX - sunR, y, sunR * 2, 2 + t * 6);
      }

      // Skylines (parallax).
      const drawSkyline = (
        blocks: [number, number][],
        total: number,
        speedFactor: number,
        fill: string,
        edge: string | null,
        windows: string,
      ) => {
        let x = -((scroll * speedFactor) % total);
        while (x < W) {
          for (const [bw, bh] of blocks) {
            const w = bw * k * 0.6;
            const h = bh * k * 0.6;
            if (x + w > 0 && x < W) {
              ctx.fillStyle = fill;
              ctx.fillRect(x, horizon - h, w - 2, h);
              if (edge) {
                ctx.strokeStyle = edge;
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 0.5, horizon - h + 0.5, w - 3, h);
              }
              ctx.fillStyle = windows;
              for (let wy = horizon - h + 6; wy < horizon - 6; wy += 9) {
                for (let wx = x + 5; wx < x + w - 8; wx += 8) {
                  if ((Math.floor(wx * 7 + wy * 3) & 7) === 0) ctx.fillRect(wx, wy, 3, 4);
                }
              }
            }
            x += w;
          }
        }
      };
      drawSkyline(FAR, FAR_WIDTH * k * 0.6, 0.08, "#2a0b4a", null, "rgba(255,95,162,0.55)");
      drawSkyline(
        NEAR,
        NEAR_WIDTH * k * 0.6,
        0.22,
        "#14052a",
        "rgba(34,211,238,0.6)",
        "rgba(34,211,238,0.6)",
      );

      // Floor with a perspective grid racing toward you.
      const floor = ctx.createLinearGradient(0, horizon, 0, H);
      floor.addColorStop(0, "#1c0638");
      floor.addColorStop(1, "#07010f");
      ctx.fillStyle = floor;
      ctx.fillRect(-30, horizon, W + 60, H - horizon + 30);
      ctx.save();
      ctx.strokeStyle = "rgba(255,60,172,0.55)";
      ctx.shadowColor = "#ff3cac";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1;
      const phaseOffset = (scroll * 0.012) % 1;
      for (let i = 0; i < 14; i++) {
        const z = (i + phaseOffset) / 14;
        const y = horizon + (H - horizon) * z ** 2.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 14, horizon);
        ctx.lineTo(W / 2 + i * (W / 7), H);
        ctx.stroke();
      }
      ctx.restore();

      // Track line.
      const groundY = GROUND * k;
      ctx.save();
      ctx.strokeStyle = "#22d3ee";
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 1);
      ctx.lineTo(W, groundY + 1);
      ctx.stroke();
      ctx.restore();

      // Obstacles and coffee.
      for (const thing of things.current) {
        const x = (thing.x - scroll) * k;
        const y = thing.y * k;
        const w = thing.w * k;
        const h = thing.h * k;
        if (x > W + 40 || x + w < -40) continue;
        ctx.save();
        if (thing.kind === "coffee") {
          const bob = Math.sin(now / 250 + thing.id) * 3;
          ctx.shadowColor = "#f5b84b";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#f5b84b";
          ctx.beginPath();
          ctx.moveTo(x + w * 0.1, y + h * 0.3 + bob);
          ctx.lineTo(x + w * 0.9, y + h * 0.3 + bob);
          ctx.lineTo(x + w * 0.78, y + h + bob);
          ctx.lineTo(x + w * 0.22, y + h + bob);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#fff1c9";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + w * 0.4, y + bob);
          ctx.quadraticCurveTo(x + w * 0.55, y + h * 0.12 + bob, x + w * 0.4, y + h * 0.24 + bob);
          ctx.moveTo(x + w * 0.62, y + bob);
          ctx.quadraticCurveTo(x + w * 0.77, y + h * 0.12 + bob, x + w * 0.62, y + h * 0.24 + bob);
          ctx.stroke();
        } else {
          const rows = thing.kind === "bugs" ? 2 : 1;
          const bh = h / rows;
          ctx.shadowColor = "#ff3366";
          ctx.shadowBlur = 14;
          for (let r = 0; r < rows; r++) {
            const by = y + r * bh;
            const legs = Math.sin(now / 60 + thing.id + r) * 2;
            ctx.strokeStyle = "#ff8fb3";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (const lx of [0.25, 0.5, 0.75]) {
              ctx.moveTo(x + w * lx, by + bh * 0.55);
              ctx.lineTo(x + w * lx - 4 + legs, by + bh);
            }
            ctx.moveTo(x + w * 0.15, by + bh * 0.3);
            ctx.lineTo(x - 3, by + 2);
            ctx.stroke();
            ctx.fillStyle = "#ff3366";
            ctx.beginPath();
            ctx.ellipse(x + w * 0.55, by + bh * 0.45, w * 0.42, bh * 0.36, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#14052a";
            ctx.beginPath();
            ctx.arc(x + w * 0.2, by + bh * 0.4, bh * 0.16, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // The dev-bot.
      if (phaseRef.current !== "over" || Math.floor(now / 120) % 2 === 0) {
        const r = runner.current;
        const bx = RUNNER_X * k;
        const by = (r.y - RUNNER.h) * k;
        const bw = RUNNER.w * k;
        const bh = RUNNER.h * k;
        const stride = running && r.grounded ? Math.sin(state.time * 22) : 0;
        ctx.save();
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 18;
        // Legs.
        ctx.strokeStyle = "#7df3ff";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        if (r.grounded) {
          ctx.moveTo(bx + bw * 0.35, by + bh * 0.78);
          ctx.lineTo(bx + bw * 0.35 + stride * 5, by + bh);
          ctx.moveTo(bx + bw * 0.65, by + bh * 0.78);
          ctx.lineTo(bx + bw * 0.65 - stride * 5, by + bh);
        } else {
          ctx.moveTo(bx + bw * 0.35, by + bh * 0.78);
          ctx.lineTo(bx + bw * 0.25, by + bh * 0.92);
          ctx.moveTo(bx + bw * 0.65, by + bh * 0.78);
          ctx.lineTo(bx + bw * 0.8, by + bh * 0.9);
        }
        ctx.stroke();
        // Body.
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.roundRect(bx, by + bh * 0.12, bw, bh * 0.68, 7);
        ctx.fill();
        // Visor.
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0b0320";
        ctx.beginPath();
        ctx.roundRect(bx + bw * 0.18, by + bh * 0.24, bw * 0.72, bh * 0.22, 4);
        ctx.fill();
        ctx.fillStyle = "#ff4fa0";
        ctx.fillRect(bx + bw * 0.5, by + bh * 0.31, bw * 0.3, 2.5);
        // Antenna.
        ctx.strokeStyle = "#7df3ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.3, by + bh * 0.12);
        ctx.lineTo(bx + bw * 0.22, by);
        ctx.stroke();
        ctx.fillStyle = "#ff4fa0";
        ctx.beginPath();
        ctx.arc(bx + bw * 0.22, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Sparks.
      sparks.current = sparks.current.filter((s) => s.age < 0.9);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparks.current) {
        s.age += dt;
        s.vy += 600 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = Math.max(0, 1 - s.age / 0.9);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x * k, s.y * k, 3, 3);
      }
      ctx.restore();

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    press();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!JUMP_KEYS.has(event.key) || event.repeat) return;
    event.preventDefault();
    press();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (JUMP_KEYS.has(event.key)) release();
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0322] select-none sm:h-[500px]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        role="button"
        tabIndex={0}
        aria-label={
          phase === "running"
            ? `Jump. Score ${score}.`
            : "Start Neon Runner. Space or tap to jump, hold for higher, tap again mid-air to double-jump."
        }
        onPointerDown={onPointerDown}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className="absolute inset-0 cursor-pointer touch-manipulation rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#22d3ee]"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between font-mono text-xs text-white/85">
        <div className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-sm">
          <p className="font-heading text-3xl leading-none font-semibold text-[#7df3ff] tabular-nums [text-shadow:0_0_14px_#22d3ee]">
            {score}
          </p>
          <p className="mt-1 text-[10px] tracking-[0.16em] text-white/60 uppercase">
            score · best {best}
          </p>
        </div>
        <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 tracking-[0.12em] uppercase backdrop-blur-sm">
          ☕ {coffees} <span className="text-white/50">· +{COFFEE_POINTS} each</span>
        </span>
      </div>

      {phase === "over" && newBest ? <Confetti key={party} /> : null}

      {phase !== "running" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-5">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/15 bg-[#14052a]/75 p-6 text-center text-white backdrop-blur-md">
            {phase === "ready" ? (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-[#ff4fa0] uppercase">
                  neon runner
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  Outrun the bugs.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Tap or press Space to jump — hold for a higher jump, tap again mid-air to
                  double-jump. Grab ☕ for bonus points.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                  {newBest ? "new high score" : "crashed into a bug"}
                </p>
                <p className="mt-2 font-heading text-4xl font-semibold tracking-tight text-[#7df3ff] [text-shadow:0_0_18px_#22d3ee]">
                  {score}
                </p>
                <p className="mt-1 font-hand text-2xl text-[#ff8fb3]">{runnerVerdict(score)}</p>
              </>
            )}
            <button
              type="button"
              onClick={start}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#ff3cac] px-6 font-mono text-xs font-semibold tracking-[0.14em] text-white uppercase shadow-[0_0_30px_-4px_#ff3cac] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22d3ee]"
            >
              {phase === "ready" ? "start running" : "run again"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
