/**
 * What to show when a list is empty: a soft illustration, a one-line reason
 * and the single action that fixes it.
 */
export function EmptyState({
  title = "No projects yet",
  text = "Projects you create will show up here. Start with a blank one or a template.",
  action = "New project",
  onAction,
}: {
  title?: string;
  text?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
      <svg aria-hidden="true" viewBox="0 0 120 90" className="h-20 w-28">
        <rect
          x="18"
          y="22"
          width="84"
          height="58"
          rx="8"
          className="fill-zinc-100 stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-700"
          strokeWidth="2"
        />
        <path d="M18 34h84" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="2" />
        <circle
          cx="60"
          cy="56"
          r="10"
          className="fill-orange-500/20 stroke-orange-500"
          strokeWidth="2"
        />
        <path
          d="M60 51v10M55 56h10"
          className="stroke-orange-500"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M30 12l4 6M60 6v8M90 12l-4 6"
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
      >
        + {action}
      </button>
    </div>
  );
}
