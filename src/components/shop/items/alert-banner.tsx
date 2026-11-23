"use client";

import { useState, type ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, { box: string; icon: string; title: string }> = {
  info: {
    box: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100",
    icon: "i",
    title: "Heads up",
  },
  success: {
    box: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100",
    icon: "✓",
    title: "All done",
  },
  warning: {
    box: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100",
    icon: "!",
    title: "Careful",
  },
  danger: {
    box: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100",
    icon: "✕",
    title: "Something broke",
  },
};

/** One dismissible alert. Errors and warnings announce themselves (role="alert"). */
export function AlertBanner({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  const t = TONES[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={`flex w-full gap-3 rounded-xl border p-4 text-sm ${t.box}`}
    >
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-current/15 text-xs font-bold"
      >
        {t.icon}
      </span>
      <div className="flex-1">
        <p className="font-semibold">{title ?? t.title}</p>
        <div className="mt-0.5 opacity-85">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => setShown(false)}
        aria-label="Dismiss"
        className="grid size-7 shrink-0 place-items-center rounded-lg opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/** Demo: all four tones. */
export function AlertBannerDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <AlertBanner tone="info">Maintenance on Sunday, 2–3 AM.</AlertBanner>
      <AlertBanner tone="success">Your profile was updated.</AlertBanner>
      <AlertBanner tone="warning">Your trial ends in 3 days.</AlertBanner>
      <AlertBanner tone="danger">Payment failed — check your card.</AlertBanner>
    </div>
  );
}
