/**
 * Rules for "Stack It": slabs slide in over the tower, alternating along the
 * x and z axes; dropping one keeps only the part that overlaps the slab below.
 * Coordinates are world units on the floor plane (x, z) with y going up.
 */

export type Axis = "x" | "z";

export interface Slab {
  x: number;
  z: number;
  w: number;
  d: number;
  /** Bottom of the slab. */
  y: number;
  hue: string;
  label: string;
}

export const BASE_SIZE = 100;
export const SLAB_HEIGHT = 16;
/** How far a slab travels either side of the tower before turning back. */
export const TRAVEL = 135;
/** Drops this close count as perfect and snap into place. */
export const PERFECT_TOLERANCE = 3.5;

/** Odd levels slide along x, even levels along z. */
export function axisFor(level: number): Axis {
  return level % 2 === 1 ? "x" : "z";
}

/** Slabs get quicker as the tower grows (units per second). */
export function speedFor(level: number): number {
  return Math.min(230, 95 + level * 6);
}

export function startOf(slab: Slab, axis: Axis): number {
  return axis === "x" ? slab.x : slab.z;
}

export function sizeOf(slab: Slab, axis: Axis): number {
  return axis === "x" ? slab.w : slab.d;
}

/** Copy of `slab` with a new start and length along `axis`. */
export function along(slab: Slab, axis: Axis, start: number, length: number): Slab {
  return axis === "x" ? { ...slab, x: start, w: length } : { ...slab, z: start, d: length };
}

export interface DropResult {
  /** What stays on the tower, or null on a miss. */
  placed: Slab | null;
  /** What falls off (the whole slab on a miss). */
  debris: Slab | null;
  perfect: boolean;
}

/** Drops `moving` onto `below`; both share a footprint except along `axis`. */
export function drop(
  below: Slab,
  moving: Slab,
  axis: Axis,
  tolerance = PERFECT_TOLERANCE,
): DropResult {
  const base = startOf(below, axis);
  const size = sizeOf(below, axis);
  const start = startOf(moving, axis);
  const delta = start - base;

  if (Math.abs(delta) <= tolerance) {
    return { placed: along(moving, axis, base, size), debris: null, perfect: true };
  }
  const overlap = size - Math.abs(delta);
  if (overlap <= 0) return { placed: null, debris: moving, perfect: false };

  if (delta > 0) {
    return {
      placed: along(moving, axis, start, overlap),
      debris: along(moving, axis, start + overlap, delta),
      perfect: false,
    };
  }
  return {
    placed: along(moving, axis, base, overlap),
    debris: along(moving, axis, start, -delta),
    perfect: false,
  };
}

/** Kind words for the final height. */
export function verdictFor(height: number): string {
  if (height >= 30) return "You could run a cloud on that.";
  if (height >= 20) return "Enterprise-grade stack.";
  if (height >= 12) return "Production-ready.";
  if (height >= 6) return "That'll carry a side project.";
  return "Every stack starts somewhere. Again?";
}
