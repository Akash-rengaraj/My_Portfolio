"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const COMMANDS = [
  { label: "New file", group: "Create", keys: "N" },
  { label: "New folder", group: "Create", keys: "⇧N" },
  { label: "Search docs", group: "Help", keys: "/" },
  { label: "Toggle dark mode", group: "View", keys: "D" },
  { label: "Open settings", group: "View", keys: "," },
  { label: "Invite teammate", group: "Team", keys: "I" },
  { label: "Log out", group: "Account", keys: "Q" },
] as const;

/**
 * A ⌘K / Ctrl+K command palette: fuzzy-ish search, arrow keys to move, Enter
 * to run. Built on the native <dialog>, so focus and Escape just work.
 */
export function CommandPalette({ onRun }: { onRun?: (label: string) => void }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [last, setLast] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const results = COMMANDS.filter(
    (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
  );
  const current = Math.min(active, Math.max(0, results.length - 1));

  const open = () => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
  };

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) {
          dialog.current.close();
        } else {
          setQuery("");
          setActive(0);
          dialog.current?.showModal();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (label: string) => {
    setLast(label);
    onRun?.(label);
    dialog.current?.close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + results.length) % Math.max(1, results.length));
    } else if (event.key === "Enter" && results[current]) {
      event.preventDefault();
      run(results[current].label);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={open}
        className="flex w-64 items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        Search commands…
        <kbd className="rounded border border-zinc-300 px-1.5 text-xs dark:border-zinc-700">⌘K</kbd>
      </button>
      {last ? <p className="text-xs text-zinc-500">Ran: {last}</p> : null}
      <dialog
        ref={dialog}
        aria-label="Command palette"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="mx-auto mt-[15vh] w-[min(32rem,calc(100%-2rem))] overflow-hidden rounded-2xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm dark:bg-zinc-900 dark:text-white"
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Type a command…"
          role="combobox"
          aria-expanded="true"
          aria-controls={id}
          aria-activedescendant={results[current] ? `${id}-${current}` : undefined}
          className="w-full border-b border-zinc-200 bg-transparent px-5 py-4 outline-none dark:border-zinc-800"
        />
        <ul id={id} role="listbox" className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-zinc-500">No matches.</li>
          ) : null}
          {results.map((command, i) => (
            <li
              key={command.label}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === current}
              onPointerMove={() => setActive(i)}
              onClick={() => run(command.label)}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm aria-selected:bg-orange-500 aria-selected:text-white"
            >
              <span>
                {command.label} <span className="text-xs opacity-60">· {command.group}</span>
              </span>
              <kbd className="text-xs opacity-60">{command.keys}</kbd>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}
