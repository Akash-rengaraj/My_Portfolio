"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { author } from "@/config/site";

import { sectionProgress, warpProgress } from "./camera-path";
import { STORY_BEATS, STORY_SUMMARY, TIME_WARPS, VISITOR_CATCH_LINE } from "./story-beats";
import { StoryScene } from "./story-scene";
import { addOverlayTweens, buildStoryTimeline, type StoryController } from "./story-timeline";
import { useCatchInteraction } from "./use-catch-interaction";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MEDIA = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  narrow: "(max-aspect-ratio: 4/5)",
} as const;

/** How long the "you caught it" toast stays up. */
const TOAST_MS = 1600;

/** Wait for web fonts so handwriting widths are measured with the real face. */
async function fontsReady(): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // Font loading failed; fall back to whatever is rendered.
  }
}

const stageSize = (stage: HTMLElement) => ({
  width: stage.clientWidth,
  height: stage.clientHeight,
});

/**
 * Developer hero: one continuous, scroll-scrubbed camera move through a
 * thrown-away problem being caught, analysed, built and shipped.
 */
export function DevHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<StoryController | null>(null);
  const syncCatchRef = useRef<() => void>(() => undefined);
  const [caught, setCaught] = useState(false);
  const [toast, setToast] = useState(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      let active = true;
      let mm: gsap.MatchMedia | null = null;

      void fontsReady().then(() => {
        if (!active) return;
        mm = gsap.matchMedia();
        mm.add(MEDIA, (context) => {
          const { reduce, narrow } = context.conditions ?? {};
          const story = buildStoryTimeline({
            root: stage,
            layout: narrow ? "narrow" : "wide",
            viewport: stageSize(stage),
          });
          addOverlayTweens(story.timeline, stage);
          storyRef.current = story;

          const intro = story.playIntro();
          const observer = new ResizeObserver(() => story.setViewport(stageSize(stage)));
          observer.observe(stage);

          let scrubber: gsap.core.Tween | null = null;
          if (reduce) {
            intro.progress(1);
          } else {
            const proxy = { p: 0 };
            scrubber = gsap.to(proxy, {
              p: 1,
              ease: "none",
              paused: true,
              onUpdate: () => {
                if (proxy.p > 0 && intro.progress() < 1) intro.progress(1);
                story.timeline.progress(warpProgress(proxy.p, TIME_WARPS));
                syncCatchRef.current();
              },
            });
            // Start the scrub where the page already is (reload mid-page, or a
            // layout switch on rotate) so it never fast-forwards the story.
            const rect = section.getBoundingClientRect();
            scrubber.progress(sectionProgress(rect.top, section.offsetHeight, window.innerHeight));
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.2,
              animation: scrubber,
            });
          }

          return () => {
            observer.disconnect();
            intro.kill();
            scrubber?.kill();
            story.timeline.kill();
            storyRef.current = null;
          };
        });
      });

      return () => {
        active = false;
        mm?.revert();
      };
    },
    { scope: sectionRef },
  );

  const getStoryTime = useCallback(() => storyRef.current?.timeline.progress() ?? 0, []);
  const getBall = useCallback(
    () => storyRef.current?.ballScreen() ?? { x: Number.NaN, y: Number.NaN },
    [],
  );
  const onCatch = useCallback(() => {
    setCaught(true);
    setToast(true);
  }, []);

  const syncCatch = useCatchInteraction({ stage: stageRef, getStoryTime, getBall, onCatch });
  useEffect(() => {
    syncCatchRef.current = syncCatch;
  }, [syncCatch]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative h-[1740svh] bg-stage text-stage-foreground motion-reduce:h-svh"
    >
      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <StoryScene devName={author.handle} />
        <noscript>
          <style>{'[data-hero="svg"]{opacity:1!important}'}</style>
        </noscript>
        <p className="sr-only">{STORY_SUMMARY}</p>

        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stage to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-stage via-stage/85 to-transparent sm:h-40 sm:from-stage/80 sm:via-transparent" />

        {/* Intro */}
        <div
          data-hero="intro"
          className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-16 sm:px-10 md:px-14 md:pb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-stage-muted uppercase">
            {author.role}
          </p>
          <h1
            id="hero-title"
            className="mt-3 text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {author.name}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-balance text-stage-foreground/80 md:text-2xl">
            I catch the problems people throw away — and ship them back as{" "}
            <span className="text-signal">working software</span>.
            <HiddenStamp
              id="desk"
              className="pointer-events-auto relative ml-2 inline-block align-middle"
            />
          </p>
        </div>

        <div
          data-hero="hint"
          className="pointer-events-none absolute right-6 bottom-6 hidden items-center gap-3 font-mono text-xs tracking-[0.2em] text-stage-muted uppercase motion-reduce:hidden! sm:flex md:right-14 md:bottom-10"
        >
          scroll to play
          <span className="relative h-10 w-px overflow-hidden bg-stage-muted/40">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-signal" />
          </span>
        </div>

        {/* Beat captions */}
        <div className="pointer-events-none absolute top-20 left-6 max-w-sm sm:top-24 sm:left-10 md:left-14 md:max-w-md">
          {STORY_BEATS.map((beat) => (
            <div
              key={beat.id}
              data-hero={`caption-${beat.id}`}
              className="invisible absolute top-0 left-0 w-[min(28rem,calc(100vw-3rem))] opacity-0"
            >
              <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">
                {beat.index} / {String(STORY_BEATS.length).padStart(2, "0")} — {beat.title}
              </p>
              <p className="mt-3 text-2xl leading-tight font-medium text-balance md:text-3xl">
                {beat.id === "catch" && caught ? VISITOR_CATCH_LINE : beat.line}
              </p>
              {beat.id === "throw" ? (
                <p className="mt-3 font-mono text-xs tracking-[0.15em] text-cool uppercase motion-reduce:hidden">
                  psst — try catching it
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Visitor-catch flourish */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 top-1/4 flex justify-center"
        >
          {toast ? (
            <p className="rounded-full border border-cool/40 bg-surface/90 px-5 py-2 font-mono text-sm tracking-[0.15em] text-cool uppercase shadow-[0_0_40px_color-mix(in_srgb,var(--cool)_25%,transparent)] motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:fade-in">
              you caught it ✓
            </p>
          ) : null}
        </div>

        {/* Progress rail, styled as a commit graph */}
        <ol
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-6 hidden h-72 -translate-y-1/2 flex-col justify-between motion-reduce:hidden! sm:flex md:right-14"
        >
          <span className="absolute top-1.5 right-[5px] bottom-1.5 w-px bg-stage-muted/25" />
          <span
            data-hero="rail-fill"
            className="absolute top-1.5 right-[5px] bottom-1.5 w-px origin-top scale-y-0 bg-signal"
          />
          {STORY_BEATS.map((beat) => (
            <li
              key={beat.id}
              data-hero={`rail-${beat.id}`}
              className="relative flex items-center gap-3 opacity-35"
            >
              <span className="hidden font-mono text-[11px] tracking-[0.15em] text-stage-muted uppercase 2xl:inline">
                {beat.title}
              </span>
              <span className="size-[11px] rounded-full border-2 border-signal bg-stage" />
            </li>
          ))}
        </ol>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-stage-muted/20 sm:hidden">
          <div data-hero="progress-mobile" className="h-full origin-left scale-x-0 bg-signal" />
        </div>

        {/* Outro → rest of the portfolio */}
        <div
          data-hero="outro"
          className="invisible absolute inset-x-0 bottom-0 px-6 pb-16 opacity-0 sm:px-10 md:px-14 md:pb-20"
        >
          <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">
            problem in → product out
          </p>
          <p className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            That&apos;s the whole job. Every time.
          </p>
          <a
            href="#works"
            className="mt-6 inline-flex items-center gap-2 font-mono text-sm tracking-[0.15em] text-stage-foreground uppercase underline-offset-8 transition-colors hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            see my works <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div
          data-hero="fade"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-stage opacity-0"
        />
      </div>
    </section>
  );
}
