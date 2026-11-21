"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { Confetti } from "@/components/world/confetti";
import {
  bearing,
  CENTRE,
  circularVelocity,
  distance,
  ESCAPE_DISTANCE,
  EVENT_HORIZON,
  launchVelocity,
  predictPath,
  SPACE,
  step,
  sweep,
  systemVerdict,
  type Vec,
} from "@/lib/gravity";

import { saveBestScore, useBestScore } from "./use-best-score";

const BEST_KEY = "gravity-best";
const MAX_PLANETS = 12;
const TRAIL = 70;
const SYSTEM_GOAL = 5;
const COLORS = ["#7dd3fc", "#f0abfc", "#fcd34d", "#86efac", "#fda4af", "#c4b5fd", "#fdba74"];

const STARS = Array.from({ length: 160 }, (_, i) => ({
  x: ((i * 7919) % 1000) / 1000,
  y: ((i * 104729) % 1000) / 1000,
  r: 0.4 + ((i * 31) % 10) / 11,
  t: (i * 0.61) % (Math.PI * 2),
}));

/** Accretion-disk particles: radius and starting angle. */
const DISK = Array.from({ length: 220 }, (_, i) => ({
  r: 26 + ((i * 37) % 100) * 0.42,
  a: (i / 220) * Math.PI * 2 * 7,
  hue: i % 3,
}));
const DISK_COLORS = ["#ffd8a8", "#ff8a5c", "#c06bff"];

interface Planet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  swept: number;
  lastBearing: number;
  orbits: number;
  trail: Vec[];
  pulse: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  color: string;
}

let nextId = 0;

function makePlanet(at: Vec, velocity: Vec): Planet {
  nextId += 1;
  return {
    id: nextId,
    x: at.x,
    y: at.y,
    vx: velocity.x,
    vy: velocity.y,
    radius: 5 + Math.random() * 4,
    color: COLORS[nextId % COLORS.length]!,
    swept: 0,
    lastBearing: bearing(at),
    orbits: 0,
    trail: [],
    pulse: 0,
  };
}

/** Two planets already circling, so the system is alive on arrival. */
function seedPlanets(): Planet[] {
  return [130, 205].map((r, i) => {
    const angle = i * 2.4 + 0.6;
    const at = { x: CENTRE.x + Math.cos(angle) * r, y: CENTRE.y + Math.sin(angle) * r };
    return makePlanet(at, circularVelocity(at));
  });
}

/**
 * Gravity Playground: a black hole with a glowing accretion disk. Drag to
 * fling a planet (the dotted line shows where it'll go) or just click for a
 * perfect orbit. Get five planets orbiting at once to build a solar system.
 */
