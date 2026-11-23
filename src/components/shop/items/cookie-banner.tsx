"use client";

import { useState } from "react";

type Choices = { analytics: boolean; marketing: boolean };

const OPTIONS = [
  { key: "analytics", label: "Analytics", text: "Helps us see which pages people use." },
  { key: "marketing", label: "Marketing", text: "Lets us show you relevant offers elsewhere." },
] as const;

/**
 * A cookie consent card with "accept all", "only necessary" and a settings
 * panel of toggles. Calls `onSave` with the choices; you decide where to
 * store them.
 */
export function CookieBanner({ onSave }: { onSave?: (choices: Choices) => void }) {
  const [settings, setSettings] = useState(false);
  const [choices, setChoices] = useState<Choices>({ analytics: true, marketing: false });
  const [saved, setSaved] = useState<string | null>(null);

  const save = (next: Choices, message: string) => {
    onSave?.(next);
    setSaved(message);
  };

  if (saved) {
    return (
      <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm shadow-xl dark:bg-zinc-950">
        <p role="status" className="text-zinc-700 dark:text-zinc-300">
          🍪 {saved}
        </p>
        <button
          type="button"
          onClick={() => setSaved(null)}
          className="text-orange-600 underline dark:text-orange-400"
        >
          change
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl shadow-black/10 dark:bg-zinc-950"
    >
      <p className="font-semibold text-zinc-900 dark:text-white">🍪 We use cookies</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Some keep the site working; others help us improve it. You choose.
      </p>
      {settings ? (
        <ul className="mt-4 space-y-3">
          {OPTIONS.map((option) => (
            <li key={option.key} className="flex items-start justify-between gap-4">
              <span className="text-sm">
                <span className="block font-medium text-zinc-900 dark:text-white">
                  {option.label}
                </span>
                <span className="text-zinc-500">{option.text}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={choices[option.key]}
                aria-label={option.label}
                onClick={() => setChoices((c) => ({ ...c, [option.key]: !c[option.key] }))}
                className="relative mt-1 h-6 w-10 shrink-0 rounded-full bg-zinc-300 transition-colors aria-checked:bg-orange-500 dark:bg-zinc-700"
              >
                <span
                  className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${choices[option.key] ? "translate-x-4" : ""}`}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save({ analytics: true, marketing: true }, "All cookies accepted.")}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() =>
            settings
              ? save(choices, "Your choices are saved.")
              : save({ analytics: false, marketing: false }, "Only necessary cookies.")
          }
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        >
          {settings ? "Save choices" : "Only necessary"}
        </button>
        {settings ? null : (
          <button
            type="button"
            onClick={() => setSettings(true)}
            className="px-2 text-sm text-zinc-500 underline"
          >
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
