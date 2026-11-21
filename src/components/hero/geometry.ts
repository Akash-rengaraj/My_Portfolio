/**
 * Pure 2D geometry for the hero: paper outlines and the parallax camera.
 * No DOM, no GSAP — fully unit-tested.
 */

export interface Point {
  x: number;
  y: number;
}

/** 2D camera: world point at the screen centre, zoom factor, tilt in degrees. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
  tilt: number;
}

export interface Viewport {
  width: number;
  height: number;
}

/** Deterministic PRNG (mulberry32) so server and client render identical shapes. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly spaced points along a centred rectangle's perimeter, clockwise from top-left. */
export function sheetOutline(width: number, height: number, count: number): Point[] {
  if (count < 4) throw new RangeError("count must be at least 4");
  const hw = width / 2;
  const hh = height / 2;
  const perimeter = 2 * (width + height);
  return Array.from({ length: count }, (_, i) => {
    let d = (i / count) * perimeter;
    if (d < width) return { x: -hw + d, y: -hh };
    d -= width;
    if (d < height) return { x: hw, y: -hh + d };
    d -= height;
    if (d < width) return { x: hw - d, y: hh };
    d -= width;
    return { x: -hw, y: hh - d };
  });
}

/** Crumple an outline into a lumpy paper ball; each point keeps its angle so morphs never cross. */
export function crumpledOutline(outline: Point[], radius: number, seed: number): Point[] {
  const random = createRandom(seed);
  const phase1 = random() * Math.PI * 2;
  const phase2 = random() * Math.PI * 2;
  return outline.map((point) => {
    const angle = Math.atan2(point.y, point.x);
    const r =
      radius *
      (0.86 +
        0.1 * Math.sin(3 * angle + phase1) +
        0.06 * Math.sin(8 * angle + phase2) +
        (random() - 0.5) * 0.08);
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
}

/** Nudge every point by up to `amplitude`: a sheet that was crumpled and flattened. */
export function wrinkledOutline(outline: Point[], amplitude: number, seed: number): Point[] {
  const random = createRandom(seed);
  return outline.map((p) => ({
    x: p.x + (random() * 2 - 1) * amplitude,
    y: p.y + (random() * 2 - 1) * amplitude,
  }));
}

/** Serialize for an SVG `points` attribute (fixed precision keeps tweens stable). */
export function toPointsAttr(points: Point[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

/**
 * SVG transform for a parallax layer: screen = centre + R(tilt·d)·zoom^d·(p − camera·d).
 * depth 1 = the story layer; < 1 moves less (far), > 1 moves more (near).
 */
export function layerTransform(camera: Camera, depth: number, viewport: Viewport): string {
  const scale = Math.pow(camera.zoom, depth);
  return [
    `translate(${(viewport.width / 2).toFixed(2)} ${(viewport.height / 2).toFixed(2)})`,
    `rotate(${(camera.tilt * depth).toFixed(3)})`,
    `scale(${scale.toFixed(4)})`,
    `translate(${(-camera.x * depth).toFixed(2)} ${(-camera.y * depth).toFixed(2)})`,
  ].join(" ");
}

/** Where a layer-space point lands on screen (same maths as layerTransform). */
export function worldToScreen(p: Point, camera: Camera, depth: number, viewport: Viewport): Point {
  const scale = Math.pow(camera.zoom, depth);
  const lx = (p.x - camera.x * depth) * scale;
  const ly = (p.y - camera.y * depth) * scale;
  const a = (camera.tilt * depth * Math.PI) / 180;
  return {
    x: viewport.width / 2 + lx * Math.cos(a) - ly * Math.sin(a),
    y: viewport.height / 2 + lx * Math.sin(a) + ly * Math.cos(a),
  };
}

/** Paper-space point → world space for a pose at `origin` rotated `rotDeg` degrees. */
export function localToWorld(local: Point, origin: Point, rotDeg: number): Point {
  const a = (rotDeg * Math.PI) / 180;
  return {
    x: origin.x + local.x * Math.cos(a) - local.y * Math.sin(a),
    y: origin.y + local.x * Math.sin(a) + local.y * Math.cos(a),
  };
}
