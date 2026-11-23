"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { Reveal } from "@/components/works/reveal";
import { PaperEdge } from "@/components/world/paper-edge";
import { ScribbleArrow } from "@/components/world/scribble";

import { SHOP_CATEGORIES, SHOP_ITEMS } from "./catalog";

/** How long the door takes to swing open before we walk in. */
const DOOR_MS = 650;

/**
 * Swings the shop door open, then walks in. Clicks meant for a new tab, and
 * visitors who prefer reduced motion, go straight through the link instead.
 */
function useShopDoor() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    if (open) return;
    setOpen(true);
    timer.current = window.setTimeout(() => router.push("/shop"), DOOR_MS);
  };

  return { open, enter };
}

/** The display window: a few pieces from the shelves, set out on a ledge. */
function DisplayWindow() {
  return (
    <div className="relative flex min-h-56 flex-col justify-end overflow-hidden rounded-lg border-4 border-stage-foreground/80 bg-stage sm:min-h-64">
      {/* Glass reflection */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_28%,color-mix(in_srgb,var(--stage-foreground)_8%,transparent)_42%,transparent_52%)]"
      />
      <span className="absolute top-3 left-4 -rotate-3 font-hand text-xl text-stage-foreground/70">
        {SHOP_ITEMS.length} in stock
      </span>
      <div aria-hidden="true" className="flex items-end justify-around gap-3 px-4 pt-12 pb-2">
        {/* a switch */}
        <span className="relative h-6 w-12 shrink-0 rounded-full bg-signal">
          <span className="absolute top-1 right-1 size-4 rounded-full bg-surface" />
        </span>
        {/* a button */}
        <span className="shrink-0 rounded-full bg-stage-foreground px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-stage uppercase">
          click
        </span>
        {/* a ticket */}
        <span className="hidden h-10 w-16 shrink-0 rotate-6 rounded-md border-r-2 border-dashed border-surface bg-[linear-gradient(135deg,var(--signal),color-mix(in_srgb,var(--signal)_60%,var(--cool)))] sm:block" />
        {/* a card */}
        <span className="flex h-14 w-12 shrink-0 -rotate-3 flex-col gap-1 rounded-md border border-line-strong bg-surface p-1.5">
          <span className="h-1 w-full rounded bg-cool/60" />
          <span className="h-1 w-2/3 rounded bg-line-strong" />
          <span className="h-1 w-4/5 rounded bg-line-strong" />
        </span>
      </div>
      {/* The ledge */}
      <span aria-hidden="true" className="mx-2 mb-2 h-2 rounded-sm bg-stage-foreground/70" />
    </div>
  );
}

