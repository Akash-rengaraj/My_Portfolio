/** Deterministic torn edge: a jagged top border, so sections feel like layered paper. */
function tornPath(teeth: number, seed: number): string {
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const step = 1000 / teeth;
  const points: string[] = ["M0 0", "L0 10"];
  for (let i = 0; i <= teeth; i++) {
    const x = Math.min(1000, i * step + (random() - 0.5) * step * 0.6);
    const y = 6 + random() * 16;
    points.push(`L${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  points.push("L1000 0", "Z");
  return points.join(" ");
}

const EDGES = {
  torn: tornPath(70, 7),
  tornAlt: tornPath(64, 31),
} as const;

/**
 * Sits at the top of a section and paints the previous section's colour
 * down into it with a ripped-paper edge. `colorClass` sets that colour
 * (e.g. `text-stage`).
 */
export function PaperEdge({
  colorClass,
  variant = "torn",
}: {
  colorClass: string;
  variant?: keyof typeof EDGES;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 24"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-4 w-full drop-shadow-[0_3px_3px_var(--shadow-ink)] sm:h-6 ${colorClass}`}
    >
      <path d={EDGES[variant]} fill="currentColor" />
    </svg>
  );
}
