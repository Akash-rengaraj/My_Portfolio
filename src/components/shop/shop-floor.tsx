"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import {
  matchesQuery,
  SHOP_CATEGORIES,
  SHOP_ITEMS,
  stockIn,
  type ShopCategory,
  type ShopItem,
  type ShopSlug,
} from "./catalog";
import { PREVIEWS } from "./previews";

/** One source file of an item, as read at build time. */
export type SourceFile = { path: string; code: string };

type Aisle = "all" | ShopCategory;
type CopyState = "idle" | "copied" | "failed";

const BACK_HOME = { pathname: "/", hash: "shop" } as const;

const linkPill =
  "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors hover:border-signal/60 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const actionButton =
  "rounded-full border border-line px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

/** File name without its folders. */
const baseName = (path: string) => path.split("/").pop() ?? path;

/** One product on the shelf: live preview, details, and its code to view or copy. */
function ProductCard({
  item,
  number,
  files,
}: {
  item: ShopItem & { slug: ShopSlug };
  number: number;
  files: readonly SourceFile[];
}) {
  const Preview = PREVIEWS[item.slug];
  const codeId = useId();
  const [running, setRunning] = useState(!item.heavy);
  const [showCode, setShowCode] = useState(false);
  const [tab, setTab] = useState(0);
  const [copy, setCopy] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);
  const file = files[tab] ?? files[0];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(file?.code ?? "");
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopy("idle"), 1800);
  };

  const stage = item.wide
    ? `block p-3 sm:p-5 ${item.heavy ? "h-[36rem]" : ""}`
    : "grid min-h-72 place-items-center p-8";

  return (
    <li
      data-product={item.slug}
      className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_48px_-32px_var(--shadow-ink)] ${item.wide ? "md:col-span-2 2xl:col-span-3" : ""}`}
    >
      <div
        className={`relative border-b border-line bg-stage pt-14 ${stage}`}
        style={{
          backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute top-4 left-4 -rotate-6 rounded-sm bg-signal px-2 py-0.5 font-hand text-lg leading-none text-white shadow-sm"
        >
          free
        </span>
        <span className="absolute top-4 right-4 font-mono text-[11px] tracking-[0.15em] text-stage-muted uppercase">
          No. {String(number).padStart(2, "0")}
        </span>
        {running ? (
          <div className={item.wide ? "h-full" : "contents"}>
            <Preview />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="group grid size-full place-items-center rounded-2xl border border-dashed border-line-strong bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <span className="flex flex-col items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-16 place-items-center rounded-full bg-signal text-2xl text-white shadow-lg transition-transform group-hover:scale-110"
              >
                ▶
              </span>
              <span className="font-mono text-xs tracking-[0.18em] text-stage-muted uppercase">
                start {item.name}
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
          <span className="font-mono text-[10px] tracking-[0.18em] text-stage-muted uppercase">
            {item.category}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-stage-foreground/70">{item.blurb}</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-tint px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-stage-muted uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            aria-expanded={showCode}
            aria-controls={codeId}
            onClick={() => setShowCode((open) => !open)}
            className={actionButton}
          >
            {showCode ? "hide code" : "view code"}
          </button>
          <button
            type="button"
            onClick={() => void copyCode()}
            className={`${actionButton} border-stage-foreground bg-stage-foreground text-stage hover:bg-stage-foreground/85`}
          >
            {copy === "copied"
              ? "copied ✓"
              : copy === "failed"
                ? "couldn't copy"
                : files.length > 1
                  ? "copy this file"
                  : "copy code"}
          </button>
          {item.heavy && running ? (
            <button type="button" onClick={() => setRunning(false)} className={actionButton}>
              stop
            </button>
          ) : null}
          <span role="status" className="sr-only">
            {copy === "copied" ? `${baseName(file?.path ?? item.slug)} copied` : ""}
          </span>
        </div>
      </div>

      <div
        id={codeId}
        hidden={!showCode}
        className="border-t border-line bg-[#0b0b0d] text-zinc-200"
      >
        {files.length > 1 ? (
          <div
            role="group"
            aria-label="Files"
            className="flex gap-1 overflow-x-auto border-b border-white/10 px-2 py-2"
          >
            {files.map((f, i) => (
              <button
                key={f.path}
                type="button"
                aria-pressed={i === tab}
                onClick={() => setTab(i)}
                className="shrink-0 rounded-md px-2.5 py-1 font-mono text-[11px] text-zinc-400 hover:text-white aria-pressed:bg-white/10 aria-pressed:text-white"
              >
                {baseName(f.path)}
              </button>
            ))}
          </div>
        ) : null}
        <p className="border-b border-white/10 px-4 py-2 font-mono text-[11px] tracking-[0.08em] text-zinc-400">
          src/{file?.path}
        </p>
        <pre className="max-h-[28rem] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed">
          <code>{file?.code}</code>
        </pre>
      </div>
    </li>
  );
}

/**
 * Inside the UI Components Shop: search, aisles to browse, and every piece on
 * the shelves with a live preview and its code. `sources` maps each item's
 * slug to its source files, read at build time.
 */
export function ShopFloor({
  sources,
}: {
  sources: Readonly<Record<string, readonly SourceFile[]>>;
}) {
  const searchId = useId();
  const [aisle, setAisle] = useState<Aisle>("all");
  const [query, setQuery] = useState("");
  const items = SHOP_ITEMS.filter(
    (item) => (aisle === "all" || item.category === aisle) && matchesQuery(item, query),
  );
  const aisles: { id: Aisle; count: number }[] = [
    { id: "all", count: SHOP_ITEMS.length },
    ...SHOP_CATEGORIES.map((id) => ({ id, count: stockIn(id) })),
  ];

  return (
    <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-32 md:pb-32 xl:px-14">
      <Link href={BACK_HOME} className={linkPill}>
        <span aria-hidden="true">←</span> back to the portfolio
      </Link>

      <header className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-stage-muted uppercase">
            <span className="text-signal">come on in</span>
            <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
            <span>the shop floor</span>
          </p>
          <h1 className="mt-6 font-heading text-5xl font-semibold tracking-tight sm:text-6xl md:text-8xl">
            UI Components <span className="text-signal">Shop</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/75">
            Everything you need to build a whole website — page sections, heroes, forms, menus,
            dialogs, data and even games. Try each piece live, open its code and copy it straight
            into your project.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-3 font-mono text-xs tracking-[0.12em] uppercase lg:col-span-5">
          {[
            ["in stock", String(SHOP_ITEMS.length)],
            ["built with", "React + Tailwind v4"],
            ["price", "free"],
          ].map(([term, value]) => (
            <div key={term} className="rounded-2xl border border-line bg-surface p-4">
              <dt className="text-stage-muted">{term}</dt>
              <dd className="mt-1 text-sm font-semibold tracking-normal text-stage-foreground normal-case">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="sticky top-16 z-20 -mx-2 mt-12 flex flex-col gap-3 rounded-2xl bg-[var(--bg-shop)]/90 px-2 py-3 backdrop-blur-md lg:flex-row lg:items-center">
        <label
          htmlFor={searchId}
          className="flex items-center gap-3 rounded-full border border-line-strong bg-surface px-4 py-2.5 font-mono text-sm focus-within:border-signal lg:w-72"
        >
          <span aria-hidden="true" className="text-signal">
            ⌕
          </span>
          <span className="sr-only">Search the shop</span>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search: form, modal, game…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-stage-foreground caret-signal outline-none placeholder:text-stage-muted/60"
          />
        </label>
        <div
          role="group"
          aria-label="Aisles"
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
        >
          {aisles.map(({ id, count }) => (
            <button
              key={id}
              type="button"
              aria-pressed={aisle === id}
              onClick={() => setAisle(id)}
              className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors hover:border-signal/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-pressed:border-stage-foreground aria-pressed:bg-stage-foreground aria-pressed:text-stage"
            >
              {id} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-6 font-mono text-xs tracking-[0.12em] text-stage-muted uppercase"
      >
        {items.length} {items.length === 1 ? "piece" : "pieces"} on show
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <ProductCard
            key={item.slug}
            item={item}
            number={SHOP_ITEMS.findIndex((i) => i.slug === item.slug) + 1}
            files={sources[item.slug] ?? []}
          />
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="mt-10 text-center font-hand text-3xl text-stage-muted">
          nothing on the shelves for “{query}” — try another word
        </p>
      ) : null}

      <footer className="mt-16 flex flex-col items-start gap-5 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-stage-foreground/70">
          The UI pieces need only React and Tailwind CSS v4. The games and heroes are bigger: every
          file they use is listed in their code tabs. New pieces land on the shelves regularly.
        </p>
        <Link href={BACK_HOME} className={linkPill}>
          <span aria-hidden="true">←</span> back to the portfolio
        </Link>
      </footer>
    </div>
  );
}
