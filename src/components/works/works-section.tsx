"use client";

import { useRef, useState } from "react";

import { PROJECTS } from "@/content/projects";
import { ALL, categoriesOf, filterProjects, moveIndex, techCounts } from "@/lib/works";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import { ScribbleArrow, ScribbleUnderline } from "@/components/world/scribble";

import { ProjectDialog } from "./project-dialog";
import { ProjectTile } from "./project-tile";
import { Reveal } from "./reveal";
import { useCountUp } from "./stat-tile";
import { useInView } from "./use-in-view";

const CATEGORIES = categoriesOf(PROJECTS);
const TECHS = techCounts(PROJECTS);
const SHIPPED = PROJECTS.filter((p) => p.status === "shipped").length;
const countIn = (category: string) => filterProjects(PROJECTS, category).length;

/** Sticky notes on the board, each in its own paper colour and angle. */
const GLANCE = [
  { value: PROJECTS.length, label: "projects built", paper: "#fff3a8", tilt: -3 },
  { value: SHIPPED, label: "shipped & live", paper: "#ffd6e2", tilt: 2 },
  { value: TECHS.length, label: "tools used", paper: "#cfe6ff", tilt: -1.5 },
] as const;

/** A sticky note whose number counts up when the board comes into view. */
function StickyStat({
  stat,
  play,
  stamp = false,
}: {
  stat: (typeof GLANCE)[number];
  play: boolean;
  /** This note has one of the hidden passport stamps on it. */
  stamp?: boolean;
}) {
  const value = useCountUp(stat.value, play);
  return (
    <li
      style={{ background: stat.paper, rotate: `${stat.tilt}deg` }}
      className="relative flex min-w-0 flex-1 flex-col justify-between gap-3 rounded-sm p-4 text-[#2a2620] shadow-[0_14px_22px_-14px_rgba(60,40,10,0.55)] transition-[rotate,translate] duration-300 hover:-translate-y-1 hover:rotate-0 sm:p-5 dark:brightness-[0.82] dark:saturate-[0.85]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-signal shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25),0_2px_3px_rgba(0,0,0,0.35)]"
      />
      <span className="font-heading text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
        {value}
      </span>
      <span className="font-hand text-xl leading-none">{stat.label}</span>
      {stamp ? <HiddenStamp id="pinboard" className="absolute right-2 bottom-2" /> : null}
    </li>
  );
}

/** The technologies tile fills whatever the project tiles leave in the last row. */
function techTileSpan(count: number): string {
  const md = count % 2 === 1 ? "md:col-span-1" : "md:col-span-2";
  const lg = ["lg:col-span-3", "lg:col-span-2", "lg:col-span-1"][count % 3];
  return `${md} ${lg}`;
}

/**
 * "My Works" — chapter 02, the pinboard. Projects are cards taped to a cork
 * board: hover one to watch it run, pick a technology on the index card to
 * see where it was used, click to open the full case study.
 */
