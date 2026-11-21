/** Pure helpers for the "My Works" section: filtering, keyboard navigation, tilt, count-up. */

/** The "show everything" filter value. */
export const ALL = "all";

/** Unique categories in order of first appearance, led by {@link ALL}. */
export function categoriesOf(items: readonly { category: string }[]): string[] {
  return [ALL, ...new Set(items.map((item) => item.category))];
}

/** Items in `category`, or all of them for {@link ALL}. */
export function filterProjects<T extends { category: string }>(
  items: readonly T[],
  category: string,
): T[] {
  return category === ALL ? [...items] : items.filter((item) => item.category === category);
}

/** Next index for a roving-tabindex list, or null if the key isn't a navigation key. */
export function moveIndex(index: number, key: string, length: number): number | null {
  if (length <= 0) return null;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return (index + 1) % length;
    case "ArrowUp":
    case "ArrowLeft":
      return (index - 1 + length) % length;
    case "Home":
      return 0;
    case "End":
      return length - 1;
    default:
      return null;
  }
}

/** "01", "02", … for a zero-based index. */
export function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Rotation (degrees) that tilts a card towards the pointer: `ry` turns it
 * around the vertical axis (pointer right → positive), `rx` around the
 * horizontal axis (pointer up → positive). Clamped to ±`max`.
 */
export function tiltFor(
  x: number,
  y: number,
  rect: RectLike,
  max: number,
): { rx: number; ry: number } {
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const nx = clamp((x - (rect.left + rect.width / 2)) / (rect.width / 2));
  const ny = clamp((y - (rect.top + rect.height / 2)) / (rect.height / 2));
  return { rx: -ny * max || 0, ry: nx * max || 0 };
}

/** Eased integer count from 0 to `target` for `progress` in 0–1 (clamped). */
export function countUpValue(progress: number, target: number): number {
  const t = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - t, 3);
  return Math.round(target * eased);
}

/** "Neo — Interactive Studio" → { name: "Neo", subtitle: "Interactive Studio" }. */
export function splitTitle(title: string): { name: string; subtitle: string } {
  const [name = title, ...rest] = title.split(" — ");
  return { name, subtitle: rest.join(" — ") };
}

/** Technologies with how many projects use them, most used first (ties keep first-seen order). */
export function techCounts(
  items: readonly { stack: readonly string[] }[],
): { tech: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items)
    for (const tech of item.stack) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  return [...counts].map(([tech, count]) => ({ tech, count })).sort((a, b) => b.count - a.count);
}
