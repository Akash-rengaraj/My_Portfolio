"use client";

import { useId, useState, type CSSProperties } from "react";

/**
 * A styled native range input (so keyboard and screen readers work for
 * free): filled track, big thumb and a value bubble that rides above it.
 */
export function RangeSlider({
  label = "Budget",
  min = 0,
  max = 1000,
  step = 10,
  initial = 420,
  format = (v: number) => `$${v}`,
}: {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
  format?: (value: number) => string;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-72">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <div className="relative mt-9">
        <output
          htmlFor={id}
          className="absolute -top-9 -translate-x-1/2 rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white tabular-nums dark:bg-white dark:text-zinc-900"
          style={{ left: `calc(${pct}% + ${(0.5 - pct / 100) * 20}px)` }}
        >
          {format(value)}
        </output>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-valuetext={format(value)}
          style={{ "--pct": `${pct}%` } as CSSProperties}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,rgb(249_115_22)_var(--pct),rgb(212_212_216)_var(--pct))] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 dark:bg-[linear-gradient(90deg,rgb(249_115_22)_var(--pct),rgb(39_39_42)_var(--pct))] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      </div>
    </div>
  );
}
