/**
 * Rules for "One Spark": sky lanterns drift over the town; you get one spark
 * per round. Every blast that touches a lantern sets it off too, so a good
 * spark starts a chain reaction. Catch enough lanterns to clear the level.
 */

export interface Level {
  lanterns: number;
  goal: number;
}

export const LEVELS: readonly Level[] = [
  { lanterns: 8, goal: 1 },
  { lanterns: 10, goal: 3 },
  { lanterns: 14, goal: 5 },
  { lanterns: 18, goal: 8 },
  { lanterns: 22, goal: 12 },
  { lanterns: 26, goal: 16 },
  { lanterns: 30, goal: 21 },
  { lanterns: 34, goal: 26 },
  { lanterns: 38, goal: 32 },
  { lanterns: 44, goal: 39 },
];

/** Blast timing (seconds) and size (px at an 800px-wide sky). */
export const BLAST = { grow: 0.3, hold: 1.05, shrink: 0.35, radius: 46 } as const;

export const LANTERN_RADIUS = 7;

/** Radius of a blast `age` seconds after it went off (0 once it's over). */
export function blastRadius(age: number, max: number = BLAST.radius): number {
  if (age < 0) return 0;
  if (age < BLAST.grow) return max * (1 - (1 - age / BLAST.grow) ** 3);
  if (age < BLAST.grow + BLAST.hold) return max;
  const fade = (age - BLAST.grow - BLAST.hold) / BLAST.shrink;
  return fade >= 1 ? 0 : max * (1 - fade);
}

export function blastOver(age: number): boolean {
  return age >= BLAST.grow + BLAST.hold + BLAST.shrink;
}

/** True when a lantern at distance (dx, dy) from a blast is inside it. */
export function touches(dx: number, dy: number, blast: number, lantern = LANTERN_RADIUS): boolean {
  if (blast <= 0) return false;
  const reach = blast + lantern;
  return dx * dx + dy * dy <= reach * reach;
}

/** Blast size scaled to the sky's width, so small screens stay fair. */
export function scaledRadius(width: number): number {
  return BLAST.radius * Math.min(1.15, Math.max(0.72, width / 800));
}

export function passed(level: Level, caught: number): boolean {
  return caught >= level.goal;
}

/** Encouragement after a round. */
export function roundMessage(level: Level, caught: number): string {
  if (caught >= level.lanterns) return "Every single lantern. Spectacular.";
  if (passed(level, caught)) return "Sky's lit. Onwards!";
  if (level.goal - caught <= 2) return "So close — one more spark?";
  return "The sky's still dark. Try another spot.";
}
