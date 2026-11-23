"use client";

import type { PointerEvent, ReactNode } from "react";

/** Moves the button's `--mx` / `--my` offsets toward the pointer. */
function pull(event: PointerEvent<HTMLButtonElement>, strength: number) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${(event.clientX - rect.left - rect.width / 2) * strength}px`);
  el.style.setProperty("--my", `${(event.clientY - rect.top - rect.height / 2) * strength}px`);
}

/** Springs the button back to rest. */
function release(event: PointerEvent<HTMLButtonElement>) {
  event.currentTarget.style.setProperty("--mx", "0px");
  event.currentTarget.style.setProperty("--my", "0px");
}

/**
 * A button that leans toward the pointer and springs back when it leaves.
 * The label moves a little less than the button, which gives it depth.
 * Motion is skipped for people who prefer reduced motion.
 */
export function MagneticButton({
  children = "Hover me",
  strength = 0.35,
  onClick,
}: {
  children?: ReactNode;
  strength?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerMove={(event) => pull(event, strength)}
      onPointerLeave={release}
      className="group inline-flex items-center rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 ease-out [--mx:0px] [--my:0px] hover:duration-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 motion-safe:[transform:translate(var(--mx),var(--my))] dark:bg-white dark:text-zinc-900"
    >
      <span className="inline-flex items-center gap-2 transition-transform duration-300 ease-out motion-safe:[transform:translate(calc(var(--mx)*0.4),calc(var(--my)*0.4))]">
        {children}
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-orange-500 transition-transform duration-300 group-hover:scale-150"
        />
      </span>
    </button>
  );
}
