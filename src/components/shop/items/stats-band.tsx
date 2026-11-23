"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const STATS = [
  { value: 12000, suffix: "+", label: "Active users" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
  { value: 48, suffix: "", label: "Countries" },
  { value: 4.9, suffix: "★", label: "Average rating", decimals: 1 },
] as const;

/** Counts from 0 to `target` with an ease-out once `ref`'s element scrolls into view. */
function useCountUp(ref: RefObject<HTMLElement | null>, target: number, ms = 1400): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        setValue(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        observer.disconnect();
        run();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, target, ms]);

  return value;
}

/** One big number. */
function Stat({
  value,
  suffix,
  label,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useCountUp(ref, value);
  return (
    <div className="text-center">
      <p
        ref={ref}
        className="text-4xl font-bold tracking-tight text-white tabular-nums @3xl:text-5xl"
      >
        {shown.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        <span className="text-orange-400">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}

/** A band of key numbers that count up when they scroll into view. */
export function StatsBand({
  stats = STATS,
}: {
  stats?: readonly { value: number; suffix: string; label: string; decimals?: number }[];
}) {
  return (
    <section className="@container w-full rounded-3xl bg-zinc-950 px-6 py-12">
      <div className="grid grid-cols-2 gap-8 @3xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
