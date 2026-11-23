"use client";

import { useState } from "react";

const STARS = [
  [16, 10],
  [28, 26],
  [40, 14],
  [22, 34],
  [48, 30],
  [34, 6],
] as const;

/**
 * A theme switch that turns a sunny sky into a starry night: the sun rolls
 * across and becomes a moon, the clouds sink and the stars come out.
 */
export function DayNightToggle({
  defaultNight = false,
  onChange,
  label = "Dark mode",
}: {
  defaultNight?: boolean;
  onChange?: (night: boolean) => void;
  label?: string;
}) {
  const [night, setNight] = useState(defaultNight);

  const toggle = () => {
    const next = !night;
    setNight(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label={label}
      onClick={toggle}
      data-night={night}
      className="group relative h-12 w-24 overflow-hidden rounded-full bg-sky-400 shadow-[inset_0_2px_6px_rgb(0_0_0/0.25)] transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 data-[night=true]:bg-indigo-950"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-data-[night=true]:opacity-100"
      >
        {STARS.map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            className="absolute size-0.5 rounded-full bg-white"
            style={{ left: x, top: y }}
          />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-3 bottom-2 h-3 w-9 rounded-full bg-white/90 transition-transform duration-500 group-data-[night=true]:translate-y-8"
      />
      <span
        aria-hidden="true"
        className="absolute right-6 bottom-3.5 size-4 rounded-full bg-white/90 transition-transform delay-75 duration-500 group-data-[night=true]:translate-y-8"
      />
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-1.5 size-9 rounded-full bg-amber-300 shadow-[0_0_14px_rgb(252_211_77/0.85)] transition-[translate,background-color,box-shadow] duration-500 ease-[cubic-bezier(.4,1.4,.5,1)] group-data-[night=true]:translate-x-12 group-data-[night=true]:bg-slate-200 group-data-[night=true]:shadow-[0_0_10px_rgb(226_232_240/0.5)]"
      >
        <span className="absolute top-2 left-4 size-2 rounded-full bg-slate-300 opacity-0 transition-opacity duration-500 group-data-[night=true]:opacity-100" />
        <span className="absolute top-5 left-2 size-1.5 rounded-full bg-slate-300 opacity-0 transition-opacity duration-500 group-data-[night=true]:opacity-100" />
      </span>
    </button>
  );
}
