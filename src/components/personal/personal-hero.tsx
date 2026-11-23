"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useId, useRef } from "react";

import { sectionProgress } from "@/components/hero/camera-path";

import { SceneArt, StoryArt } from "./art/scene-art";
import { SCENES, STORY_SUMMARY, STORY_TITLE } from "./scenes";
import { buildPersonalTimeline } from "./story-timeline";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Without JavaScript, show the storyboard instead of the (frozen) pinned stage. */
const NO_SCRIPT_CSS =
  '[data-personal="section"]{height:auto!important}[data-personal="stage"]{display:none!important}[data-personal="storyboard"]{display:grid!important}';

/**
 * The personal side's opening: a pinned, scroll-played story of the owner
 * off the clock — coding, gaming, riding, guitar, poems, baking — each scene
 * turning into the next through a match cut. Reduced motion (and no JS) gets
 * a still storyboard of the same scenes instead.
 */
export function PersonalHero() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = buildPersonalTimeline(stage);
        // Start where the page already is (reload mid-story) instead of fast-forwarding from 0.
        const rect = section.getBoundingClientRect();
        timeline.progress(sectionProgress(rect.top, section.offsetHeight, window.innerHeight));
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          animation: timeline,
        });
        return () => {
          trigger.kill();
          timeline.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-personal="section"
      aria-label={STORY_TITLE}
      className="relative h-[620svh] bg-[#0b1026] text-white motion-reduce:h-auto"
    >
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>

      <div
        ref={stageRef}
        data-personal="stage"
        className="sticky top-0 h-svh w-full overflow-hidden motion-reduce:hidden"
      >
        <StoryArt p={`${uid}-story`} />
        <p className="sr-only">{STORY_SUMMARY}</p>

        {/* Legibility scrims */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-black/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-black/60 to-transparent"
        />

        {/* Opening frame */}
        <div
          data-intro
          className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-28 sm:px-10 md:px-14"
        >
          <p className="font-mono text-xs tracking-[0.22em] text-orange-200/90 uppercase">
            the personal side
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-balance sm:text-6xl md:text-8xl">
            {STORY_TITLE}
          </h1>
          <p className="mt-4 font-hand text-2xl text-white/80 sm:text-3xl">
            scroll, and I&apos;ll show you ↓
          </p>
        </div>

        {/* One handwritten line per scene */}
        {SCENES.map((scene, i) => (
          <p
            key={scene.id}
            data-caption={i}
            aria-hidden="true"
            className="invisible absolute top-20 left-6 max-w-[min(36rem,calc(100%-3rem))] -rotate-2 font-hand text-5xl leading-none text-orange-50 opacity-0 [text-shadow:0_2px_18px_rgb(0_0_0/0.55)] sm:top-24 sm:left-10 md:left-14 md:text-7xl"
          >
            {scene.line}
          </p>
        ))}

        {/* Route line: one dot per scene */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto w-[min(30rem,calc(100%-3rem))]"
        >
          <div className="relative h-0.5 rounded-full bg-white/25">
            <div
              data-route-fill
              className="absolute inset-0 origin-left scale-x-0 rounded-full bg-orange-400"
            />
          </div>
          <div className="-mt-[7px] flex justify-between">
            {SCENES.map((scene, i) => (
              <span
                key={scene.id}
                data-route-dot={i}
                className="size-3 rounded-full border-2 border-orange-300 bg-[#0b1026] opacity-40"
              />
            ))}
          </div>
        </div>

        <a
          href="#personal-end"
          className="absolute right-5 bottom-16 rounded-full border border-white/25 bg-black/35 px-4 py-2 font-mono text-[11px] tracking-[0.15em] text-white/85 uppercase backdrop-blur-sm transition-colors hover:border-orange-300 hover:text-orange-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 sm:bottom-6"
        >
          skip to the end ↓
        </a>
      </div>

      {/* Reduced motion / no JS: the same story as still frames */}
      <div
        data-personal="storyboard"
        className="hidden gap-10 px-6 pt-28 pb-16 motion-reduce:grid sm:px-10 md:px-14"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-orange-200/90 uppercase">
            the personal side
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">{STORY_TITLE}</h1>
        </div>
        <ol className="grid gap-8 md:grid-cols-2">
          {SCENES.map((scene) => (
            <li key={scene.id}>
              <figure>
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <SceneArt id={scene.id} p={`${uid}-${scene.id}`} />
                </div>
                <figcaption className="mt-3">
                  <span className="block font-hand text-3xl text-orange-100">{scene.line}</span>
                  <span className="text-sm text-white/70">{scene.description}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
