/** Turns a series into an SVG polyline inside a width × height box. */
export function sparkPath(values: readonly number[], width: number, height: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * A dashboard KPI card: label, big number, change versus last period (green
 * up, red down) and a sparkline of the trend.
 */
export function StatSparkline({
  label = "Monthly revenue",
  value = "$48,210",
  change = 12.4,
  series = [12, 18, 15, 22, 19, 27, 24, 31, 29, 36],
}: {
  label?: string;
  value?: string;
  change?: number;
  series?: readonly number[];
}) {
  const up = change >= 0;
  const path = sparkPath(series, 120, 40);
  return (
    <div className="w-72 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-bold tracking-tight text-zinc-900 tabular-nums dark:text-white">
            {value}
          </p>
          <p
            className={`mt-1 text-xs font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
          >
            {up ? "▲" : "▼"} {Math.abs(change)}%{" "}
            <span className="font-normal text-zinc-500">vs last month</span>
          </p>
        </div>
        <svg viewBox="0 0 120 40" className="h-10 w-28" aria-hidden="true">
          <path
            d={`${path} L120 40 L0 40 Z`}
            className={up ? "fill-emerald-500/15" : "fill-rose-500/15"}
          />
          <path
            d={path}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={up ? "stroke-emerald-500" : "stroke-rose-500"}
          />
        </svg>
      </div>
    </div>
  );
}