export function GravityPlayground() {
  const reduced = useReducedMotion();
  const best = useBestScore(BEST_KEY);
  const [inOrbit, setInOrbit] = useState(0);
  const [totalOrbits, setTotalOrbits] = useState(0);
  const [swallowed, setSwallowed] = useState(0);
  const [party, setParty] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, "100px");

  const planets = useRef<Planet[]>([]);
  const seeded = useRef(false);
  const motes = useRef<Mote[]>([]);
  const drag = useRef<{ from: Vec; to: Vec } | null>(null);
  const view = useRef({ scale: 1, ox: 0, oy: 0 });
  const tally = useRef({ orbits: 0, swallowed: 0, inOrbit: 0, reached: false });

  /** Canvas pixel → virtual space. */
  const toSpace = (event: PointerEvent<HTMLDivElement>): Vec => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { scale, ox, oy } = view.current;
    return {
      x: (event.clientX - rect.left - ox) / scale,
      y: (event.clientY - rect.top - oy) / scale,
    };
  };

  const addPlanet = (at: Vec, velocity: Vec) => {
    planets.current.push(makePlanet(at, velocity));
    if (planets.current.length > MAX_PLANETS) planets.current.shift();
  };

  const clear = () => {
    planets.current = [];
    motes.current = [];
    tally.current = { orbits: 0, swallowed: 0, inOrbit: 0, reached: false };
    setInOrbit(0);
    setTotalOrbits(0);
    setSwallowed(0);
    setCelebrate(false);
  };

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let last = performance.now();
    let frame = 0;
    let spin = 0;
    let glow = 0;
    if (!seeded.current) {
      seeded.current = true;
      planets.current = seedPlanets();
    }

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      const scale = Math.min(W / SPACE.w, H / SPACE.h);
      const ox = (W - SPACE.w * scale) / 2;
      const oy = (H - SPACE.h * scale) / 2;
      view.current = { scale, ox, oy };
      const px = (v: Vec): [number, number] => [ox + v.x * scale, oy + v.y * scale];
      const [hx, hy] = px(CENTRE);

      // --- physics ------------------------------------------------------------
      const sub = 4;
      const t = tally.current;
      let changed = false;
      planets.current = planets.current.filter((planet) => {
        let body = { x: planet.x, y: planet.y, vx: planet.vx, vy: planet.vy };
        for (let i = 0; i < sub; i++) {
          body = step(body, dt / sub);
          if (distance(body, CENTRE) < EVENT_HORIZON + planet.radius * 0.5) {
            // Swallowed: a spiral of light falls in, and the hole flares.
            for (let m = 0; m < (reduced ? 10 : 30); m++) {
              const a = Math.random() * Math.PI * 2;
              motes.current.push({
                x: body.x,
                y: body.y,
                vx: Math.cos(a) * 60,
                vy: Math.sin(a) * 60,
                age: 0,
                color: planet.color,
              });
            }
            glow = 1;
            t.swallowed += 1;
            changed = true;
            return false;
          }
        }
        if (distance(body, CENTRE) > ESCAPE_DISTANCE) return false;
        Object.assign(planet, body);
        const b = bearing(planet);
        planet.swept += sweep(planet.lastBearing, b);
        planet.lastBearing = b;
        if (Math.abs(planet.swept) >= Math.PI * 2) {
          planet.swept -= Math.sign(planet.swept) * Math.PI * 2;
          planet.orbits += 1;
          planet.pulse = 1;
          t.orbits += 1;
          changed = true;
        }
        planet.pulse = Math.max(0, planet.pulse - dt * 1.5);
        planet.trail.push({ x: planet.x, y: planet.y });
        if (planet.trail.length > TRAIL) planet.trail.shift();
        return true;
      });
      const orbiting = planets.current.filter((p) => p.orbits > 0).length;
      if (orbiting !== t.inOrbit) {
        t.inOrbit = orbiting;
        changed = true;
      }
      if (changed) {
        setInOrbit(t.inOrbit);
        setTotalOrbits(t.orbits);
        setSwallowed(t.swallowed);
        saveBestScore(BEST_KEY, t.inOrbit);
        if (t.inOrbit >= SYSTEM_GOAL && !t.reached) {
          t.reached = true;
          setCelebrate(true);
          setParty((n) => n + 1);
        }
      }

      // --- draw -----------------------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "#1a0b2e");
      bg.addColorStop(0.5, "#0a0618");
      bg.addColorStop(1, "#020108");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars, bent outward near the hole (gravitational lensing).
      const lens = 70 * scale;
      ctx.fillStyle = "#ffffff";
      for (const star of STARS) {
        let x = star.x * W;
        let y = star.y * H;
        const dx = x - hx;
        const dy = y - hy;
        const d = Math.hypot(dx, dy) || 1;
        if (d < lens * 4) {
          const push = (lens * lens) / d;
          x += (dx / d) * push;
          y += (dy / d) * push;
        }
        ctx.globalAlpha = reduced ? 0.6 : 0.35 + 0.35 * Math.sin(now / 1100 + star.t);
        ctx.fillRect(x, y, star.r * 1.4, star.r * 1.4);
      }
      ctx.globalAlpha = 1;

      // Accretion disk, back half (behind the hole).
      spin += dt * (reduced ? 0.15 : 0.6);
      glow = Math.max(0, glow - dt * 0.8);
      const drawDisk = (front: boolean) => {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (const p of DISK) {
          const a = p.a + spin * (60 / p.r);
          const sin = Math.sin(a);
          if (front ? sin < 0 : sin >= 0) continue;
          const x = hx + Math.cos(a) * p.r * scale * 1.6;
          const y = hy + sin * p.r * scale * 0.38;
          ctx.globalAlpha = 0.5 + glow * 0.4;
          ctx.fillStyle = DISK_COLORS[p.hue]!;
          ctx.beginPath();
          ctx.arc(x, y, (1.2 + glow) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };
      drawDisk(false);

      // The hole: halo, darkness and a thin photon ring.
      const halo = ctx.createRadialGradient(
        hx,
        hy,
        EVENT_HORIZON * scale,
        hx,
        hy,
        EVENT_HORIZON * scale * 4.5,
      );
      halo.addColorStop(0, `rgba(255,170,110,${0.45 + glow * 0.4})`);
      halo.addColorStop(1, "rgba(120,40,200,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(hx, hy, EVENT_HORIZON * scale * 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(hx, hy, EVENT_HORIZON * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.strokeStyle = "#ffe2c2";
      ctx.shadowColor = "#ffb27a";
      ctx.shadowBlur = 14 + glow * 20;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hx, hy, EVENT_HORIZON * scale * 1.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      drawDisk(true);

      // Trails.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (const planet of planets.current) {
        const trail = planet.trail;
        for (let i = 1; i < trail.length; i++) {
          const [x0, y0] = px(trail[i - 1]!);
          const [x1, y1] = px(trail[i]!);
          ctx.globalAlpha = (i / trail.length) * 0.55;
          ctx.strokeStyle = planet.color;
          ctx.lineWidth = (i / trail.length) * planet.radius * scale * 0.9;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Planets, lit from the hole's glow.
      for (const planet of planets.current) {
        const [x, y] = px(planet);
        const r = planet.radius * scale;
        const toward = Math.atan2(hy - y, hx - x);
        const shade = ctx.createRadialGradient(
          x + Math.cos(toward) * r * 0.5,
          y + Math.sin(toward) * r * 0.5,
          r * 0.1,
          x,
          y,
          r,
        );
        shade.addColorStop(0, "#ffffff");
        shade.addColorStop(0.35, planet.color);
        shade.addColorStop(1, "#140a26");
        ctx.save();
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (planet.pulse > 0) {
          ctx.strokeStyle = planet.color;
          ctx.globalAlpha = planet.pulse;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, r + (1 - planet.pulse) * 26 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Light falling into the hole.
      motes.current = motes.current.filter((m) => m.age < 1.2);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes.current) {
        m.age += dt;
        const a = step({ x: m.x, y: m.y, vx: m.vx, vy: m.vy }, dt);
        Object.assign(m, a);
        const [x, y] = px(m);
        ctx.globalAlpha = Math.max(0, 1 - m.age / 1.2);
        ctx.fillStyle = m.color;
        ctx.fillRect(x, y, 2.5, 2.5);
      }
      ctx.restore();

      // Aiming: ghost planet, arrow and the predicted path.
      const d = drag.current;
      if (d) {
        const velocity = launchVelocity(d.from, d.to);
        const path = predictPath({ x: d.from.x, y: d.from.y, vx: velocity.x, vy: velocity.y });
        ctx.fillStyle = "#ffffff";
        path.forEach((point, i) => {
          if (i % 4) return;
          const [x, y] = px(point);
          ctx.globalAlpha = Math.max(0, 0.85 - i / path.length);
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        const [fx, fy] = px(d.from);
        const [tx, ty] = px(d.to);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(fx, fy, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const at = toSpace(event);
    drag.current = { from: at, to: at };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current) drag.current.to = toSpace(event);
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || distance(d.from, CENTRE) < EVENT_HORIZON * 2) return;
    addPlanet(d.from, launchVelocity(d.from, d.to));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    const r = 90 + Math.random() * 140;
    const a = Math.random() * Math.PI * 2;
    const at = { x: CENTRE.x + Math.cos(a) * r, y: CENTRE.y + Math.sin(a) * r * 0.9 };
    addPlanet(at, circularVelocity(at));
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#020108] select-none sm:h-[500px]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        role="button"
        tabIndex={0}
        aria-label="Black hole. Drag to fling a planet, click for a perfect orbit, or press Space to add one."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-crosshair touch-none rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#c4b5fd]"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3 font-mono text-xs text-white/85">
        <div className="rounded-xl border border-white/15 bg-black/35 px-4 py-2 backdrop-blur-sm">
          <p className="font-heading text-3xl leading-none font-semibold tabular-nums">
            {inOrbit}
            <span className="text-base text-white/50"> / {SYSTEM_GOAL}</span>
          </p>
          <p className="mt-1 text-[10px] tracking-[0.16em] text-white/60 uppercase">
            in orbit · best {best}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 tracking-[0.12em] uppercase backdrop-blur-sm">
            {totalOrbits} orbits · {swallowed} swallowed
          </span>
          <button
            type="button"
            onClick={clear}
            className="pointer-events-auto rounded-full border border-white/15 bg-black/35 px-3 py-1.5 tracking-[0.12em] uppercase backdrop-blur-sm transition-colors hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4b5fd]"
          >
            clear system
          </button>
        </div>
      </div>

      {celebrate ? <Confetti key={party} /> : null}

      <p className="pointer-events-none absolute inset-x-0 bottom-4 px-4 text-center font-hand text-2xl text-white/80 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]">
        {celebrate ? systemVerdict(inOrbit) : "drag to fling a planet · click for a perfect orbit"}
      </p>
    </div>
  );
}
