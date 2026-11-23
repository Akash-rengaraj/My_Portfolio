"use client";

import { useId, useState, type KeyboardEvent } from "react";

const COUNTRIES = [
  "Argentina",
  "Australia",
  "Brazil",
  "Canada",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Kenya",
  "Mexico",
  "Nepal",
  "Norway",
  "Singapore",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "United Kingdom",
  "United States",
] as const;

/**
 * An autocomplete that follows the ARIA combobox pattern: type to filter,
 * arrows to move, Enter to pick, Escape to close. Matches are highlighted.
 */
export function SearchCombobox({
  label = "Country",
  options = COUNTRIES,
  onSelect,
}: {
  label?: string;
  options?: readonly string[];
  onSelect?: (value: string) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const q = query.trim().toLowerCase();
  const matches = q
    ? options.filter((o) => o.toLowerCase().includes(q)).slice(0, 6)
    : options.slice(0, 6);
  const current = Math.min(active, Math.max(0, matches.length - 1));
  const expanded = open && matches.length > 0;

  const pick = (value: string) => {
    setQuery(value);
    setOpen(false);
    onSelect?.(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + matches.length) % Math.max(1, matches.length));
    } else if (event.key === "Enter" && expanded && matches[current]) {
      event.preventDefault();
      pick(matches[current]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  /** Bolds the part of the option that matches the query. */
  const highlight = (option: string) => {
    const at = q ? option.toLowerCase().indexOf(q) : -1;
    if (at < 0) return option;
    return (
      <>
        {option.slice(0, at)}
        <mark className="bg-transparent font-bold text-orange-600 dark:text-orange-400">
          {option.slice(at, at + q.length)}
        </mark>
        {option.slice(at + q.length)}
      </>
    );
  };

  return (
    <div className="relative w-72">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${id}-${current}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder="Start typing…"
        autoComplete="off"
        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
      />
      <ul
        id={`${id}-list`}
        role="listbox"
        hidden={!expanded}
        className="absolute z-20 mt-1 w-full rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        {matches.map((option, i) => (
          <li
            key={option}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === current}
            onPointerDown={(e) => {
              e.preventDefault();
              pick(option);
            }}
            onPointerMove={() => setActive(i)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-zinc-700 aria-selected:bg-zinc-100 dark:text-zinc-300 dark:aria-selected:bg-zinc-900"
          >
            {highlight(option)}
          </li>
        ))}
      </ul>
    </div>
  );
}
