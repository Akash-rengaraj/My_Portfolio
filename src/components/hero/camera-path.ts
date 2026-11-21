/**
 * Scroll-timing math for the hero: the scroll →
 * story-time warp that gives chosen moments a slow-motion feel. Pure functions.
 */

export interface TimeWarp {
  /** Story time (0–1) of the moment to slow down around. */
  at: number;
  /** Half-width of the slowed window in story time. */
  radius: number;
  /** 0–1: how much of normal speed remains at the centre (0.25 = 4× slow-mo). */
  speed: number;
}

/**
 * Remap linear scroll progress to story time so chosen moments (the catch,
 * the deploy) take more scroll distance — a scroll-driven slow-motion ramp.
 * Monotonic, maps 0→0 and 1→1.
 */
export function warpProgress(progress: number, warps: readonly TimeWarp[], samples = 400): number {
  const p = Math.min(1, Math.max(0, progress));
  if (warps.length === 0) return p;

  // Scroll needed per unit of story time: higher inside slow-mo windows.
  const density = (t: number) =>
    warps.reduce((acc, w) => {
      const d = Math.abs(t - w.at) / w.radius;
      if (d >= 1) return acc;
      const falloff = 0.5 * (1 + Math.cos(Math.PI * d)); // 1 at centre → 0 at edge
      return acc + falloff * (1 / w.speed - 1);
    }, 1);

  // Integrate density to get scroll(t), then invert by binary search.
  const cumulative: number[] = [0];
  for (let i = 1; i <= samples; i++) {
    const t0 = (i - 1) / samples;
    const t1 = i / samples;
    cumulative.push(cumulative[i - 1]! + ((density(t0) + density(t1)) / 2) * (t1 - t0));
  }
  const total = cumulative[samples]!;
  const targetScroll = p * total;

  let lo = 0;
  let hi = samples;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid]! < targetScroll) lo = mid;
    else hi = mid;
  }
  const c0 = cumulative[lo]!;
  const c1 = cumulative[hi]!;
  const frac = c1 > c0 ? (targetScroll - c0) / (c1 - c0) : 0;
  return (lo + frac) / samples;
}

/**
 * Progress (0–1) through a pinned section from its bounding-rect top, its
 * height and the viewport height — what ScrollTrigger will report for it.
 */
export function sectionProgress(top: number, height: number, viewportHeight: number): number {
  const distance = height - viewportHeight;
  if (distance <= 0) return 0;
  return Math.min(1, Math.max(0, -top / distance));
}