/** The arched shop door. Opening it reveals the warm light of the shop inside. */
function ShopDoor({
  open,
  onEnter,
}: {
  open: boolean;
  onEnter: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href="/shop"
      onClick={onEnter}
      aria-label="Enter the UI Components Shop"
      data-open={open}
      className="group/door relative block h-full min-h-56 w-28 rounded-t-[3rem] border-4 border-stage-foreground/80 [perspective:900px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:min-h-64 sm:w-36"
    >
      {/* The lit shop behind the door */}
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-t-[2.6rem] bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--signal)_70%,var(--surface)),color-mix(in_srgb,var(--signal)_25%,var(--stage))_70%)]"
      >
        <span className="absolute inset-x-3 top-1/3 h-1 rounded bg-stage-foreground/30" />
        <span className="absolute inset-x-3 top-1/2 h-1 rounded bg-stage-foreground/30" />
      </span>
      {/* The door itself */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left [transform:rotateY(0deg)] rounded-t-[2.6rem] bg-[color-mix(in_srgb,var(--signal)_82%,var(--stage-foreground))] shadow-[inset_0_0_0_6px_color-mix(in_srgb,var(--stage-foreground)_18%,transparent)] transition-transform duration-700 ease-[cubic-bezier(.6,0,.2,1)] group-hover/door:[transform:rotateY(-16deg)] group-data-[open=true]/door:[transform:rotateY(-82deg)] motion-reduce:transition-none"
      >
        {/* window */}
        <span className="absolute inset-x-4 top-4 h-1/3 rounded-t-full border-2 border-stage-foreground/30 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_55%,transparent),color-mix(in_srgb,var(--surface)_15%,transparent))]" />
        {/* lower panels */}
        <span className="absolute inset-x-4 bottom-4 h-1/4 rounded-sm border-2 border-stage-foreground/25" />
        {/* knob */}
        <span className="absolute top-[58%] right-3 size-3 rounded-full bg-surface shadow-[0_1px_2px_var(--shadow-ink)]" />
        {/* hanging OPEN sign */}
        <span className="absolute top-[38%] left-1/2 flex origin-top -translate-x-1/2 flex-col items-center transition-transform duration-500 group-hover/door:rotate-6">
          <span className="h-3 w-8 border-x border-t border-stage-foreground/50" />
          <span className="rounded-sm bg-surface px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.2em] text-signal shadow-sm">
            OPEN
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * The UI Components Shop's storefront — a detour off the main road. The full
 * shop lives on its own page, so this section stays one screen tall however
 * many components are on the shelves.
 */
export function ShopSection() {
  const { open, enter } = useShopDoor();

  return (
    <section
      id="shop"
      aria-labelledby="shop-title"
      className="relative overflow-hidden bg-[var(--bg-shop)] text-stage-foreground"
      style={{
        // Clapboard siding on the shop wall.
        backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px)",
        backgroundSize: "100% 34px",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-toolkit)]" />
      <div className="mx-auto grid w-full max-w-[110rem] grid-cols-1 gap-14 px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 lg:grid-cols-12 lg:items-center xl:px-14">
        <Reveal className="lg:col-span-5">
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-stage-muted uppercase">
              <span className="text-signal">detour</span>
              <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
              <span>the shop</span>
            </p>
            <p className="-rotate-1 font-hand text-2xl leading-tight text-stage-foreground/75 sm:text-[1.7rem]">
              things I built at the bench, free to take home
            </p>
          </div>
          <h2
            id="shop-title"
            className="mt-6 font-heading text-6xl font-semibold tracking-tight md:text-7xl"
          >
            UI Components Shop
          </h2>
          <p className="mt-4 font-mono text-xs tracking-[0.2em] text-cool uppercase">
            {SHOP_ITEMS.length} pieces · {SHOP_CATEGORIES.length} aisles · free to copy
          </p>
          <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/70">
            Everything you need to build a whole website: page sections, heroes, forms, menus,
            dialogs and data, plus the games I made for this portfolio. Step inside to try each
            piece live and copy its code.
          </p>
          <Link
            href="/shop"
            onClick={enter}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-stage-foreground px-6 py-3 font-mono text-xs tracking-[0.18em] text-stage uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            enter the shop <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <div className="relative mx-auto w-full max-w-2xl">
            {/* Sign board */}
            <div className="relative z-10 mx-auto -mb-3 w-fit rounded-xl border-2 border-stage-foreground/80 bg-surface px-6 py-3 text-center shadow-[0_10px_24px_-14px_var(--shadow-ink)]">
              <p className="font-mono text-[10px] tracking-[0.3em] text-stage-muted uppercase">
                est. 2026 · open daily
              </p>
              <p className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                UI Components <span className="text-signal">Shop</span>
              </p>
            </div>
            {/* Striped awning with a scalloped hem */}
            <div
              aria-hidden="true"
              className="relative h-14 rounded-t-xl border-2 border-b-0 border-stage-foreground/80"
              style={{
                background:
                  "repeating-linear-gradient(90deg, var(--signal) 0 40px, var(--surface) 40px 80px)",
              }}
            >
              <span
                className="absolute inset-x-0 -bottom-3 h-3"
                style={{
                  background:
                    "radial-gradient(circle at 20px 0, var(--signal) 19.5px, transparent 20px) 0 0 / 80px 12px repeat-x, radial-gradient(circle at 20px 0, var(--surface) 19.5px, transparent 20px) 40px 0 / 80px 12px repeat-x",
                }}
              />
            </div>
            {/* Shop front: display window + door */}
            <div className="grid grid-cols-[1fr_auto] items-stretch gap-4 rounded-b-xl border-2 border-t-0 border-stage-foreground/80 bg-surface p-4 pt-8 shadow-[0_30px_60px_-30px_var(--shadow-ink)] sm:gap-6 sm:p-6 sm:pt-10">
              <DisplayWindow />
              <ShopDoor open={open} onEnter={enter} />
            </div>
            {/* Doormat */}
            <div className="flex justify-end pr-4 sm:pr-6">
              <span
                aria-hidden="true"
                className="mt-1 grid h-4 w-28 place-items-center rounded-sm bg-stage-foreground/80 font-mono text-[8px] tracking-[0.3em] text-stage uppercase sm:w-36"
              >
                welcome
              </span>
            </div>
            <p
              aria-hidden="true"
              className="absolute -bottom-16 left-2 flex -rotate-3 items-center gap-1 font-hand text-2xl text-stage-foreground/70 sm:left-8"
            >
              click the door to come in
              <ScribbleArrow className="h-8 w-12 -rotate-45 text-signal" />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
