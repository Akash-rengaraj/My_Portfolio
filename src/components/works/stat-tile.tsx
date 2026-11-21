"use client";

import { useEffect, useState } from "react";

import { countUpValue } from "@/lib/works";

import type { ProjectStat } from "@/content/projects";

const DURATION_MS = 1100;

/** Counts from 0 to `target` each time `play` turns true (instantly under reduced motion). */
export function useCountUp(target: number, play: boolean): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!play) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = (now - start) / DURATION_MS;
      setValue(countUpValue(progress, target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, play]);

  return value;
}

/** Glass tile with one headline number that counts up when its project is shown. */
export function StatTile({ stat, play }: { stat: ProjectStat; play: boolean }) {
  const value = useCountUp(stat.value, play);
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-line bg-surface/80 px-4 py-3 backdrop-blur-md">
      <p className="font-heading text-2xl font-semibold tracking-tight text-stage-foreground sm:text-3xl">
        <span className="text-signal">{stat.prefix}</span>
        {stat.text ?? value}
        <span className="text-signal">{stat.suffix}</span>
      </p>
      <p className="mt-1 truncate font-mono text-[11px] tracking-[0.12em] text-stage-muted uppercase">
        {stat.label}
      </p>
    </div>
  );
}
