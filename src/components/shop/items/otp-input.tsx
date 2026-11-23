"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

/**
 * A one-time-code input: one box per digit, auto-advances as you type,
 * Backspace steps back, arrows move, and pasting a whole code fills every box.
 * `onComplete` fires when all digits are in.
 */
export function OtpInput({
  length = 6,
  onComplete,
}: {
  length?: number;
  onComplete?: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const done = digits.every((d) => d !== "");

  const focus = (i: number) => boxes.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const update = (next: string[]) => {
    setDigits(next);
    if (next.every((d) => d !== "")) onComplete?.(next.join(""));
  };

  const type = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = [...digits];
    next[i] = digit;
    update(next);
    focus(i + 1);
  };

  const onKeyDown = (i: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
      } else if (i > 0) {
        next[i - 1] = "";
        focus(i - 1);
      }
      setDigits(next);
    } else if (event.key === "ArrowLeft") {
      focus(i - 1);
    } else if (event.key === "ArrowRight") {
      focus(i + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    update(next);
    focus(pasted.length);
  };

  return (
    <fieldset className="flex flex-col items-center gap-3">
      <legend className="mb-3 text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Enter the code we sent you
      </legend>
      <div className="flex gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            value={digit}
            onChange={(e) => type(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`Digit ${i + 1} of ${length}`}
            data-filled={digit !== ""}
            className="size-12 rounded-xl border-2 border-zinc-300 bg-white text-center text-xl font-bold text-zinc-900 caret-orange-500 transition-colors outline-none focus:border-orange-500 data-[filled=true]:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:data-[filled=true]:border-zinc-300"
          />
        ))}
      </div>
      <p
        aria-live="polite"
        className={`text-xs font-medium ${done ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
      >
        {done ? "✓ Code complete" : "Tip: paste the whole code"}
      </p>
    </fieldset>
  );
}
