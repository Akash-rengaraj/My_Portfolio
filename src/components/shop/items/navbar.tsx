"use client";

import { useId, useState } from "react";

/**
 * A responsive site navbar: logo, links and a call to action. Below ~48rem of
 * width the links fold into a menu. It uses container queries, so it adapts
 * to the box it sits in, not just the window.
 */
export function Navbar({
  brand = "Northwind",
  links = ["Product", "Features", "Pricing", "Blog"],
  cta = "Get started",
}: {
  brand?: string;
  links?: readonly string[];
  cta?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div className="@container w-full">
      <nav
        aria-label="Main"
        className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80"
      >
        <div className="flex items-center justify-between gap-4">
          <a
            href="#"
            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"
          >
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-orange-500 text-sm font-bold text-white"
            >
              {brand.charAt(0)}
            </span>
            {brand}
          </a>
          <ul className="hidden items-center gap-1 @3xl:flex">
            {links.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="rounded-full px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 @md:inline-flex dark:bg-white dark:text-zinc-900"
            >
              {cta}
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
              className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-700 @3xl:hidden dark:border-zinc-800 dark:text-zinc-300"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        <ul
          id={menuId}
          hidden={!open}
          className="mt-3 grid gap-1 border-t border-zinc-200 pt-3 @3xl:hidden dark:border-zinc-800"
        >
          {links.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="block rounded-xl px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {link}
              </a>
            </li>
          ))}
          <li className="@md:hidden">
            <a
              href="#"
              className="mt-1 block rounded-xl bg-zinc-900 px-3 py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              {cta}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
