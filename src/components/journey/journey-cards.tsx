"use client";

import { useRef, type CSSProperties } from "react";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { useCountUp } from "@/components/works/stat-tile";
import { useInView } from "@/components/works/use-in-view";
import { author } from "@/config/site";
import {
  COLLEGE,
  COLLEGE_TOWN,
  HOMETOWN,
  percentOf,
  type Role,
  type School,
  type Town,
} from "@/content/journey";

/** Ticket notches: half-circles cut into the perforation, painted in the map colour. */
function Notches() {
  return (
    <>
      <span aria-hidden="true" className="absolute -top-3 -left-3 size-6 rounded-full bg-map" />
      <span aria-hidden="true" className="absolute -bottom-3 -left-3 size-6 rounded-full bg-map" />
    </>
  );
}

/** Hand-drawn, not-to-scale map of the trip from Sivakasi up to Coimbatore. */
export function RouteMap({ drawn }: { drawn: boolean }) {
  const path = "M252 162 C 222 160, 214 128, 180 118 S 118 112, 98 86 S 74 58, 62 52";
  return (
    <figure className="relative rounded-2xl border border-line bg-surface/80 p-4 shadow-[0_18px_36px_-26px_var(--shadow-ink)]">
      <svg
        viewBox="0 0 320 200"
        className="h-auto w-full"
        role="img"
        aria-labelledby="route-map-title"
      >
        <title id="route-map-title">{`Route from ${HOMETOWN.name} to ${COLLEGE_TOWN.name}, ${HOMETOWN.state}`}</title>
        {/* Compass */}
        <g transform="translate(286 36)" className="text-stage-muted" aria-hidden="true">
          <circle r="14" fill="none" stroke="currentColor" strokeOpacity={0.4} />
          <path d="M0 -11 L4 2 L0 0 L-4 2 Z" fill="var(--signal)" />
          <text y="-17" textAnchor="middle" fontSize="9" fill="currentColor" className="font-mono">
            N
          </text>
        </g>
        <path
          d={path}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="2.5"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: drawn ? 0 : 1 }}
          className="transition-[stroke-dashoffset] duration-[1800ms] ease-in-out motion-reduce:transition-none"
        />
        {[
          { town: COLLEGE_TOWN, x: 62, y: 52, anchor: "start" as const, dx: 12, dy: -6 },
          { town: HOMETOWN, x: 252, y: 162, anchor: "end" as const, dx: -12, dy: 22 },
        ].map(({ town, x, y, anchor, dx, dy }) => (
          <g key={town.code}>
            <circle cx={x} cy={y} r="9" fill="var(--signal)" fillOpacity={0.18} />
            <circle cx={x} cy={y} r="4.5" fill="var(--signal)" />
            <text
              x={x + dx}
              y={y + dy}
              textAnchor={anchor}
              fontSize="13"
              fill="var(--stage-foreground)"
              className="font-mono font-semibold tracking-[0.06em] uppercase"
            >
              {town.name}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="absolute right-4 bottom-3 -rotate-2 font-hand text-lg text-stage-muted">
        not to scale :)
      </figcaption>
    </figure>
  );
}

