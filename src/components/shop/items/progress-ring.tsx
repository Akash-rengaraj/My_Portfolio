"use client";

import { useState } from "react";

/** A circular progress meter with the percentage in the middle. */
export function ProgressRing({
  value,
  size = 120,
  label = "Progress",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-zinc-200 dark:stroke-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="stroke-orange-500 transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xl font-bold text-zinc-900 tabular-nums dark:text-white">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

/** A slim linear progress bar. */
export function ProgressBar({ value, label = "Upload" }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/** Demo: a ring and a bar driven by the same buttons. */
export function ProgressDemo() {
  const [value, setValue] = useState(64);
  return (
    <div className="flex w-64 flex-col items-center gap-5">
      <ProgressRing value={value} />
      <ProgressBar value={value} />
      <div className="flex gap-2">
        {[-10, +10].map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => setValue((v) => Math.min(100, Math.max(0, v + step)))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:text-zinc-200"
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
      </div>
    </div>
  );
}
