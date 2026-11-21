"use client";

import { useId, useState, type CSSProperties, type PointerEvent } from "react";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { Reveal } from "@/components/works/reveal";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import { ScribbleArrow } from "@/components/world/scribble";
import { LANGUAGES, SKILL_DOMAINS, type SkillDomain } from "@/content/skills";

import { StackIt } from "./stack-it";

const ALL_SKILLS = [...LANGUAGES.map((l) => l.name), ...SKILL_DOMAINS.flatMap((d) => d.skills)];

/** Case-insensitive match of a language against the search query. */
function matchesLanguage(query: string, name: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return name.toLowerCase().includes(q) || "programming languages".includes(q);
}

/** Spec sheets laid on the blueprint: crisp paper with drafting corner marks. */
const tileShell =
  "relative overflow-hidden rounded-2xl border border-line bg-surface/90 p-6 shadow-[0_18px_36px_-26px_var(--shadow-ink)] sm:p-7";

/** Drafting crop marks in the four corners of a sheet. */
function CropMarks() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-2 text-cool/40">
      {[
        "top-0 left-0",
        "top-0 right-0 rotate-90",
        "right-0 bottom-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((corner) => (
        <svg key={corner} viewBox="0 0 12 12" className={`absolute size-3 ${corner}`}>
          <path d="M0.5 12 V0.5 H12" fill="none" stroke="currentColor" />
        </svg>
      ))}
    </span>
  );
}

/** Case-insensitive match of a skill (or its domain) against the search query. */
function matches(query: string, skill: string, domain: SkillDomain): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return skill.toLowerCase().includes(q) || domain.title.toLowerCase().includes(q);
}

