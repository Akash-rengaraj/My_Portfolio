"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useInView } from "@/components/works/use-in-view";
import { useReducedMotion } from "@/components/works/use-reduced-motion";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import { ScribbleUnderline } from "@/components/world/scribble";
import { COLLEGE_TOWN, HOMETOWN, ROLES, SCHOOLING } from "@/content/journey";

import { CollegeTicket, RoleSticker, RouteMap, SchoolTicket, TownSign } from "./journey-cards";

type Side = "left" | "right" | "wide";

/**
 * One stop on the road. The pin sits on the route line; the card goes to the
 * left or right of it (or spans the road). Stops start faded and light up
 * when the traveller reaches them (`data-reached`, set by the scroll handler).
 */
function Stop({ side, pin = true, children }: { side: Side; pin?: boolean; children: ReactNode }) {
  const column =
    side === "left"
      ? "md:col-start-1 md:pr-14"
      : side === "right"
        ? "md:col-start-2 md:pl-14"
        : "md:col-span-2";
  return (
    <li data-stop className="group relative pl-12 md:grid md:grid-cols-2 md:pl-0">
      {pin ? (
        <span
          aria-hidden="true"
          className="absolute top-6 left-5 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-full border-2 border-signal bg-map transition-transform duration-500 group-data-[reached=true]:scale-110 md:left-1/2"
        >
          <span className="size-2 rounded-full bg-signal transition-opacity duration-500 group-data-[reached=false]:opacity-0" />
        </span>
      ) : null}
      <div
        className={`relative transition-[opacity,translate,filter] duration-700 ease-out group-data-[reached=false]:translate-y-4 group-data-[reached=false]:opacity-45 group-data-[reached=false]:saturate-50 ${column}`}
      >
        {children}
      </div>
    </li>
  );
}

/**
 * "My Journey" — chapter 04, the road. A route drawn down the page from
 * Sivakasi to Coimbatore: school tickets, the one-way ticket to college, the
 * roles picked up on the way, and a "you are here" pin. The orange line and
 * the traveller follow your scroll.
 */
export function JourneySection() {
  const reduced = useReducedMotion();
  const routeRef = useRef<HTMLOListElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef);

  useEffect(() => {
    const route = routeRef.current;
    if (!route) return;
    const stops = [...route.querySelectorAll<HTMLElement>("[data-stop]")];

    if (reduced) {
      route.style.setProperty("--progress", "1");
      for (const stop of stops) stop.dataset.reached = "true";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.62;
      const rect = route.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      route.style.setProperty("--progress", progress.toFixed(4));
      for (const stop of stops) {
        stop.dataset.reached = String(stop.getBoundingClientRect().top + 24 < anchor);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [reduced]);

  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="relative bg-[var(--bg-journey)] text-stage-foreground"
      style={{
        backgroundImage:
          "repeating-radial-gradient(circle at 12% 18%, transparent 0 44px, var(--map-line) 44px 45px), repeating-radial-gradient(circle at 88% 64%, transparent 0 56px, var(--map-line) 56px 57px)",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-stats)]" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        {/* Header: chapter, title and the little route map */}
        <div ref={headerRef} className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ChapterMarker chapter="road" note="where I come from, and where I'm headed" />
            <h2
              id="journey-title"
              className="relative mt-6 inline-block font-heading text-6xl font-semibold tracking-tight md:text-8xl"
            >
              My Journey
              <ScribbleUnderline
                drawn={headerInView}
                className="absolute -bottom-3 left-0 h-5 w-full text-signal"
              />
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-snug text-stage-foreground/75">
              From the fireworks town of {HOMETOWN.name} to an AI &amp; Data Science degree in{" "}
              {COLLEGE_TOWN.name} — picking up a few hats along the way.
            </p>
          </div>
          <div className="lg:col-span-5">
            <RouteMap drawn={headerInView} />
          </div>
        </div>

        {/* The road */}
        <ol
          ref={routeRef}
          aria-label="Journey, from school to now"
          className="relative mt-20 space-y-14 md:space-y-20"
        >
          {/* Planned road (dashed), travelled road (orange) and the traveller */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-5 border-l-2 border-dashed border-line-strong md:left-1/2"
          />
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-5 w-[3px] origin-top -translate-x-[2px] scale-y-[var(--progress,1)] rounded-full bg-signal md:left-1/2"
          />
          <span
            aria-hidden="true"
            className="absolute top-[calc(var(--progress,1)*100%)] left-5 z-20 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
          >
            <span className="flex items-center gap-1 rounded-full bg-signal py-1 pr-2.5 pl-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-white uppercase shadow-[0_6px_14px_-6px_var(--signal)]">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                <path d="M4 2.5 19.5 10l-6.8 1.9L9.6 19Z" />
              </svg>
              you
            </span>
          </span>

          <Stop side="wide" pin={false}>
            <div className="relative z-10 flex md:justify-center">
              <TownSign town={HOMETOWN} sparks />
            </div>
          </Stop>

          {SCHOOLING.map((school, i) => (
            <Stop key={school.id} side={i % 2 === 0 ? "left" : "right"}>
              <SchoolTicket school={school} />
            </Stop>
          ))}

          <Stop side="wide" pin={false}>
            <div className="relative z-10">
              <p className="mb-4 font-hand text-2xl text-stage-muted md:mx-auto md:w-fit md:bg-map md:px-3 md:text-center">
                then I packed a bag and headed north-west…
              </p>
              <CollegeTicket />
            </div>
          </Stop>

          <Stop side="wide" pin={false}>
            <div className="relative z-10 flex md:justify-center">
              <TownSign town={COLLEGE_TOWN} />
            </div>
          </Stop>

          <Stop side="wide" pin={false}>
            <div className="relative z-10">
              <p className="mb-6 font-mono text-xs tracking-[0.2em] text-stage-muted uppercase md:mx-auto md:w-fit md:bg-map md:px-3 md:text-center">
                hats picked up on the way
              </p>
              <ul className="grid gap-6 md:grid-cols-3">
                {ROLES.map((role) => (
                  <RoleSticker key={role.id} role={role} />
                ))}
              </ul>
            </div>
          </Stop>

          <Stop side="wide" pin={false}>
            <div className="relative z-10 flex flex-col items-start gap-3 md:items-center md:text-center">
              <span className="relative inline-flex items-center gap-3 rounded-full border-2 border-signal bg-surface px-4 py-2 font-mono text-xs font-semibold tracking-[0.18em] uppercase">
                <span className="relative grid size-3 place-items-center">
                  <span className="absolute inset-0 rounded-full bg-signal/60 motion-safe:animate-ping" />
                  <span className="size-2.5 rounded-full bg-signal" />
                </span>
                you are here
              </span>
              <p className="-rotate-1 font-hand text-3xl leading-tight md:bg-map md:px-3 md:text-4xl">
                next stop: maybe your team.
              </p>
              <a
                href="#play"
                className="font-mono text-xs tracking-[0.16em] text-stage-muted uppercase underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:bg-map md:px-3"
              >
                meanwhile, there are games after this ↓
              </a>
            </div>
          </Stop>
        </ol>
      </div>
    </section>
  );
}
