"use client";

import { useState } from "react";

/**
 * A paper slip that gets a rubber stamp slammed onto it. The stamp drops in
 * oversized and lands with a little overshoot; click again to lift it off.
 */
export function StampCard({
  title = "Request #204",
  detail = "New landing page",
  label = "Approved",
}: {
  title?: string;
  detail?: string;
  label?: string;
}) {
  const [stamped, setStamped] = useState(false);

  return (
    <div className="relative w-64 rounded-md bg-amber-50 p-5 font-mono text-zinc-800 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/5">
      <p className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">{title}</p>
      <p className="mt-1 text-sm font-semibold">{detail}</p>
      <div className="mt-4 space-y-1.5" aria-hidden="true">
        <div className="h-1.5 w-full rounded bg-zinc-300/70" />
        <div className="h-1.5 w-4/5 rounded bg-zinc-300/70" />
        <div className="h-1.5 w-3/5 rounded bg-zinc-300/70" />
      </div>
      <button
        type="button"
        aria-pressed={stamped}
        onClick={() => setStamped((on) => !on)}
        className="mt-5 rounded-full border border-zinc-800 px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors hover:bg-zinc-800 hover:text-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        {stamped ? "lift stamp" : "stamp it"}
      </button>
      <span
        aria-hidden="true"
        data-on={stamped}
        className="pointer-events-none absolute top-6 right-3 scale-[1.8] -rotate-12 rounded-md border-[3px] border-red-600 px-3 py-1 text-lg font-black tracking-[0.18em] text-red-600 uppercase opacity-0 mix-blend-multiply transition-[opacity,scale] duration-200 ease-[cubic-bezier(.2,1.6,.4,1)] data-[on=true]:scale-100 data-[on=true]:opacity-90"
      >
        {label}
      </span>
      <span role="status" className="sr-only">
        {stamped ? `Stamped: ${label}` : ""}
      </span>
    </div>
  );
}
