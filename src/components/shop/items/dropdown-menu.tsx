"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const ITEMS = [
  { label: "Edit", hint: "E" },
  { label: "Duplicate", hint: "D" },
  { label: "Share", hint: "S" },
  { label: "Delete", hint: "⌫", danger: true },
] as const;

/**
 * An accessible menu button: opens on click or arrow keys, moves with
 * arrows / Home / End, closes on Escape, Tab or a click outside, and returns
 * focus to the button.
 */
export function DropdownMenu({
  label = "Actions",
  items = ITEMS,
  onSelect,
}: {
  label?: string;
  items?: readonly { label: string; hint?: string; danger?: boolean }[];
  onSelect?: (label: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusItem = (i: number) => itemRefs.current[(i + items.length) % items.length]?.focus();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const onMenuKey = (event: KeyboardEvent) => {
    const index = itemRefs.current.findIndex((el) => el === document.activeElement);
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusItem(moves[event.key]!);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      >
        {picked ?? label}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul
        ref={menu}
        id={id}
        role="menu"
        hidden={!open}
        onKeyDown={onMenuKey}
        className="absolute left-0 z-20 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        {items.map((item, i) => (
          <li key={item.label} role="none">
            <button
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                setPicked(item.label);
                onSelect?.(item.label);
                close();
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-zinc-100 focus:bg-zinc-100 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 ${item.danger ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"}`}
            >
              {item.label}
              {item.hint ? (
                <kbd className="font-sans text-xs text-zinc-400">{item.hint}</kbd>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
