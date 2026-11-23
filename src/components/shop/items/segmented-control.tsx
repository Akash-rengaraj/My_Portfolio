"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * A segmented control whose pill slides to the chosen option. It behaves like
 * a radio group: arrow keys move the choice, Home / End jump to the ends.
 */
export function SegmentedControl({
  options = ["Daily", "Weekly", "Monthly"],
  defaultValue,
  onChange,
  label = "Range",
}: {
  options?: readonly string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0] ?? "");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.indexOf(value));
  const count = options.length;

  const choose = (i: number) => {
    const next = (i + count) % count;
    const option = options[next];
    if (option === undefined) return;
    setValue(option);
    onChange?.(option);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: count - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    choose(target);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative grid rounded-full bg-zinc-200/80 p-1 dark:bg-zinc-800"
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(.3,1.3,.5,1)] dark:bg-zinc-950"
        style={{
          width: `calc((100% - 0.5rem) / ${count})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option, i) => (
        <button
          key={option}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={option === value}
          tabIndex={option === value ? 0 : -1}
          onClick={() => choose(i)}
          className="relative rounded-full px-5 py-2 text-sm font-medium text-zinc-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 aria-checked:text-zinc-900 dark:text-zinc-400 dark:aria-checked:text-white"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
