"use client";

import { useState } from "react";

type Row = {
  name: string;
  role: string;
  status: "Active" | "Invited" | "Paused";
  joined: string;
  spend: number;
};
type Key = keyof Row;

const ROWS: Row[] = [
  { name: "Ava Patel", role: "Designer", status: "Active", joined: "2025-01-14", spend: 1240 },
  { name: "Ben Ortiz", role: "Engineer", status: "Invited", joined: "2025-03-02", spend: 0 },
  { name: "Chloe Kim", role: "PM", status: "Active", joined: "2024-11-20", spend: 860 },
  { name: "Dev Sharma", role: "Engineer", status: "Paused", joined: "2024-08-09", spend: 2310 },
  { name: "Eli Novak", role: "Support", status: "Active", joined: "2025-02-17", spend: 420 },
];

const COLUMNS: { key: Key; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined" },
  { key: "spend", label: "Spend", numeric: true },
];

const PILL: Record<Row["status"], string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Invited: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Paused: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

/** Sorts rows by a column, numbers numerically and text alphabetically. */
export function sortRows(rows: readonly Row[], key: Key, dir: 1 | -1): Row[] {
  return [...rows].sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return (
      (typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y))) * dir
    );
  });
}

/**
 * A data table with a search box and sortable columns (click a header;
 * aria-sort tells screen readers the order). Scrolls sideways on small screens.
 */
export function DataTable({ rows = ROWS }: { rows?: readonly Row[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const q = query.trim().toLowerCase();
  const filtered = rows.filter(
    (r) => !q || `${r.name} ${r.role} ${r.status}`.toLowerCase().includes(q),
  );
  const shown = sortRows(filtered, sort.key, sort.dir);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-3 dark:border-zinc-800">
        <p className="pl-2 text-sm font-semibold text-zinc-900 dark:text-white">Team members</p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search members"
          className="w-40 rounded-lg border border-zinc-300 bg-transparent px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:text-white"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-zinc-500 uppercase">
              {COLUMNS.map((col) => {
                const active = sort.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    className={`px-4 py-2.5 font-medium ${col.numeric ? "text-right" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) => ({
                          key: col.key,
                          dir: s.key === col.key ? (s.dir === 1 ? -1 : 1) : 1,
                        }))
                      }
                      className="inline-flex items-center gap-1 uppercase hover:text-zinc-900 dark:hover:text-white"
                    >
                      {col.label}
                      <span
                        aria-hidden="true"
                        className={active ? "text-orange-500" : "opacity-30"}
                      >
                        {active && sort.dir === -1 ? "↓" : "↑"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr
                key={row.name}
                className="border-t border-zinc-100 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/50"
              >
                <td className="px-4 py-3 font-medium whitespace-nowrap text-zinc-900 dark:text-white">
                  {row.name}
                </td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${PILL[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{row.joined}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  ${row.spend.toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 ? (
          <p className="p-6 text-center text-sm text-zinc-500">No one matches “{query}”.</p>
        ) : null}
      </div>
    </div>
  );
}
