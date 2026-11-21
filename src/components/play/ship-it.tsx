"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { Confetti } from "@/components/world/confetti";
import {
  altitudeAt,
  BURN_SECONDS,
  downrangeAt,
  FLIGHT_SECONDS,
  gaugeAt,
  gaugePeriod,
  isSuccess,
  outcomeFor,
  OVERLOAD_AT,
  pitchAt,
  pointsFor,
  verdictFor,
  zoneFor,
  type Outcome,
} from "@/lib/ship-it";

import { saveBestScore, useBestScore } from "./use-best-score";

const BEST_KEY = "ship-it-best";
const KEYS = new Set([" ", "Enter"]);

/** Sky colours (top, bottom) by camera altitude. */
const SKY: readonly [number, string, string][] = [
  [0, "#3f9cf5", "#c4e8ff"],
  [700, "#1d3f92", "#5d8fd8"],
  [1400, "#060a1f", "#162a63"],
  [2400, "#020309", "#070b1e"],
];

const CLOUDS = Array.from({ length: 18 }, (_, i) => ({
  x: ((i * 397) % 2600) - 1300,
  alt: 260 + ((i * 151) % 820),
  w: 90 + ((i * 53) % 120),
}));

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: ((i * 7919) % 1000) / 1000,
  y: ((i * 104729) % 1000) / 1000,
  r: 0.5 + ((i * 31) % 10) / 12,
}));

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${Math.round(ar + (br - ar) * t)} ${Math.round(ag + (bg - ag) * t)} ${Math.round(ab + (bb - ab) * t)})`;
}

function skyAt(alt: number): [string, string] {
  for (let i = 1; i < SKY.length; i++) {
    const [a0, t0, b0] = SKY[i - 1]!;
    const [a1, t1, b1] = SKY[i]!;
    if (alt <= a1) {
      const t = Math.max(0, (alt - a0) / (a1 - a0));
      return [mix(t0, t1, t), mix(b0, b1, t)];
    }
  }
  const last = SKY[SKY.length - 1]!;
  return [last[1], last[2]];
}

interface Puff {
  x: number;
  alt: number;
  vx: number;
  valt: number;
  age: number;
  life: number;
  size: number;
  color: string;
  glow: boolean;
}

interface Body {
  x: number;
  alt: number;
  vx: number;
  valt: number;
  angle: number;
  spin: number;
  kind: "stage" | "fairing-l" | "fairing-r";
}

type Phase = "pad" | "fueling" | "flight" | "result" | "over";

/**
 * Ship It: hold to fuel the rocket, let go while the gauge is in the green
 * zone, and watch the release ride to orbit — stage separation, fairing and
 * satellite deploy included. Every deploy narrows the zone.
 */
export function ShipIt() {
  const reduced = useReducedMotion();
  const best = useBestScore(BEST_KEY);
  const [phase, setPhase] = useState<Phase>("pad");
  const [level, setLevel] = useState(0);
  const [points, setPoints] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [party, setParty] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const needleRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapRef, "100px");

  const phaseRef = useRef<Phase>("pad");
  const levelRef = useRef(0);
  const pointsRef = useRef(0);
  const fuelStart = useRef(0);
  const flight = useRef<{ outcome: Outcome; t: number } | null>(null);
  const puffs = useRef<Puff[]>([]);
  const bodies = useRef<Body[]>([]);

  const zone = zoneFor(level);

  const setPhaseBoth = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const resetPad = (nextLevel: number) => {
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    flight.current = null;
    bodies.current = [];
    setOutcome(null);
    setPhaseBoth("pad");
  };

  const down = () => {
    const p = phaseRef.current;
    if (p === "pad") {
      fuelStart.current = performance.now();
      setPhaseBoth("fueling");
    } else if (p === "result") {
      resetPad(levelRef.current + 1);
    } else if (p === "over") {
      pointsRef.current = 0;
      setPoints(0);
      setNewBest(false);
      resetPad(0);
    }
  };

  const up = () => {
    if (phaseRef.current !== "fueling") return;
    const seconds = (performance.now() - fuelStart.current) / 1000;
    const power = gaugeAt(seconds, gaugePeriod(levelRef.current));
    const result = outcomeFor(power, zoneFor(levelRef.current));
    flight.current = { outcome: result, t: 0 };
    setOutcome(result);
    setPhaseBoth("flight");
  };

  useEffect(() => {
    if (!inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let last = performance.now();
    let frame = 0;
    const cam = { alt: 0, x: 0 };
    let shake = 0;
    let flash = 0;
    let exploded = false;

    const settle = (next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
    };

    const puff = (p: Omit<Puff, "age">) => {
      if (reduced && puffs.current.length > 120) return;
      puffs.current.push({ ...p, age: 0 });
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
      const s = H / 700;
      const gy = H * 0.84;

      // Gauge needle (DOM) while fuelling.
      const fueling = phaseRef.current === "fueling";
      if (needleRef.current) {
        const value = fueling
          ? gaugeAt((now - fuelStart.current) / 1000, gaugePeriod(levelRef.current))
          : 0;
        needleRef.current.style.bottom = `${value * 100}%`;
      }

      // --- rocket state ----------------------------------------------------
      const f = flight.current;
      let alt = 0;
      let x = 0;
      let angle = 0;
      let burning = false;
      let stageOn = true;
      let fairingOn = true;
      let satDeploy = -1;
      if (f) {
        f.t += dt;
        const t = f.t;
        alt = altitudeAt(f.outcome, t);
        x = downrangeAt(f.outcome, t);
        angle = (pitchAt(f.outcome, t) * Math.PI) / 180;
        burning = t < BURN_SECONDS[f.outcome];
        const success = isSuccess(f.outcome);
        stageOn = !success || t < 2.6;
        fairingOn = !success || t < 3.6;
        satDeploy = success ? Math.min(1, Math.max(0, (t - 4.4) / 1)) : -1;

        const prevAlt = altitudeAt(f.outcome, Math.max(0, t - dt));
        const prevX = downrangeAt(f.outcome, Math.max(0, t - dt));
        const valt = (alt - prevAlt) / Math.max(dt, 1e-3);
        const vx = (x - prevX) / Math.max(dt, 1e-3);

        // One-off events.
        if (success && t >= 2.6 && t - dt < 2.6) {
          bodies.current.push({
            x,
            alt,
            vx: vx * 0.6,
            valt: valt * 0.5,
            angle,
            spin: 0.6,
            kind: "stage",
          });
        }
        if (success && t >= 3.6 && t - dt < 3.6) {
          bodies.current.push({
            x,
            alt,
            vx: vx - 60,
            valt: valt * 0.9,
            angle,
            spin: -1.4,
            kind: "fairing-l",
          });
          bodies.current.push({
            x,
            alt,
            vx: vx + 60,
            valt: valt * 0.9,
            angle,
            spin: 1.4,
            kind: "fairing-r",
          });
        }
        if (f.outcome === "overload" && !exploded && t >= OVERLOAD_AT) {
          exploded = true;
          flash = 1;
          shake = reduced ? 0 : 0.6;
          for (let i = 0; i < (reduced ? 40 : 120); i++) {
            const a = Math.random() * Math.PI * 2;
            const v = 60 + Math.random() * 380;
            puff({
              x,
              alt: alt + 50,
              vx: Math.cos(a) * v,
              valt: Math.sin(a) * v,
              life: 0.6 + Math.random() * 1.2,
              size: 6 + Math.random() * 14,
              color: ["#ffd166", "#ff7b29", "#ff3b1f", "#ffffff"][i % 4]!,
              glow: true,
            });
          }
        }
        if (f.outcome === "overload" && t < OVERLOAD_AT) shake = reduced ? 0 : 0.08 + t * 0.05;

        // Exhaust.
        if (burning && !(f.outcome === "overload" && exploded)) {
          const nozzleAlt = alt + (stageOn ? 0 : 64);
          const back = { x: -Math.sin(angle), alt: -Math.cos(angle) };
          for (let i = 0; i < (reduced ? 1 : 3); i++) {
            puff({
              x: x + back.x * 10 + (Math.random() - 0.5) * 12,
              alt: nozzleAlt + back.alt * 10,
              vx: back.x * 200 + (Math.random() - 0.5) * 80,
              valt: back.alt * 200 + (Math.random() - 0.5) * 40,
              life: 1.6 + Math.random() * 1.6,
              size: 10 + Math.random() * 10,
              color: alt < 1200 ? "#e9e6df" : "#8c94b3",
              glow: false,
            });
          }
        }
        if (t >= FLIGHT_SECONDS[f.outcome] && phaseRef.current === "flight") {
          const success2 = isSuccess(f.outcome);
          if (success2) {
            pointsRef.current += pointsFor(f.outcome);
            setPoints(pointsRef.current);
            settle("result");
          } else {
            const beat = saveBestScore(BEST_KEY, pointsRef.current);
            setNewBest(beat);
            if (beat) setParty((n) => n + 1);
            settle("over");
          }
        }
      } else {
        exploded = false;
        // Steam venting on the pad.
        if (Math.random() < (phaseRef.current === "fueling" ? 0.6 : 0.12)) {
          puff({
            x: (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 8),
            alt: 40 + Math.random() * 30,
            vx: (Math.random() - 0.5) * 50,
            valt: 10 + Math.random() * 20,
            life: 1.4,
            size: 6 + Math.random() * 6,
            color: "#f2f2f2",
            glow: false,
          });
        }
      }

      // Camera.
      const ease = Math.min(1, dt * 3.5);
      const camTargetAlt = Math.max(0, alt - 220);
      cam.alt += (camTargetAlt - cam.alt) * ease;
      cam.x += (x - cam.x) * ease;
      const sx = (wx: number) => W / 2 + (wx - cam.x) * s;
      const sy = (wa: number) => gy - (wa - cam.alt) * s;

      // --- draw -------------------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shake = Math.max(0, shake - dt * 0.6);
      if (shake > 0)
        ctx.translate((Math.random() - 0.5) * shake * 18, (Math.random() - 0.5) * shake * 18);

      const [top, bottom] = skyAt(cam.alt);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, top);
      sky.addColorStop(1, bottom);
      ctx.fillStyle = sky;
      ctx.fillRect(-20, -20, W + 40, H + 40);

      // Stars fade in with altitude.
      const starAlpha = Math.min(1, Math.max(0, (cam.alt - 700) / 900));
      if (starAlpha > 0) {
        ctx.fillStyle = "#ffffff";
        for (const star of STARS) {
          ctx.globalAlpha = starAlpha * (0.4 + star.r * 0.5);
          ctx.fillRect(star.x * W, star.y * H, star.r * 1.6, star.r * 1.6);
        }
        ctx.globalAlpha = 1;
      }

      // Earth's curve rises into view from high up.
      const limb = Math.min(1, Math.max(0, (cam.alt - 1200) / 1600));
      if (limb > 0) {
        const R = W * 2.4;
        const cy = H + R - limb * H * 0.32;
        ctx.save();
        ctx.shadowColor = "#7cc8ff";
        ctx.shadowBlur = 40;
        const earth = ctx.createLinearGradient(0, cy - R, 0, cy - R + H * 0.4);
        earth.addColorStop(0, "#3a8fd9");
        earth.addColorStop(0.4, "#1d5a8f");
        earth.addColorStop(1, "#0c2a45");
        ctx.fillStyle = earth;
        ctx.beginPath();
        ctx.arc(W / 2, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = `rgba(150,215,255,${0.6 * limb})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(W / 2, cy, R + 2, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        // Orbit line once deployed.
        if (satDeploy > 0) {
          ctx.setLineDash([6, 8]);
          ctx.strokeStyle = `rgba(255,209,102,${0.6 * satDeploy})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(W / 2, cy, cy - sy(alt + 110), Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Ground, hills and the launch pad.
      const groundY = sy(0);
      if (groundY < H + 200) {
        ctx.fillStyle = "#6f8fb0";
        ctx.beginPath();
        ctx.moveTo(-20, groundY);
        for (let i = 0; i <= 12; i++) {
          const hx = (i / 12) * (W + 40) - 20;
          ctx.lineTo(hx, groundY - 30 * s - Math.sin(i * 1.7 + 1) * 26 * s - 20 * s);
        }
        ctx.lineTo(W + 20, groundY);
        ctx.fill();
        ctx.fillStyle = "#3d5a3a";
        ctx.fillRect(-20, groundY, W + 40, H);
        ctx.fillStyle = "#b9b4a8";
        ctx.fillRect(sx(-70), groundY - 8 * s, 140 * s, 8 * s);
        // Gantry.
        ctx.strokeStyle = "#5b5f6b";
        ctx.lineWidth = Math.max(1, 1.5 * s);
        const gx = sx(-42);
        const gTop = sy(150);
        ctx.strokeRect(gx - 10 * s, gTop, 14 * s, groundY - 8 * s - gTop);
        for (let yy = gTop; yy < groundY - 10 * s; yy += 14 * s) {
          ctx.beginPath();
          ctx.moveTo(gx - 10 * s, yy);
          ctx.lineTo(gx + 4 * s, yy + 14 * s);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(gx + 4 * s, sy(110));
        ctx.lineTo(sx(-12), sy(110));
        ctx.stroke();
      }

      // Clouds.
      const cloudAlpha = Math.max(0, 1 - Math.max(0, cam.alt - 900) / 500);
      if (cloudAlpha > 0) {
        ctx.fillStyle = "#ffffff";
        for (const cloud of CLOUDS) {
          const cx = sx(cloud.x + (((now / 1000) * 12) % 2600));
          const cy = sy(cloud.alt);
          if (cy < -60 || cy > H + 60) continue;
          ctx.globalAlpha = 0.75 * cloudAlpha;
          const w = cloud.w * s;
          ctx.beginPath();
          ctx.ellipse(cx, cy, w * 0.5, w * 0.16, 0, 0, Math.PI * 2);
          ctx.ellipse(cx - w * 0.2, cy - w * 0.1, w * 0.22, w * 0.16, 0, 0, Math.PI * 2);
          ctx.ellipse(cx + w * 0.15, cy - w * 0.12, w * 0.26, w * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Smoke and fire.
      puffs.current = puffs.current.filter((p) => p.age < p.life);
      for (const p of puffs.current) {
        p.age += dt;
        p.x += p.vx * dt;
        p.alt += p.valt * dt;
        p.vx *= 1 - dt * 1.2;
        p.valt *= 1 - dt * 1.2;
        const k = p.age / p.life;
        ctx.globalAlpha = Math.max(0, (1 - k) * (p.glow ? 1 : 0.55));
        if (p.glow) ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(
          sx(p.x),
          sy(p.alt),
          p.size * s * (p.glow ? 1 - k * 0.5 : 1 + k * 2),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;

      const drawStage = () => {
        ctx.fillStyle = "#f4f1ea";
        ctx.fillRect(-11 * s, -60 * s, 22 * s, 60 * s);
        ctx.fillStyle = "#ff5a1f";
        ctx.fillRect(-11 * s, -46 * s, 22 * s, 5 * s);
        ctx.beginPath();
        ctx.moveTo(-11 * s, -22 * s);
        ctx.lineTo(-22 * s, 2 * s);
        ctx.lineTo(-11 * s, 0);
        ctx.moveTo(11 * s, -22 * s);
        ctx.lineTo(22 * s, 2 * s);
        ctx.lineTo(11 * s, 0);
        ctx.fill();
        ctx.fillStyle = "#30333b";
        ctx.fillRect(-7 * s, 0, 14 * s, 6 * s);
      };
      const drawFairingHalf = (side: -1 | 1) => {
        ctx.fillStyle = "#f4f1ea";
        ctx.beginPath();
        ctx.moveTo(0, -130 * s);
        ctx.quadraticCurveTo(side * 12 * s, -118 * s, side * 10 * s, -98 * s);
        ctx.lineTo(0, -98 * s);
        ctx.closePath();
        ctx.fill();
      };
      const drawSatellite = (deploy: number) => {
        const panel = 26 * s * deploy;
        ctx.fillStyle = "#2f6be0";
        ctx.fillRect(-7 * s - panel, -108 * s, panel, 9 * s);
        ctx.fillRect(7 * s, -108 * s, panel, 9 * s);
        ctx.fillStyle = "#e8c15a";
        ctx.fillRect(-7 * s, -112 * s, 14 * s, 16 * s);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-1 * s, -120 * s, 2 * s, 8 * s);
      };

      // Falling stage and fairing halves.
      bodies.current = bodies.current.filter((b) => sy(b.alt) < H + 300);
      for (const b of bodies.current) {
        b.valt -= 380 * dt;
        b.alt += b.valt * dt;
        b.x += b.vx * dt;
        b.angle += b.spin * dt;
        ctx.save();
        ctx.translate(sx(b.x), sy(b.alt));
        ctx.rotate(b.angle);
        if (b.kind === "stage") drawStage();
        else drawFairingHalf(b.kind === "fairing-l" ? -1 : 1);
        ctx.restore();
      }

      // The rocket.
      const showRocket = !(f?.outcome === "overload" && exploded);
      if (showRocket) {
        ctx.save();
        ctx.translate(sx(x), sy(alt));
        ctx.rotate(angle);
        if (burning) {
          const base = stageOn ? 6 : -58;
          const len = (40 + Math.random() * 30) * s;
          const flame = ctx.createLinearGradient(0, base * s, 0, base * s + len);
          flame.addColorStop(0, "#fff6c8");
          flame.addColorStop(0.4, "#ffb347");
          flame.addColorStop(1, "rgba(255,90,31,0)");
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = flame;
          ctx.beginPath();
          ctx.moveTo(-7 * s, base * s);
          ctx.quadraticCurveTo(0, base * s + len * 1.3, 7 * s, base * s);
          ctx.fill();
          ctx.restore();
        }
        if (stageOn) drawStage();
        ctx.fillStyle = "#2a2d35";
        ctx.fillRect(-10 * s, -64 * s, 20 * s, 4 * s);
        ctx.fillStyle = "#f4f1ea";
        ctx.fillRect(-10 * s, -98 * s, 20 * s, 34 * s);
        ctx.fillStyle = "#1d2a4a";
        ctx.beginPath();
        ctx.arc(0, -84 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        if (fairingOn) {
          drawFairingHalf(-1);
          drawFairingHalf(1);
        } else if (satDeploy <= 0) {
          drawSatellite(0);
        }
        ctx.restore();
      }

      // The deployed satellite floats ahead, panels unfolding.
      if (satDeploy > 0 && f) {
        const lead = satDeploy * 60;
        ctx.save();
        ctx.translate(sx(x + Math.sin(angle) * lead), sy(alt + Math.cos(angle) * lead));
        ctx.rotate(angle);
        ctx.shadowColor = "#ffd166";
        ctx.shadowBlur = 16 * satDeploy;
        drawSatellite(satDeploy);
        ctx.restore();
        ctx.fillStyle = `rgba(255,255,255,${satDeploy})`;
        ctx.font = `600 ${Math.max(11, 13 * s)}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.fillText(
          `v${levelRef.current + 1}.0 · live`,
          sx(x + Math.sin(angle) * lead),
          sy(alt + Math.cos(angle) * lead + 140),
        );
        ctx.textAlign = "start";
      }

      // Explosion flash.
      if (flash > 0) {
        flash = Math.max(0, flash - dt * 2.5);
        ctx.fillStyle = `rgba(255,240,210,${flash * 0.8})`;
        ctx.fillRect(-20, -20, W + 40, H + 40);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    down();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!KEYS.has(event.key) || event.repeat) return;
    event.preventDefault();
    down();
  };

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (KEYS.has(event.key)) up();
  };

  const verdict = outcome ? verdictFor(outcome) : null;
  const showGauge = phase === "pad" || phase === "fueling";

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#3f9cf5] select-none sm:h-[500px]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        role="button"
        tabIndex={0}
        aria-label={
          phase === "pad"
            ? "Launch pad. Hold Space or press and hold to fuel, release in the green zone to launch."
            : phase === "fueling"
              ? "Fuelling. Release to launch."
              : "Ship It"
        }
        onPointerDown={onPointerDown}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className="absolute inset-0 cursor-pointer touch-manipulation rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between font-mono text-xs text-white">
        <div className="rounded-xl border border-white/20 bg-black/25 px-4 py-2 backdrop-blur-sm">
          <p className="font-heading text-3xl leading-none font-semibold tabular-nums">{points}</p>
          <p className="mt-1 text-[10px] tracking-[0.16em] text-white/70 uppercase">
            points · best {best}
          </p>
        </div>
        <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 tracking-[0.14em] uppercase backdrop-blur-sm">
          deploy #{level + 1}
        </span>
      </div>

      {/* Fuel gauge */}
      {showGauge ? (
        <div className="pointer-events-none absolute top-1/2 right-5 flex -translate-y-1/2 items-center gap-3">
          <p className="hidden max-w-[9rem] text-right font-hand text-2xl leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] sm:block">
            {phase === "pad" ? "hold to fuel, let go in the green" : "…now!"}
          </p>
          <div className="relative h-56 w-5 overflow-hidden rounded-full border-2 border-white/80 bg-black/35">
            <span
              className="absolute inset-x-0 bg-[#4ade80]/80"
              style={{ bottom: `${zone.from * 100}%`, height: `${(zone.to - zone.from) * 100}%` }}
            />
            <span
              className="absolute inset-x-0 bg-[#fef08a]"
              style={{
                bottom: `${zone.perfectFrom * 100}%`,
                height: `${(zone.perfectTo - zone.perfectFrom) * 100}%`,
              }}
            />
            <span
              ref={needleRef}
              className="absolute inset-x-[-2px] h-1 translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#fff]"
              style={{ bottom: "0%" }}
            />
          </div>
        </div>
      ) : null}

      {phase === "pad" && level === 0 && points === 0 ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:right-auto sm:max-w-xs">
          <div className="rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-md">
            <p className="font-mono text-[11px] tracking-[0.2em] text-[#ffd166] uppercase">
              ship it
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/85">
              Press and hold anywhere (or Space) to fuel. Let go while the gauge is in the{" "}
              <span className="text-[#4ade80]">green</span> — the yellow band is a perfect burn.
            </p>
          </div>
        </div>
      ) : null}

      {phase === "over" && newBest ? <Confetti key={party} /> : null}

      {(phase === "result" || phase === "over") && verdict ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-[#070b1e]/75 p-5 text-center text-white backdrop-blur-md">
            <p className="font-heading text-2xl font-semibold tracking-tight">{verdict.title}</p>
            <p className="mt-1 text-sm text-white/75">{verdict.line}</p>
            {phase === "over" ? (
              <p className="mt-2 font-hand text-2xl text-[#ffd166]">
                {newBest ? "New best: " : "Run total: "}
                {points} {points === 1 ? "point" : "points"}
              </p>
            ) : null}
            <button
              type="button"
              onClick={down}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#ff5a1f] px-5 font-mono text-xs font-semibold tracking-[0.14em] text-white uppercase shadow-[0_10px_24px_-10px_#ff5a1f] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {phase === "result" ? "ship the next build →" : "start a new run"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
