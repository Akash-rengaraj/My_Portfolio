"use client";

import { BugArt } from "./bug-art";
import { TOTAL_BUGS, useCaughtBugs } from "./bug-store";

/** Floating progress pill, shown once the first bug is caught. Links to the case. */
export function BugCounter() {
  const caught = useCaughtBugs();
  if (caught.length === 0) return null;
  const all = caught.length >= TOTAL_BUGS;
  return (
    <a
      href="#play"
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/90 py-1.5 pr-4 pl-2 font-mono text-xs shadow-[0_12px_28px_-14px_var(--shadow-ink)] backdrop-blur-md transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
    >
      <BugArt shell={all ? "#4ade80" : "#e5484d"} wiggle={false} className="size-6" />
      <span className="tabular-nums">
        {caught.length}/{TOTAL_BUGS} caught
      </span>
      {all ? <span className="text-signal">· dev mode unlocked</span> : null}
    </a>
  );
}
