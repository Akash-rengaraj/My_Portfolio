import type { ContributionDay } from "@/lib/dev-stats";

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Orange-on-dark levels: the site's single accent, from faint to full. */
const LEVEL_FILL = [
  "rgb(255 255 255 / 0.07)",
  "color-mix(in srgb, var(--signal) 30%, transparent)",
  "color-mix(in srgb, var(--signal) 55%, transparent)",
  "color-mix(in srgb, var(--signal) 80%, transparent)",
  "var(--signal)",
] as const;

function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Columns of seven (Sunday first), padding the first week so days line up. */
export function toWeeks(days: readonly ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];
  const cells: (ContributionDay | null)[] = [
    ...Array.from({ length: weekday(days[0]!.date) }, () => null),
    ...days,
  ];
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** GitHub-style contribution grid as one SVG; each cell has a native tooltip. */
export function Heatmap({ days }: { days: readonly ContributionDay[] }) {
  const weeks = toWeeks(days);
  const width = weeks.length * STEP;
  const height = 7 * STEP + 18;

  // Month label above the first week that starts in a new month.
  const labels: { x: number; text: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d !== null);
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (labels.length === 0 || wi * STEP - (labels.at(-1)?.x ?? 0) > STEP * 3) {
        labels.push({ x: wi * STEP, text: MONTHS[month] ?? "" });
      }
      lastMonth = month;
    }
  });

  return (
    <div className="[scrollbar-width:thin] overflow-x-auto pb-1" dir="rtl">
      <svg
        dir="ltr"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`${days.reduce((sum, d) => sum + d.count, 0)} contributions in the last year`}
        className="block"
      >
        {labels.map((label) => (
          <text
            key={`${label.x}-${label.text}`}
            x={label.x}
            y={10}
            fontSize={10}
            fill="currentColor"
            className="font-mono text-stage-muted"
          >
            {label.text}
          </text>
        ))}
        <g transform="translate(0 18)">
          {weeks.map((week, wi) =>
            week.map((day, di) =>
              day ? (
                <rect
                  key={day.date}
                  x={wi * STEP}
                  y={di * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2.5}
                  fill={LEVEL_FILL[day.level]}
                  className="transition-opacity hover:opacity-60"
                >
                  <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}</title>
                </rect>
              ) : null,
            ),
          )}
        </g>
      </svg>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] text-stage-muted"
      aria-hidden="true"
    >
      less
      {LEVEL_FILL.map((fill) => (
        <span key={fill} className="size-2.5 rounded-[2px]" style={{ background: fill }} />
      ))}
      more
    </span>
  );
}
