type Status = "online" | "away" | "busy" | "offline" | "new" | "beta";

const STYLES: Record<Status, { box: string; dot: string; pulse?: boolean }> = {
  online: {
    box: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    dot: "bg-emerald-500",
    pulse: true,
  },
  away: {
    box: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  busy: {
    box: "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  offline: {
    box: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/25 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  new: { box: "bg-orange-500 text-white ring-orange-500", dot: "bg-white" },
  beta: {
    box: "bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:text-violet-300",
    dot: "bg-violet-500",
  },
};

/** A small status pill with a coloured dot; "online" gently pulses. */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${s.box}`}
    >
      <span aria-hidden="true" className="relative flex size-2">
        {s.pulse ? (
          <span
            className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${s.dot}`}
          />
        ) : null}
        <span className={`relative inline-flex size-2 rounded-full ${s.dot}`} />
      </span>
      {label ?? status}
    </span>
  );
}

/** Demo: every status. */
export function StatusBadges() {
  return (
    <div className="flex max-w-xs flex-wrap justify-center gap-2">
      {(Object.keys(STYLES) as Status[]).map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
}
