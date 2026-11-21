"use client";

import { useEffect } from "react";

import { resetPassport, TOTAL_STAMPS, useStamps } from "./stamp-store";

/** Floating passport progress, shown once the first stamp is collected. */
export function StampCounter() {
  const stamps = useStamps();

  // Visiting /?fresh wipes the passport, handy for trying the hunt again.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("fresh")) {
      resetPassport();
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  }, []);

  if (stamps.length === 0) return null;
  const full = stamps.length >= TOTAL_STAMPS;
  return (
    <a
      href="#play"
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/90 py-1.5 pr-4 pl-1.5 font-mono text-xs shadow-[0_12px_28px_-14px_var(--shadow-ink)] backdrop-blur-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
    >
      {/* Mini passport */}
      <span
        aria-hidden="true"
        className="grid h-7 w-5 place-items-center rounded-[3px] bg-[#1e2a4a] text-[8px] text-[#e8c15a] shadow-sm"
      >
        ✦
      </span>
      <span className="tabular-nums">
        {stamps.length}/{TOTAL_STAMPS} stamps
      </span>
      {full ? (
        <span className="text-[#b8860b] dark:text-[#e8c15a]">· golden ticket ready</span>
      ) : null}
    </a>
  );
}
