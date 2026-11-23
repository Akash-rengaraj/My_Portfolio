"use client";

import type { PointerEvent, ReactNode } from "react";

/** Moves the card's light to the pointer. */
function follow(event: PointerEvent<HTMLDivElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--x", `${event.clientX - rect.left}px`);
  el.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

/**
 * A card whose border and surface light up around the pointer, like a torch
 * sweeping over it. The 1px padding on the outer layer is the glowing border.
 */
export function SpotlightCard({
  title = "Spotlight",
  children = "Move your pointer across me and the light follows it, along the edge and across the surface.",
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      onPointerMove={follow}
      className="group w-72 rounded-2xl bg-zinc-200 p-px [--x:50%] [--y:0%] dark:bg-zinc-800"
      style={{
        backgroundImage:
          "radial-gradient(220px circle at var(--x) var(--y), rgb(249 115 22 / 0.95), transparent 65%)",
      }}
    >
      <div className="relative overflow-hidden rounded-[15px] bg-white p-6 dark:bg-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(280px circle at var(--x) var(--y), rgb(249 115 22 / 0.14), transparent 60%)",
          }}
        />
        <p className="relative text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
          {title}
        </p>
        <p className="relative mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {children}
        </p>
      </div>
    </div>
  );
}
