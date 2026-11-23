"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "done" | "error";

/**
 * A button that shows its own progress: spinner while `action` runs, a check
 * when it succeeds, a retry label when it fails. The width stays put, so
 * nothing jumps around it.
 */
export function LoadingButton({
  label = "Save changes",
  action = () => new Promise<void>((resolve) => setTimeout(resolve, 1200)),
}: {
  label?: string;
  action?: () => Promise<void>;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      await action();
      setState("done");
    } catch {
      setState("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const text = { idle: label, loading: "Saving…", done: "Saved", error: "Try again" }[state];

  return (
    <button
      type="button"
      onClick={() => void run()}
      aria-busy={state === "loading"}
      data-state={state}
      className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 data-[state=done]:bg-emerald-600 data-[state=error]:bg-rose-600 dark:bg-white dark:text-zinc-900 dark:data-[state=done]:bg-emerald-500 dark:data-[state=done]:text-white dark:data-[state=error]:bg-rose-500 dark:data-[state=error]:text-white"
    >
      {state === "loading" ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {state === "done" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      ) : null}
      <span aria-live="polite">{text}</span>
    </button>
  );
}
