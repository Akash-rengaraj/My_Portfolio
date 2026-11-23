/**
 * A full-screen 2D canvas of light: drifting dust, spark bursts that streak
 * and fall, shockwave rings and a soft ember trail. Additive blending makes
 * overlapping sparks bloom. No WebGL.
 */

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
  width: number;
};
type Ring = { x: number; y: number; r: number; life: number; power: number };
type Mote = { x: number; y: number; vy: number; size: number; phase: number };

export interface SparkField {
  /** A burst of sparks; `power` ~1 for a hit, ~2 for a big one. */
  burst(x: number, y: number, power?: number): void;
  /** An expanding shockwave ring. */
  ring(x: number, y: number, power?: number): void;
  /** A couple of small embers (call on pointer move). */
  trail(x: number, y: number): void;
  destroy(): void;
}

const MAX_SPARKS = 1400;

/** Starts the field on `canvas` (sized to its parent) and returns its controls. */
export function createSparkField(canvas: HTMLCanvasElement): SparkField {
  const ctx = canvas.getContext("2d");
  const sparks: Spark[] = [];
  const rings: Ring[] = [];
  const motes: Mote[] = [];
  let w = 0;
  let h = 0;
  let frame = 0;

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = parent.clientWidth;
    h = parent.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (motes.length === 0) {
      for (let i = 0; i < 90; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: 0.1 + Math.random() * 0.35,
          size: 0.6 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  };

  const add = (spark: Spark) => {
    if (sparks.length >= MAX_SPARKS) sparks.shift();
    sparks.push(spark);
  };

  const tick = (now: number) => {
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (const m of motes) {
      m.y -= m.vy;
      m.x += Math.sin(now / 1800 + m.phase) * 0.15;
      if (m.y < -4) {
        m.y = h + 4;
        m.x = Math.random() * w;
      }
      const a = 0.18 + 0.18 * Math.sin(now / 700 + m.phase);
      ctx.fillStyle = `rgb(255 214 170 / ${a})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]!;
      r.r += 9 + 6 * r.power;
      r.life -= 1;
      const a = Math.max(0, r.life / 40);
      ctx.strokeStyle = `rgb(255 196 140 / ${a * 0.7})`;
      ctx.lineWidth = 1 + 5 * a * r.power;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (r.life <= 0) rings.splice(i, 1);
    }

    ctx.lineCap = "round";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]!;
      s.vx *= 0.985;
      s.vy = s.vy * 0.985 + 0.22;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 1;
      const t = s.life / s.max;
      ctx.strokeStyle = `hsl(${s.hue} 100% ${55 + 35 * t}% / ${Math.min(1, t * 1.4)})`;
      ctx.lineWidth = s.width * (0.4 + t);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2);
      ctx.stroke();
      if (s.life <= 0 || s.y > h + 20) sparks.splice(i, 1);
    }
    frame = requestAnimationFrame(tick);
  };

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  if (canvas.parentElement) observer?.observe(canvas.parentElement);
  resize();
  if (ctx) frame = requestAnimationFrame(tick);

  return {
    burst(x, y, power = 1) {
      const count = Math.round(70 * power);
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
        const speed = (3 + Math.random() * 11) * (0.7 + power * 0.4);
        const max = 40 + Math.random() * 55;
        add({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: max,
          max,
          hue: 18 + Math.random() * 30,
          width: 1 + Math.random() * 2,
        });
      }
    },
    ring(x, y, power = 1) {
      rings.push({ x, y, r: 10, life: 40, power });
    },
    trail(x, y) {
      for (let i = 0; i < 2; i++) {
        const max = 20 + Math.random() * 25;
        add({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2,
          life: max,
          max,
          hue: 25 + Math.random() * 20,
          width: 1.2,
        });
      }
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      sparks.length = 0;
      rings.length = 0;
    },
  };
}
