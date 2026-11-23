"use client";

import { useEffect, useState } from "react";

/** Grey placeholder shapes that pulse while content loads. */
function Bone({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

/**
 * A loading skeleton that matches the shape of the real card, then swaps in
 * the content — so nothing jumps when it arrives. The demo reloads every few
 * seconds.
 */
export function SkeletonCard() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setLoaded((l) => !l), 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      aria-busy={!loaded}
      className="w-72 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {loaded ? (
        <>
          <div className="aspect-video rounded-xl bg-linear-to-br from-orange-400 to-violet-500" />
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white">
              A
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Sunset over the bay
              </p>
              <p className="text-xs text-zinc-500">Ana · 2 min ago</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <Bone className="aspect-video w-full rounded-xl" />
          <div className="mt-4 flex items-center gap-3">
            <Bone className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          </div>
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {loaded ? "Loaded" : "Loading"}
      </span>
    </div>
  );
}
