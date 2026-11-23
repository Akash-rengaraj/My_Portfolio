"use client";

import { useEffect, useRef } from "react";

const QUOTES = [
  { name: "Priya S.", role: "Founder, Loop", text: "We launched in a week. A week!" },
  { name: "Marcus L.", role: "Designer", text: "The first tool my whole team actually enjoys." },
  { name: "Aiko T.", role: "PM, Kite", text: "Support answers faster than my coworkers." },
  { name: "Diego R.", role: "Indie hacker", text: "Paid for itself on day two." },
  { name: "Sara K.", role: "Engineer", text: "Clean API, great docs, zero surprises." },
  { name: "Tom W.", role: "CTO, Brightly", text: "We moved 40 services over without a hitch." },
] as const;

/**
 * Scrolls a row forever with the Web Animations API (no CSS keyframes to
 * install). Pauses on hover and stays still for reduced-motion users.
 */
function useMarquee(reverse: boolean, seconds: number) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const frames = [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }];
    const animation = el.animate(reverse ? [...frames].reverse() : frames, {
      duration: seconds * 1000,
      iterations: Infinity,
    });
    const pause = () => animation.pause();
    const play = () => animation.play();
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", play);
    return () => {
      animation.cancel();
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", play);
    };
  }, [reverse, seconds]);

  return ref;
}

/** One quote card. */
function Quote({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <figure className="w-72 shrink-0 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <blockquote className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        “{text}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-linear-to-br from-orange-400 to-rose-500 text-xs font-bold text-white"
        >
          {name.charAt(0)}
        </span>
        <span className="text-sm">
          <span className="block font-semibold text-zinc-900 dark:text-white">{name}</span>
          <span className="text-zinc-500">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One endlessly scrolling row; the quotes are doubled so the loop is seamless. */
function Row({
  quotes,
  reverse,
}: {
  quotes: readonly (typeof QUOTES)[number][];
  reverse: boolean;
}) {
  const ref = useMarquee(reverse, 40);
  return (
    <ul ref={ref} className="flex w-max gap-4">
      {[...quotes, ...quotes].map((q, i) => (
        <li key={`${q.name}-${i}`} aria-hidden={i >= quotes.length || undefined}>
          <Quote {...q} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A testimonials wall: two rows of quotes drifting in opposite directions,
 * fading out at the edges.
 */
export function TestimonialMarquee({ title = "People are talking" }: { title?: string }) {
  return (
    <section className="w-full overflow-hidden rounded-3xl bg-zinc-50 py-14 dark:bg-zinc-900/50">
      <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {title}
      </h2>
      <div className="mt-10 space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Row quotes={QUOTES.slice(0, 3)} reverse={false} />
        <Row quotes={QUOTES.slice(3)} reverse />
      </div>
    </section>
  );
}
