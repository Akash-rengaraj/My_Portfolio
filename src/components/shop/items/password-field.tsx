"use client";

import { useId, useState } from "react";

const RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "Upper & lower case", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

const LEVELS = [
  { label: "Too weak", bar: "bg-rose-500" },
  { label: "Weak", bar: "bg-orange-500" },
  { label: "Okay", bar: "bg-amber-400" },
  { label: "Good", bar: "bg-lime-500" },
  { label: "Strong", bar: "bg-emerald-500" },
] as const;

/** How many of the rules a password passes (0–4). */
export function passwordScore(password: string): number {
  return RULES.filter((rule) => rule.test(password)).length;
}

/**
 * A password input with a show / hide toggle, a four-segment strength meter
 * and a live checklist of what's still missing.
 */
export function PasswordField({ label = "Password" }: { label?: string }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const score = passwordScore(value);
  const level = LEVELS[score] ?? LEVELS[0];

  return (
    <div className="w-72">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <div className="mt-1.5 flex rounded-xl border border-zinc-300 bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 dark:border-zinc-700 dark:bg-zinc-950">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="new-password"
          aria-describedby={`${id}-strength`}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-zinc-900 outline-none dark:text-white"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <div aria-hidden="true" className="mt-2 grid grid-cols-4 gap-1">
        {RULES.map((rule, i) => (
          <span
            key={rule.label}
            className={`h-1.5 rounded-full transition-colors duration-300 ${i < score ? level.bar : "bg-zinc-200 dark:bg-zinc-800"}`}
          />
        ))}
      </div>
      <p
        id={`${id}-strength`}
        aria-live="polite"
        className="mt-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
      >
        {value ? `Strength: ${level.label}` : "Use a mix of letters, numbers and symbols."}
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
        {RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}
            >
              {ok ? "✓" : "○"} {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
