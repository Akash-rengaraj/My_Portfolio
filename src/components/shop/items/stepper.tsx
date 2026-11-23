"use client";

import { useState } from "react";

const STEPS = ["Account", "Profile", "Plan", "Done"] as const;

/**
 * A multi-step progress bar for sign-ups and checkouts: finished steps get a
 * check, the line fills as you go, and Back / Next move between steps.
 */
export function Stepper({ steps = STEPS }: { steps?: readonly string[] }) {
  const [current, setCurrent] = useState(1);
  const last = steps.length - 1;

  return (
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-zinc-950">
      <ol className="relative flex justify-between">
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 left-4 h-0.5 bg-zinc-200 dark:bg-zinc-800"
        />
        <span
          aria-hidden="true"
          className="absolute top-4 left-4 h-0.5 bg-orange-500 transition-[width] duration-500"
          style={{ width: `calc((100% - 2rem) * ${current / last})` }}
        />
        {steps.map((step, i) => {
          const state = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li
              key={step}
              aria-current={state === "current" ? "step" : undefined}
              className="relative flex flex-col items-center gap-2"
            >
              <span
                data-state={state}
                className="grid size-8 place-items-center rounded-full border-2 border-zinc-300 bg-white text-xs font-bold text-zinc-500 transition-colors duration-300 data-[state=current]:border-orange-500 data-[state=current]:text-orange-600 data-[state=done]:border-orange-500 data-[state=done]:bg-orange-500 data-[state=done]:text-white dark:border-zinc-700 dark:bg-zinc-950"
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{step}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.min(last, c + 1))}
          disabled={current === last}
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {current === last - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
