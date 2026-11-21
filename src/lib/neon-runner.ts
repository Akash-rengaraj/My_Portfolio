/**
 * Rules for "Neon Runner". The world is 400 units tall (scaled to the canvas);
 * y grows downward and `y` on the runner is the position of its feet.
 */

export const WORLD_HEIGHT = 400;
export const GROUND = 336;
export const RUNNER_X = 90;
export const RUNNER = { w: 30, h: 40 } as const;

export const GRAVITY = 2500;
export const JUMP_VELOCITY = -800;
export const DOUBLE_JUMP_VELOCITY = -700;
/** Holding the button softens gravity on the way up, for a higher jump. */
export const HOLD_GRAVITY = 0.45;
export const MAX_HOLD = 0.24;
export const COFFEE_POINTS = 25;

export interface Runner {
  y: number;
  vy: number;
  grounded: boolean;
  jumpsLeft: number;
  held: number;
}

export const START_RUNNER: Runner = { y: GROUND, vy: 0, grounded: true, jumpsLeft: 2, held: 0 };

export type ThingKind = "bug" | "bugs" | "coffee";

export interface Thing {
  id: number;
  kind: ThingKind;
  x: number;
  /** Top edge. */
  y: number;
  w: number;
  h: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Jump (or double-jump) if one is left. */
export function jump(runner: Runner): Runner {
  if (runner.jumpsLeft <= 0) return runner;
  return {
    ...runner,
    vy: runner.grounded ? JUMP_VELOCITY : DOUBLE_JUMP_VELOCITY,
    grounded: false,
    jumpsLeft: runner.jumpsLeft - 1,
    held: 0,
  };
}

/** Advances the runner by `dt` seconds; `holding` stretches the current jump. */
export function stepRunner(runner: Runner, dt: number, holding: boolean): Runner {
  let { y, vy, held } = runner;
  let gravity = GRAVITY;
  if (holding && vy < 0 && held < MAX_HOLD) {
    gravity *= HOLD_GRAVITY;
    held += dt;
  }
  vy += gravity * dt;
  y += vy * dt;
  if (y >= GROUND) return { y: GROUND, vy: 0, grounded: true, jumpsLeft: 2, held: 0 };
  return { ...runner, y, vy, held };
}

/** Run speed in units per second, ramping up over time. */
export function speedAt(seconds: number): number {
  return Math.min(640, 300 + seconds * 9);
}

/** Distance to the next obstacle: always jumpable, tighter as speed grows. */
export function nextGap(speed: number, random: number): number {
  return 150 + speed * (0.62 + random * 0.75);
}

/** A new obstacle or coffee cup at `x`. */
export function makeThing(id: number, x: number, random: number): Thing {
  if (random < 0.22) {
    const lift = 70 + (random / 0.22) * 70;
    return { id, kind: "coffee", x, y: GROUND - lift - 22, w: 22, h: 22 };
  }
  if (random < 0.42) return { id, kind: "bugs", x, y: GROUND - 44, w: 30, h: 44 };
  return { id, kind: "bug", x, y: GROUND - 22, w: 30, h: 22 };
}

/** The runner's hitbox, a little forgiving. */
export function runnerBox(runner: Runner): Box {
  const pad = 5;
  return {
    x: RUNNER_X + pad,
    y: runner.y - RUNNER.h + pad,
    w: RUNNER.w - pad * 2,
    h: RUNNER.h - pad,
  };
}

export function overlaps(a: Box, b: Box, pad = 4): boolean {
  return (
    a.x + pad < b.x + b.w && b.x + pad < a.x + a.w && a.y + pad < b.y + b.h && b.y + pad < a.y + a.h
  );
}

export function scoreFor(distance: number, coffees: number): number {
  return Math.floor(distance / 10) + coffees * COFFEE_POINTS;
}

export function runnerVerdict(score: number): string {
  if (score >= 1500) return "Unstoppable. Ship it.";
  if (score >= 800) return "Senior-level reflexes.";
  if (score >= 400) return "Bugs fear you.";
  if (score >= 150) return "Warming up nicely.";
  return "The bugs got lucky. Again?";
}
