"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; text: string };

const TONES: Record<Tone, { icon: string; ring: string }> = {
  success: { icon: "✓", ring: "bg-emerald-500" },
  error: { icon: "!", ring: "bg-rose-500" },
  info: { icon: "i", ring: "bg-sky-500" },
};

/**
 * Toast notifications: `push(tone, text)` adds one, each disappears after
 * `ms` or when closed. Keep this hook near your app root and pass `push` down
 * (or put it in context).
 */
export function useToasts(ms = 3500) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (tone: Tone, text: string) => {
      const id = ++nextId.current;
      setToasts((all) => [...all.slice(-3), { id, tone, text }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), ms),
      );
    },
    [dismiss, ms],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  return { toasts, push, dismiss };
}

/** Where the toasts appear; screen readers hear each one. */
export function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <ol aria-live="polite" className="pointer-events-none flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <li
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 pr-2 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span
            aria-hidden="true"
            className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${TONES[toast.tone].ring}`}
          >
            {TONES[toast.tone].icon}
          </span>
          <span className="flex-1 text-zinc-800 dark:text-zinc-200">{toast.text}</span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="grid size-7 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Demo: three buttons that fire each kind of toast. */
export function ToastStack() {
  const { toasts, push, dismiss } = useToasts();
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => push("success", "Changes saved.")}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
        >
          Success
        </button>
        <button
          type="button"
          onClick={() => push("error", "Couldn't upload the file.")}
          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white"
        >
          Error
        </button>
        <button
          type="button"
          onClick={() => push("info", "A new version is ready.")}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white"
        >
          Info
        </button>
      </div>
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
