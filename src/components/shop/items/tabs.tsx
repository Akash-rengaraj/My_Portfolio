"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

const TABS = [
  { label: "Overview", body: "A quick look at what's happening across your workspace this week." },
  { label: "Activity", body: "Every change, comment and deploy, newest first." },
  { label: "Settings", body: "Names, members, billing and the danger zone." },
] as const;

/**
 * Accessible tabs with an underline that slides between them. Arrow keys,
 * Home and End move between tabs, as the WAI-ARIA pattern expects.
 */
export function Tabs({ tabs = TABS }: { tabs?: readonly { label: string; body: string }[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = tabs.length;

  const select = (i: number) => {
    const next = (i + count) % count;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: count - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target);
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-2 dark:bg-zinc-950">
      <div
        role="tablist"
        aria-label="Sections"
        onKeyDown={onKeyDown}
        className="relative grid border-b border-zinc-200 dark:border-zinc-800"
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            className="py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-500 aria-selected:text-zinc-900 dark:hover:text-white dark:aria-selected:text-white"
          >
            {tab.label}
          </button>
        ))}
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-0.5 rounded-full bg-orange-500 transition-transform duration-300 ease-out"
          style={{ width: `${100 / count}%`, transform: `translateX(${active * 100}%)` }}
        />
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          id={`${id}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          tabIndex={0}
          className="p-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        >
          {tab.body}
        </div>
      ))}
    </div>
  );
}