/** Moves the tile's spotlight to the pointer. */
function spotlight(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

/**
 * "My Toolkit" — chapter 03, the workbench. Skills are spec sheets laid on a
 * blueprint, grouped by the layer of a system they serve. Search them
 * terminal-style, hover a layer of the stack diagram (or a sheet) to see how
 * the pieces fit, and finish by stacking them in Stack It.
 */
export function ToolkitSection() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<string | null>(null);

  const searching = query.trim().length > 0;
  const languageHits = LANGUAGES.filter((l) => matchesLanguage(query, l.name)).length;
  const hits =
    languageHits +
    SKILL_DOMAINS.reduce(
      (sum, domain) => sum + domain.skills.filter((s) => matches(query, s, domain)).length,
      0,
    );

  return (
    <section
      id="toolkit"
      aria-labelledby="toolkit-title"
      className="dark relative bg-[var(--bg-toolkit)] text-stage-foreground"
      style={{
        backgroundImage:
          "linear-gradient(var(--blueprint-line) 1px, transparent 1px), linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--blueprint-line) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--blueprint-line) 45%, transparent) 1px, transparent 1px)",
        backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-works)]" variant="tornAlt" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Title + terminal search */}
            <div className="flex flex-col justify-between gap-8 lg:col-span-7">
              <div className="relative">
                <ChapterMarker
                  chapter="workbench"
                  note="the tools on my bench — and a puzzle to fidget with"
                />
                <h2
                  id="toolkit-title"
                  className="mt-6 font-heading text-6xl font-semibold tracking-tight md:text-8xl"
                >
                  My Toolkit
                </h2>
                <p className="mt-4 font-mono text-xs tracking-[0.2em] text-cool uppercase">
                  {LANGUAGES.length} languages · {ALL_SKILLS.length} skills · {SKILL_DOMAINS.length}{" "}
                  layers
                </p>
                <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/70">
                  Everything I use to take a problem from first sketch to production, grouped by the
                  layer of the system it serves.
                </p>
              </div>

              <div className="relative">
                <label
                  htmlFor={inputId}
                  className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface px-4 py-3 font-mono text-sm shadow-[0_10px_24px_-18px_var(--shadow-ink)] transition-colors focus-within:border-signal"
                >
                  <span className="text-signal" aria-hidden="true">
                    $
                  </span>
                  <span className="text-stage-muted" aria-hidden="true">
                    grep
                  </span>
                  <span className="sr-only">Search skills</span>
                  <input
                    id={inputId}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="try: python, react, auth…"
                    autoComplete="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent text-stage-foreground caret-signal outline-none placeholder:text-stage-muted/60"
                  />
                  <span
                    aria-live="polite"
                    className="shrink-0 text-[11px] tracking-[0.12em] text-stage-muted uppercase"
                  >
                    {searching
                      ? `${hits} match${hits === 1 ? "" : "es"}`
                      : `${ALL_SKILLS.length} skills`}
                  </span>
                </label>
              </div>
            </div>

            {/* Stack diagram: one bar per layer */}
            <div className={`${tileShell} lg:col-span-5`}>
              <CropMarks />
              <p className="font-mono text-xs tracking-[0.2em] text-stage-muted uppercase">
                the full stack · top to bottom
              </p>
              <ol className="mt-5 space-y-2" onPointerLeave={() => setFocus(null)}>
                {SKILL_DOMAINS.map((domain, i) => {
                  const active = focus === domain.id;
                  const dim = focus !== null && !active;
                  const count = domain.skills.filter((s) => matches(query, s, domain)).length;
                  return (
                    <li key={domain.id}>
                      <button
                        type="button"
                        onPointerEnter={() => setFocus(domain.id)}
                        onFocus={() => setFocus(domain.id)}
                        onBlur={() => setFocus(null)}
                        onClick={() =>
                          document
                            .getElementById(`toolkit-${domain.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "center" })
                        }
                        aria-label={`${domain.title}: ${domain.skills.length} skills`}
                        style={
                          {
                            "--hue": domain.hue,
                            marginLeft: `${i * 4}%`,
                            marginRight: `${(SKILL_DOMAINS.length - 1 - i) * 4}%`,
                          } as CSSProperties
                        }
                        data-active={active}
                        data-dim={dim || (searching && count === 0)}
                        className="group flex w-[calc(100%-20%)] items-center justify-between gap-3 rounded-xl border border-line bg-tint px-4 py-2.5 text-left font-mono text-xs tracking-[0.12em] uppercase transition-all duration-300 hover:border-[var(--hue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal data-[active=true]:translate-x-1 data-[active=true]:border-[var(--hue)] data-[active=true]:bg-[color-mix(in_srgb,var(--hue)_14%,transparent)] data-[dim=true]:opacity-35"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="size-2 rounded-full bg-[var(--hue)]"
                            aria-hidden="true"
                          />
                          {domain.layer}
                        </span>
                        <span className="text-stage-muted tabular-nums">
                          {String(searching ? count : domain.skills.length).padStart(2, "0")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <a
                href="#stack-it"
                className="mt-5 inline-flex items-center gap-2 font-hand text-xl text-signal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                now stack them yourself
                <ScribbleArrow className="h-6 w-8 rotate-[70deg]" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* One tile per layer */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Foundation: programming languages, full width */}
          <Reveal className="md:col-span-2 lg:col-span-3">
            <article
              id="toolkit-languages"
              onPointerMove={spotlight}
              data-dim={focus !== null || (searching && languageHits === 0)}
              className={`${tileShell} group transition-opacity duration-300 data-[dim=true]:opacity-40`}
            >
              <CropMarks />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--signal) 12%, transparent), transparent 60%)",
                }}
              />
              <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-4">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase">
                    foundation · under every layer
                  </p>
                  <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                    Programming Languages
                  </h3>
                  <p className="mt-2 text-sm leading-snug text-stage-foreground/70">
                    The languages I think in, before any framework or tool.
                  </p>
                </div>
                <ul
                  className="grid gap-3 sm:grid-cols-3 lg:col-span-8"
                  aria-label="Programming languages"
                >
                  {LANGUAGES.map((language) => {
                    const hit = searching && matchesLanguage(query, language.name);
                    const miss = searching && !hit;
                    return (
                      <li
                        key={language.name}
                        data-hit={hit}
                        data-miss={miss}
                        style={{ "--hue": language.hue } as CSSProperties}
                        className="group/lang relative overflow-hidden rounded-2xl border border-line bg-tint px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--hue)] data-[hit=true]:border-[var(--hue)] data-[hit=true]:bg-[color-mix(in_srgb,var(--hue)_14%,transparent)] data-[miss=true]:opacity-30"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute top-0 left-0 h-0.5 w-0 bg-[var(--hue)] transition-all duration-500 group-hover/lang:w-full"
                        />
                        <span className="block font-heading text-4xl font-semibold tracking-tight md:text-5xl">
                          {language.name}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {language.traits.map((trait) => (
                            <span
                              key={trait}
                              className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-stage-muted uppercase"
                            >
                              {trait}
                            </span>
                          ))}
                        </span>
                        {language.name === "Java" ? (
                          <HiddenStamp id="workbench" className="absolute right-3 bottom-3" />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          </Reveal>

          {SKILL_DOMAINS.map((domain, i) => {
            const visibleCount = domain.skills.filter((s) => matches(query, s, domain)).length;
            const dim =
              (focus !== null && focus !== domain.id) || (searching && visibleCount === 0);
            return (
              <Reveal key={domain.id} delay={i * 70} className="h-full">
                <article
                  id={`toolkit-${domain.id}`}
                  onPointerEnter={() => setFocus(domain.id)}
                  onPointerLeave={() => setFocus(null)}
                  onPointerMove={spotlight}
                  data-dim={dim}
                  data-active={focus === domain.id}
                  style={{ "--hue": domain.hue } as CSSProperties}
                  className={`${tileShell} group flex h-full flex-col gap-5 transition-[opacity,border-color,translate,box-shadow] duration-300 hover:-translate-y-1 data-[active=true]:border-[color-mix(in_srgb,var(--hue)_60%,transparent)] data-[active=true]:shadow-[0_30px_60px_-40px_var(--hue)] data-[dim=true]:opacity-40`}
                >
                  <CropMarks />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--hue) 14%, transparent), transparent 60%)",
                    }}
                  />
                  <header className="relative flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.18em] text-hue uppercase">
                      layer {String(i + 1).padStart(2, "0")} · {domain.layer}
                    </span>
                    <span className="font-mono text-[11px] text-stage-muted tabular-nums">
                      {domain.skills.length} tools
                    </span>
                  </header>
                  <div className="relative">
                    <h3 className="font-heading text-2xl font-semibold tracking-tight">
                      {domain.title}
                    </h3>
                    <p className="mt-2 text-sm leading-snug text-stage-foreground/70">
                      {domain.summary}
                    </p>
                  </div>
                  <ul
                    className="relative mt-auto flex flex-wrap gap-2"
                    aria-label={`${domain.title} skills`}
                  >
                    {domain.skills.map((skill) => {
                      const hit = searching && matches(query, skill, domain);
                      const miss = searching && !hit;
                      return (
                        <li
                          key={skill}
                          data-hit={hit}
                          data-miss={miss}
                          className="rounded-full border border-line bg-tint px-3 py-1.5 font-mono text-xs text-stage-foreground/85 transition-all duration-300 group-hover:border-[color-mix(in_srgb,var(--hue)_40%,transparent)] data-[hit=true]:scale-105 data-[hit=true]:border-[var(--hue)] data-[hit=true]:bg-[color-mix(in_srgb,var(--hue)_18%,transparent)] data-[hit=true]:text-stage-foreground data-[miss=true]:opacity-30"
                        >
                          {skill}
                        </li>
                      );
                    })}
                  </ul>
                </article>
              </Reveal>
            );
          })}

          {/* Mini-game: Stack It */}
          <Reveal className="md:col-span-2 lg:col-span-3">
            <article
              id="stack-it"
              aria-labelledby="stack-it-title"
              className={`${tileShell} scroll-mt-24 sm:p-9`}
            >
              <CropMarks />
              <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase">
                    mini-game · 01
                  </p>
                  <h3
                    id="stack-it-title"
                    className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl"
                  >
                    Stack It
                  </h3>
                </div>
                <p className="max-w-sm -rotate-1 font-hand text-2xl leading-tight text-stage-foreground/75">
                  build my stack one skill at a time — line each layer up perfectly to keep it wide.
                </p>
              </header>
              <StackIt />
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
