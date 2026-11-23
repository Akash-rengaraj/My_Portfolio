/**
 * Breadcrumbs that show where you are. The last crumb is the current page
 * (not a link, marked with aria-current); long trails truncate in the middle.
 */
export function Breadcrumbs({
  trail = [
    { label: "Home", href: "#" },
    { label: "Projects", href: "#" },
    { label: "Website redesign", href: "#" },
    { label: "Moodboard" },
  ],
}: {
  trail?: readonly { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-1.5">
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className="font-medium text-zinc-900 dark:text-white"
                >
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="max-w-32 truncate text-zinc-500 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
                >
                  {crumb.label}
                </a>
              )}
              {last ? null : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-3.5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
