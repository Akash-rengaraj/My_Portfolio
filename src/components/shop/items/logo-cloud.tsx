"use client";

import { useEffect, useRef } from "react";

const LOGOS = [
  "Acme",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Vandelay",
  "Stark",
  "Wayne",
] as const;

/**
 * "Trusted by" logo strip that glides forever (Web Animations API, paused on
 * hover, still for reduced motion). Swap the word marks for your SVG logos.
 */
export function LogoCloud({
  title = "Trusted by teams at",
  logos = LOGOS,
}: {
  title?: string;
  logos?: readonly string[];
}) {
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || typeof el.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const animation = el.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
      {
        duration: 25000,
        iterations: Infinity,
      },
    );
    const pause = () => animation.pause();
    const play = () => animation.play();
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", play);
    return () => {
      animation.cancel();
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", play);
    };
  }, []);

  return (
    <section className="w-full overflow-hidden rounded-3xl bg-white py-10 dark:bg-zinc-950">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
        {title}
      </p>
      <div className="mt-6 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <ul ref={track} className="flex w-max items-center gap-14">
          {[...logos, ...logos].map((logo, i) => (
            <li
              key={`${logo}-${i}`}
              aria-hidden={i >= logos.length || undefined}
              className="text-2xl font-black tracking-tight text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white"
            >
              {logo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