/** Town sign on the route, with a handwritten note. Sivakasi gets a firework. */
export function TownSign({ town, sparks = false }: { town: Town; sparks?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-2 md:items-center md:text-center">
      <span className="relative inline-flex items-center gap-3 rounded-lg border-2 border-stage-foreground bg-surface px-4 py-2 font-mono text-sm font-semibold tracking-[0.18em] uppercase shadow-[4px_4px_0_var(--stage-foreground)]">
        {sparks ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 -right-4 size-0 motion-reduce:hidden"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className="absolute top-0 left-0 block h-2.5 w-0.5 origin-bottom rounded-full opacity-0 group-data-[reached=true]:animate-[spark_1.1s_ease-out_both]"
                style={
                  {
                    "--a": `${i * 36}deg`,
                    background: ["#ff5a1f", "#f5b84b", "#ff8fb3", "#8ab4ff"][i % 4],
                    animationDelay: `${(i % 3) * 90}ms`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        {town.name}
        <span className="font-normal text-stage-muted">{town.code}</span>
      </span>
      <span className="font-hand text-2xl leading-tight text-stage-foreground/75 md:bg-map md:px-3">
        {town.note}
      </span>
    </div>
  );
}

/** A school ticket: details on the left, the key number on the stub. */
export function SchoolTicket({ school }: { school: School }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const marks = useCountUp(school.score?.value ?? 0, inView);
  // Percentages count up in tenths (905 → 90.5).
  const percentValue = percentOf(school);
  const percent = useCountUp(Math.round((percentValue ?? 0) * 10), inView) / 10;

  return (
    <article
      ref={ref}
      className="relative flex overflow-visible rounded-xl border border-line bg-surface shadow-[0_18px_36px_-24px_var(--shadow-ink)] transition-transform duration-300 hover:-translate-y-1 hover:-rotate-[0.6deg]"
    >
      <div className="min-w-0 flex-1 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.2em] text-signal uppercase">
          admit one · {school.level}
        </p>
        <h3 className="mt-2 font-heading text-xl leading-snug font-semibold tracking-tight text-balance">
          {school.name}
        </h3>
        <p className="mt-2 font-mono text-xs tracking-[0.08em] text-stage-muted">
          {school.town}
          {school.board ? ` · ${school.board}` : ""}
        </p>
      </div>
      {/* Stub: the percentage; hover, focus or tap to flip to the marks. */}
      <div
        tabIndex={school.score ? 0 : undefined}
        title={school.score ? "Hover to see the marks" : undefined}
        className="group/stub relative grid w-28 shrink-0 place-items-center border-l-2 border-dashed border-line-strong px-3 py-5 text-center outline-none focus-visible:bg-tint sm:w-32"
      >
        <Notches />
        {percentValue !== undefined ? (
          <>
            <span className="col-start-1 row-start-1 flex flex-col items-center gap-1 transition-[opacity,scale] duration-300 group-hover/stub:scale-90 group-hover/stub:opacity-0 group-focus-visible/stub:scale-90 group-focus-visible/stub:opacity-0">
              <span className="font-heading text-4xl font-semibold tracking-tight tabular-nums">
                {percent.toFixed(1)}
                <span className="text-2xl">%</span>
              </span>
              <span className="font-mono text-[11px] tracking-[0.12em] text-stage-muted uppercase">
                overall ↻
              </span>
            </span>
            {school.score ? (
              <span className="col-start-1 row-start-1 flex scale-90 flex-col items-center gap-1 opacity-0 transition-[opacity,scale] duration-300 group-hover/stub:scale-100 group-hover/stub:opacity-100 group-focus-visible/stub:scale-100 group-focus-visible/stub:opacity-100">
                <span className="font-heading text-4xl font-semibold tracking-tight tabular-nums">
                  {marks}
                </span>
                <span className="font-mono text-[11px] tracking-[0.12em] text-stage-muted uppercase">
                  / {school.score.max} marks
                </span>
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

/** Half-ring gauge for the CGPA; the arc fills when it scrolls into view. */
function CgpaGauge({ play }: { play: boolean }) {
  const fraction = COLLEGE.cgpa / COLLEGE.cgpaMax;
  const arc = "M14 70 A 56 56 0 0 1 126 70";
  return (
    <div className="relative w-36 shrink-0">
      <svg viewBox="0 0 140 80" className="w-full" aria-hidden="true">
        <path
          d={arc}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={arc}
          fill="none"
          stroke="var(--ok)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: play ? 1 - fraction : 1 }}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-out motion-reduce:transition-none"
        />
      </svg>
      <p className="absolute inset-x-0 bottom-0 text-center">
        <span className="font-heading text-3xl font-semibold tracking-tight">{COLLEGE.cgpa}</span>
        <span className="font-mono text-xs text-stage-muted"> / {COLLEGE.cgpaMax}</span>
      </p>
    </div>
  );
}

/** College, printed as the train ticket that moved me from Sivakasi to Coimbatore. */
export function CollegeTicket() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const fields = [
    { label: "passenger", value: author.name },
    { label: "course", value: COLLEGE.course },
    { label: "coach", value: COLLEGE.year },
    { label: "berth", value: `Semester ${COLLEGE.semester}` },
  ];
  return (
    <article
      ref={ref}
      aria-label={`${COLLEGE.name}, ${COLLEGE.course}, ${COLLEGE.year}, semester ${COLLEGE.semester}, CGPA ${COLLEGE.cgpa}`}
      className="relative mx-auto max-w-4xl overflow-visible rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-34px_var(--shadow-ink)] transition-transform duration-300 hover:-translate-y-1"
    >
      <header className="flex items-center justify-between gap-3 rounded-t-2xl bg-stage-foreground px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-stage uppercase sm:px-7">
        <span>one-way ticket · college</span>
        <span className="hidden sm:inline">{COLLEGE.short}</span>
      </header>
      <div className="flex flex-col md:flex-row">
        <div className="min-w-0 flex-1 p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {HOMETOWN.code}
              </p>
              <p className="font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
                {HOMETOWN.name}
              </p>
            </div>
            <div aria-hidden="true" className="relative flex-1">
              <span className="block border-t-2 border-dashed border-line-strong" />
              <svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 bg-surface px-0.5 text-signal"
                fill="currentColor"
              >
                <rect x="5" y="2.5" width="14" height="14.5" rx="3" />
                <rect x="7.5" y="5.5" width="9" height="4.5" rx="1" fill="var(--surface)" />
                <circle cx="9" cy="13.5" r="1.3" fill="var(--surface)" />
                <circle cx="15" cy="13.5" r="1.3" fill="var(--surface)" />
                <path
                  d="M8.5 17.5 6.5 21.5M15.5 17.5l2 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-right">
              <p className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {COLLEGE_TOWN.code}
              </p>
              <p className="font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
                {COLLEGE_TOWN.name}
              </p>
            </div>
          </div>
          <h3 className="mt-6 font-heading text-2xl leading-snug font-semibold tracking-tight text-balance">
            {COLLEGE.name}
          </h3>
          <p className="mt-1 font-mono text-xs tracking-[0.08em] text-stage-muted">
            {COLLEGE.town}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="font-mono text-[10px] tracking-[0.2em] text-stage-muted uppercase">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm font-medium">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative flex flex-col items-center justify-center gap-2 border-t-2 border-dashed border-line-strong p-6 md:border-t-0 md:border-l-2">
          <span
            aria-hidden="true"
            className="absolute -top-3 -left-3 hidden size-6 rounded-full bg-map md:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-map md:block"
          />
          <p className="font-mono text-[10px] tracking-[0.2em] text-stage-muted uppercase">
            status · cgpa
          </p>
          <CgpaGauge play={inView} />
          <span className="-rotate-6 rounded-md border-2 border-ok/70 px-2 py-0.5 font-hand text-xl leading-none text-ok">
            confirmed ✓
          </span>
        </div>
      </div>
      <HiddenStamp id="road" className="absolute -bottom-3.5 left-[38%]" />
    </article>
  );
}

/** A role, stuck on like a laptop sticker; it peels flat when you hover. */
export function RoleSticker({ role }: { role: Role }) {
  return (
    <li
      style={{ "--hue": role.hue, rotate: `${role.tilt}deg` } as CSSProperties}
      className="group/sticker relative rounded-[1.4rem] border-2 border-dashed border-[color-mix(in_srgb,var(--hue)_55%,transparent)] bg-[color-mix(in_srgb,var(--hue)_10%,var(--surface))] p-5 shadow-[0_14px_26px_-18px_var(--shadow-ink)] transition-[rotate,translate,box-shadow] duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_26px_40px_-22px_var(--shadow-ink)] motion-reduce:rotate-0 sm:p-6"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 -right-2 size-6 rounded-full bg-[var(--hue)] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.2)]"
      />
      <p className="font-mono text-[11px] tracking-[0.16em] text-hue uppercase">{role.org}</p>
      <h3 className="mt-2 font-heading text-2xl leading-tight font-semibold tracking-tight">
        {role.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-stage-foreground/75">{role.detail}</p>
    </li>
  );
}
