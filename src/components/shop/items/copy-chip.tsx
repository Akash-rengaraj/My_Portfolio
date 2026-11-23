"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/**
 * Shows a value (a command, an email, a coupon) with a copy button. The copy
 * icon morphs into a check when it works, and screen readers hear the result.
 */
export function CopyChip({
  value = "npx create-next-app@latest",
  label = "Copy command",
  prefix = "$",
}: {
  value?: string;
  label?: string;
  prefix?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  };

  const copied = state === "copied";

  return (
    <div className="flex max-w-full items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 pl-4 font-mono text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <span aria-hidden="true" className="text-orange-500">
        {prefix}
      </span>
      <code className="mr-3 truncate text-zinc-800 dark:text-zinc-200">{value}</code>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={label}
        className="relative grid size-9 shrink-0 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-orange-500 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 transition-[opacity,scale] duration-200 ${copied ? "scale-50 opacity-0" : ""}`}
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute size-4 text-emerald-500 transition-[opacity,scale] duration-200 ${copied ? "" : "scale-50 opacity-0"}`}
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied" : state === "failed" ? "Couldn't copy" : ""}
      </span>
    </div>
  );
}