export function WorksSection() {
  const [category, setCategory] = useState<string>(ALL);
  const [tech, setTech] = useState<string | null>(null);
  const [hoverTech, setHoverTech] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  const lastOpened = useRef<string | null>(null);
  const glanceRef = useRef<HTMLDivElement>(null);
  const glanceInView = useInView(glanceRef);

  const visible = filterProjects(PROJECTS, category);
  const activeTech = hoverTech ?? tech;
  const hoverStack = PROJECTS.find((p) => p.slug === hoverSlug)?.stack ?? [];
  const open = visible.find((p) => p.slug === openSlug) ?? null;
  const openPosition = open ? visible.indexOf(open) : 0;

  const openProject = (slug: string) => {
    lastOpened.current = slug;
    setOpenSlug(slug);
  };

  const step = (direction: 1 | -1) => {
    const next = moveIndex(
      openPosition,
      direction === 1 ? "ArrowRight" : "ArrowLeft",
      visible.length,
    );
    const target = next === null ? null : visible[next];
    if (target) openProject(target.slug);
  };

  return (
    <section
      id="works"
      aria-labelledby="works-title"
      className="relative bg-[var(--bg-works)] text-stage-foreground"
      style={{
        backgroundImage: "radial-gradient(var(--board-dot) 1.2px, transparent 1.2px)",
        backgroundSize: "22px 22px",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-hero)]" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        {/* Header: chapter, title, filters and the sticky-note numbers */}
        <Reveal>
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ChapterMarker
                chapter="pinboard"
                note="things I've shipped — and a few still cooking"
              />
              <h2
                id="works-title"
                className="relative mt-6 inline-block font-heading text-6xl font-semibold tracking-tight md:text-8xl"
              >
                My Works
                <ScribbleUnderline
                  drawn={glanceInView}
                  className="absolute -bottom-3 left-0 h-5 w-full text-signal"
                />
              </h2>
              <div
                role="group"
                aria-label="Filter projects by category"
                className="mt-10 flex flex-wrap gap-2"
              >
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === category}
                    onClick={() => setCategory(item)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 font-mono text-xs tracking-[0.12em] uppercase shadow-[0_6px_14px_-10px_var(--shadow-ink)] transition-[background-color,color,border-color,translate] hover:-translate-y-0.5 hover:border-stage-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-pressed:border-stage-foreground aria-pressed:bg-stage-foreground aria-pressed:text-stage"
                  >
                    {item === ALL ? "All" : item}
                    <span className="rounded-full bg-tint px-1.5 text-[10px] tabular-nums">
                      {countIn(item)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={glanceRef} className="relative lg:col-span-5">
              <p className="mb-5 flex items-center gap-2 font-hand text-xl text-stage-muted">
                at a glance
                <ScribbleArrow className="h-7 w-9 rotate-12 text-stage-muted" />
              </p>
              <ul aria-label="At a glance" className="flex gap-4">
                {GLANCE.map((stat, i) => (
                  <StickyStat key={stat.label} stat={stat} play={glanceInView} stamp={i === 2} />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* The board: equal cards, 1 / 2 / 3 per row */}
        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, position) => (
            <Reveal key={project.slug} delay={position * 70} className="h-full">
              <ProjectTile
                project={project}
                index={PROJECTS.indexOf(project)}
                dimmed={activeTech !== null && !project.stack.includes(activeTech)}
                onOpen={openProject}
                onHover={setHoverSlug}
                buttonRef={(el) => {
                  if (el) tileRefs.current.set(project.slug, el);
                  else tileRefs.current.delete(project.slug);
                }}
              />
            </Reveal>
          ))}

          {/* Index card: hover or click a technology to light up the projects that use it */}
          <div
            className={`relative overflow-hidden rounded-md border border-line bg-surface p-6 pl-12 shadow-[0_18px_36px_-24px_var(--shadow-ink)] sm:p-7 sm:pl-14 ${techTileSpan(visible.length)}`}
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0 31px, color-mix(in srgb, var(--cool) 22%, transparent) 31px 32px)",
              backgroundPositionY: "52px",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-8 w-px bg-signal/50 sm:left-10"
            />
            <p className="font-hand text-2xl leading-none text-stage-foreground/85">
              where I used what
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-stage-muted uppercase">
              pick a tool → see its projects
            </p>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Technologies">
              {TECHS.map(({ tech: name, count }) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={tech === name}
                  data-used={hoverStack.includes(name)}
                  onClick={() => setTech(tech === name ? null : name)}
                  onPointerEnter={(event) => event.pointerType === "mouse" && setHoverTech(name)}
                  onPointerLeave={() => setHoverTech(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 font-mono text-xs text-stage-foreground/85 transition-colors hover:border-signal/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal aria-pressed:border-signal aria-pressed:bg-signal aria-pressed:text-white data-[used=true]:border-signal data-[used=true]:bg-signal/10 data-[used=true]:text-stage-foreground"
                >
                  {name}
                  {count > 1 ? (
                    <span className="rounded-full bg-tint px-1.5 text-[10px] tabular-nums">
                      {count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProjectDialog
        project={open}
        position={openPosition}
        total={visible.length}
        onClose={() => setOpenSlug(null)}
        onStep={step}
        onCloseFocus={() => {
          const slug = lastOpened.current;
          if (slug) tileRefs.current.get(slug)?.focus();
        }}
      />
    </section>
  );
}
