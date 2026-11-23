"use client";

import { useState } from "react";

/**
 * The page numbers to show: always the first and last, the current page and
 * its neighbours, and "…" for the gaps — e.g. 1 … 4 5 6 … 20.
 */
export function pageList(current: number, total: number, siblings = 1): (number | "…")[] {
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= total; p++) {
    const near = Math.abs(p - current) <= siblings;
    if (p === 1 || p === total || near) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return pages;
}

const item =
  "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

/** Numbered pagination with previous / next and smart ellipses. */
export function Pagination({
  total = 20,
  initialPage = 5,
  onChange,
}: {
  total?: number;
  initialPage?: number;
  onChange?: (page: number) => void;
}) {
  const [page, setPage] = useState(initialPage);

  const go = (next: number) => {
    const clamped = Math.min(total, Math.max(1, next));
    setPage(clamped);
    onChange?.(clamped);
  };

  return (
    <nav aria-label="Pagination">
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page === 1}
            className={`${item} text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900`}
            aria-label="Previous page"
          >
            ←
          </button>
        </li>
        {pageList(page, total).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-zinc-400">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => go(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`${item} text-zinc-700 hover:bg-zinc-100 aria-[current=page]:bg-zinc-900 aria-[current=page]:text-white dark:text-zinc-300 dark:hover:bg-zinc-900 dark:aria-[current=page]:bg-white dark:aria-[current=page]:text-zinc-900`}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page === total}
            className={`${item} text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900`}
            aria-label="Next page"
          >
            →
          </button>
        </li>
      </ul>
    </nav>
  );
}
