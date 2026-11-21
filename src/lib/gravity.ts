/**
 * Physics for "Gravity Playground". Everything happens in a virtual 800×500
 * space (scaled to the canvas) around a black hole at its centre.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const SPACE = { w: 800, h: 500 } as const;
export const CENTRE: Vec = { x: SPACE.w / 2, y: SPACE.h / 2 };
/** Gravitational parameter: a circular orbit at r = 150 moves at ~140 units/s. */
export const GM = 2.94e6;
export const SOFTENING = 20;
export const EVENT_HORIZON = 18;
/** Beyond this distance a planet has escaped for good. */
export const ESCAPE_DISTANCE = 1100;
/** Drag length → launch speed. */
export const LAUNCH_SCALE = 1.6;
/** A drag shorter than this counts as a click: perfect circular orbit. */
export const CLICK_DRAG = 6;

export function distance(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Pull of the black hole on a point (softened so it never divides by zero). */
export function acceleration(p: Vec, centre: Vec = CENTRE, gm: number = GM): Vec {
  const dx = centre.x - p.x;
  const dy = centre.y - p.y;
  const d2 = dx * dx + dy * dy + SOFTENING * SOFTENING;
  const inv = gm / (d2 * Math.sqrt(d2));
  return { x: dx * inv, y: dy * inv };
}

/** Semi-implicit Euler step (stable for orbits). */
export function step(body: Body, dt: number, centre: Vec = CENTRE, gm: number = GM): Body {
  const a = acceleration(body, centre, gm);
  const vx = body.vx + a.x * dt;
  const vy = body.vy + a.y * dt;
  return { x: body.x + vx * dt, y: body.y + vy * dt, vx, vy };
}

/** Speed for a circular orbit at radius `r`. */
export function circularSpeed(r: number, gm: number = GM): number {
  return Math.sqrt(gm / Math.max(r, 1));
}

/** Velocity for a counter-clockwise circular orbit starting at `p`. */
export function circularVelocity(p: Vec, centre: Vec = CENTRE, gm: number = GM): Vec {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const r = Math.hypot(dx, dy) || 1;
  const v = circularSpeed(r, gm);
  return { x: (dy / r) * v, y: (-dx / r) * v };
}

/** Launch velocity for a drag from `from` to `to`; a click gets a perfect orbit. */
export function launchVelocity(from: Vec, to: Vec): Vec {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.hypot(dx, dy) < CLICK_DRAG) return circularVelocity(from);
  return { x: dx * LAUNCH_SCALE, y: dy * LAUNCH_SCALE };
}

/** Where a planet launched now would go (stops at the event horizon). */
export function predictPath(start: Body, steps = 220, dt = 1 / 60): Vec[] {
  const path: Vec[] = [];
  let body = start;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < 3; j++) body = step(body, dt / 3);
    if (distance(body, CENTRE) < EVENT_HORIZON) break;
    path.push({ x: body.x, y: body.y });
  }
  return path;
}

/** Signed angle swept between two bearings, wrapped into (-π, π]. */
export function sweep(from: number, to: number): number {
  let d = to - from;
  while (d <= -Math.PI) d += Math.PI * 2;
  while (d > Math.PI) d -= Math.PI * 2;
  return d;
}

export function bearing(p: Vec, centre: Vec = CENTRE): number {
  return Math.atan2(p.y - centre.y, p.x - centre.x);
}

export function systemVerdict(inOrbit: number): string {
  if (inOrbit >= 8) return "A whole galaxy. Show-off.";
  if (inOrbit >= 5) return "A full solar system!";
  if (inOrbit >= 3) return "Your system is taking shape.";
  if (inOrbit >= 1) return "First orbit locked in.";
  return "Fling a planet — or just click for a perfect orbit.";
}
