"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { RESUME_FILE, RESUME_PATH } from "@/config/resume";
import { author } from "@/config/site";
import { SECTIONS } from "@/content/sections";

import { ResumeIcon } from "./resume-icon";
import { ThemeToggle } from "./theme-toggle";
import { useActiveSection } from "./use-active-section";

const SECTION_IDS = SECTIONS.map((s) => s.id);

/** Developer / personal portfolio switch (personal is coming soon). */
function PortfolioSwitch() {
  return (
    <nav aria-label="Portfolio">
      <ul className="flex items-center gap-1 rounded-full border border-line bg-tint p-1 font-mono text-[11px] tracking-[0.15em] uppercase backdrop-blur-sm">
        <li>
          <Link
            href="/"
            aria-current="page"
            className="flex items-center gap-2 rounded-full bg-stage-foreground px-3 py-1.5 text-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:px-4"
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
            developer
          </Link>
        </li>
        <li>
          <button
            type="button"
            aria-disabled="true"
            title="Personal portfolio — coming soon"
            className="flex cursor-not-allowed items-center gap-2 rounded-full px-3 py-1.5 tracking-[0.15em] text-stage-muted uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:px-4"
          >
            personal
            <span className="hidden rounded-full border border-line px-1.5 py-px text-[9px] tracking-[0.1em] text-stage-muted/80 sm:inline">
              soon
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Opens the résumé PDF in a new tab (view there, download from the viewer).
 * Phones have no room for it in the bar; it sits in the menu there instead.
 */
function ResumeLink() {
  return (
    <a
      href={RESUME_PATH}
      target="_blank"
      rel="noopener"
      title="View résumé (PDF)"
      className="hidden h-9 items-center gap-2 rounded-full border border-line bg-tint px-3.5 font-mono text-[11px] tracking-[0.15em] text-stage-foreground uppercase backdrop-blur-sm transition-colors hover:border-signal/60 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex"
    >
      <ResumeIcon />
      resume
    </a>
  );
}

/**
 * Fixed site header, always on screen: brand, a link to every section (the
 * one you're reading is highlighted), the developer / personal switch and the
 * light / dark toggle. Below xl the section links fold into a menu.
 */
export function SiteHeader() {
  const active = useActiveSection(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on Escape or a click outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  return (
    <header
      data-scrolled={scrolled}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:bg-stage/80 data-[scrolled=true]:backdrop-blur-md"
    >
      <a
        href="#main"
        className="sr-only rounded-full bg-stage-foreground px-4 py-2 font-mono text-xs tracking-[0.15em] text-stage uppercase focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10"
      >
        skip to content
      </a>
      <div className="flex h-16 items-center justify-between gap-3 px-4 text-stage-foreground sm:px-8 xl:px-12">
        {/* Brand */}
        <Link
          href="/"
          aria-label={author.name}
          className="group/brand flex shrink-0 items-center gap-3 rounded-md font-mono text-sm tracking-[0.12em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg border border-line bg-tint text-[11px] font-semibold text-signal transition-colors group-hover/brand:border-signal/60"
          >
            {"{ }"}
          </span>
          <span aria-hidden="true" className="hidden sm:inline">
            {author.handle}
            <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-signal motion-safe:animate-[caret-blink_1.1s_steps(1)_infinite]" />
          </span>
        </Link>

        {/* Section links (wide screens) */}
        <nav aria-label="Sections" className="hidden xl:block">
          <ul className="flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-1 backdrop-blur-sm">
            {SECTIONS.map((section) => {
              const current = section.id === active;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    className="relative block rounded-full px-3.5 py-1.5 text-[13px] font-medium text-stage-foreground/70 transition-colors hover:text-stage-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-[current=location]:bg-stage-foreground aria-[current=location]:text-stage"
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Switch, theme and (below xl) the section menu */}
        <div className="flex shrink-0 items-center gap-2">
          <ResumeLink />
          <PortfolioSwitch />
          <ThemeToggle />
          <div className="relative xl:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close sections menu" : "Open sections menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-9 place-items-center rounded-full border border-line bg-tint backdrop-blur-sm transition-colors hover:border-signal/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h10" />
                )}
              </svg>
            </button>
            {menuOpen ? (
              <div
                ref={menuRef}
                id={menuId}
                className="absolute top-12 right-0 w-64 rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_48px_-20px_var(--shadow-ink)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2"
              >
                <nav aria-label="Sections">
                  <ul>
                    {SECTIONS.map((section, i) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          aria-current={section.id === active ? "location" : undefined}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stage-foreground/80 transition-colors hover:bg-tint hover:text-stage-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal aria-[current=location]:bg-stage-foreground aria-[current=location]:text-stage"
                        >
                          <span className="font-mono text-[11px] opacity-60">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {section.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-line pt-2">
                  <a
                    href={RESUME_PATH}
                    target="_blank"
                    rel="noopener"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-stage-foreground px-3 py-2.5 font-mono text-[11px] tracking-[0.14em] text-stage uppercase focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
                  >
                    <ResumeIcon />
                    resume
                  </a>
                  <a
                    href={RESUME_PATH}
                    download={RESUME_FILE}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal"
                  >
                    download ↓
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
