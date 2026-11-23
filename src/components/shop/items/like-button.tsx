"use client";

import { useEffect, useRef, useState } from "react";

const BURST = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

/**
 * A like button with a heart that pops and throws a ring of sparks, plus a
 * count that ticks up. Toggle it off and the count goes back down. The sparks
 * use the Web Animations API and are skipped for reduced motion.
 */
export function LikeButton({
  initialCount = 128,
  onChange,
}: {
  initialCount?: number;
  onChange?: (liked: boolean) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [pops, setPops] = useState(0);
  const sparks = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = sparks.current;
    if (pops === 0 || !root || typeof root.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const animations = Array.from(root.children, (child, i) =>
      (child as HTMLElement).animate(
        [
          { transform: `rotate(${BURST[i]}deg) translateY(-4px) scale(1)`, opacity: 1 },
          { transform: `rotate(${BURST[i]}deg) translateY(-17px) scale(0)`, opacity: 0 },
        ],
        { duration: 550, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
      ),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [pops]);

  const toggle = () => {
    const next = !liked;
    setLiked(next);
    if (next) setPops((p) => p + 1);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={toggle}
      className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 aria-pressed:border-rose-300 aria-pressed:text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
    >
      <span className="relative grid size-5 place-items-center">
        <span ref={sparks} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {BURST.map((deg) => (
            <span
              key={deg}
              className="absolute top-1/2 left-1/2 -mt-0.5 -ml-0.5 size-1 rounded-full bg-rose-500 opacity-0"
            />
          ))}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 transition-transform duration-300 ease-[cubic-bezier(.3,1.8,.5,1)] group-active:scale-75 group-aria-pressed:scale-110"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20s-7-4.4-9.3-9C1.2 7.8 3.1 4 6.8 4c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.7 0 5.6 3.8 4.1 7-2.3 4.6-9.3 9-9.3 9z" />
        </svg>
      </span>
      <span className="tabular-nums">{initialCount + (liked ? 1 : 0)}</span>
    </button>
  );
}
