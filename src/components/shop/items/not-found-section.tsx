"use client";

import type { PointerEvent } from "react";

/** Makes the big 404 lean away from the pointer. */
function lean(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--lx", `${((event.clientX - rect.left) / rect.width - 0.5) * -24}px`);
  el.style.setProperty("--ly", `${((event.clientY - rect.top) / rect.height - 0.5) * -24}px`);
}

/**
 * A friendly 404 page: a giant "404" that drifts away from the pointer, a
 * short apology, and two ways back. Drop it into your not-found route.
 */
export function NotFoundSection({ homeHref = "/" }: { homeHref?: string }) {
  return (
    <section
      onPointerMove={lean}
      className="w-full rounded-3xl bg-zinc-950 px-6 py-16 text-center [--lx:0px] [--ly:0px]"
    >
      <p
        aria-hidden="true"
        className="bg-linear-to-b from-white to-zinc-600 bg-clip-text text-8xl font-black tracking-tighter text-transparent transition-transform duration-300 ease-out motion-safe:[transform:translate(var(--lx),var(--ly))] sm:text-9xl"
      >
        404
      </p>
      <h2 className="mt-4 text-2xl font-bold text-white">This page wandered off</h2>
      <p className="mx-auto mt-2 max-w-sm text-zinc-400">
        The link might be old, or the page moved. Let&apos;s get you somewhere useful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={homeHref}
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white"
        >
          Back home
        </a>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
        >
          Go back
        </button>
      </div>
    </section>
  );
}
