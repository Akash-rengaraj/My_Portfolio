"use client";

import { useSyncExternalStore } from "react";

import { TOTAL_BUGS, useCaughtBugs } from "@/components/hunt/bug-store";

import { applyDevMode, readDevMode, readServerDevMode, subscribeTheme } from "./theme";

/** True while Dev Mode is on (reacts to the <html> class list). */
export function useDevMode(): boolean {
  return useSyncExternalStore(subscribeTheme, readDevMode, readServerDevMode);
}

/**
 * The `</>` switch for the Dev Mode skin. It only appears once every bug on
 * the site has been caught (or while Dev Mode is already on).
 */
export function DevModeToggle() {
  const on = useDevMode();
  const unlocked = useCaughtBugs().length >= TOTAL_BUGS;
  if (!unlocked && !on) return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Dev Mode"
      title={on ? "Leave Dev Mode" : "Dev Mode — you caught every bug"}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        applyDevMode(!on, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className="grid h-9 min-w-9 place-items-center rounded-full border border-line bg-tint px-2.5 font-mono text-xs font-bold text-signal backdrop-blur-sm transition-colors hover:border-signal/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-checked:border-signal aria-checked:bg-signal aria-checked:text-stage motion-safe:animate-in motion-safe:zoom-in-75"
    >
      {"</>"}
    </button>
  );
}
