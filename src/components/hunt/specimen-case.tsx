"use client";

import { applyDevMode } from "@/components/site/theme";
import { useDevMode } from "@/components/site/dev-mode-toggle";
import { SPECIMENS } from "@/content/bugs";

import { BugArt } from "./bug-art";
import { releaseBugs, TOTAL_BUGS, useCaughtBugs } from "./bug-store";

/** Resting angle of each pinned specimen. */
const PIN_TILT = [-14, 9, -6, 16, -10] as const;

/**
 * The After Hours display case: a glass-fronted specimen box. Each caught bug
 * is pinned with its (very scientific) name; empty slots carry a hint. Catch
 * all five and Dev Mode unlocks.
 */
export function SpecimenCase() {
  const caught = useCaughtBugs();
  const devOn = useDevMode();
  const all = caught.length >= TOTAL_BUGS;

  return (
    <div>
      {/* Wooden frame */}
      <div
        className="rounded-[2rem] p-3 shadow-[0_40px_70px_-40px_var(--shadow-ink)] sm:p-4"
        style={{ background: "linear-gradient(145deg, #9a6a3e, #6b4423 55%, #4e2f17)" }}
      >
        {/* Felt backing */}
        <div
          className="relative overflow-hidden rounded-[1.4rem] p-5 sm:p-7"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--surface) 70%, var(--board)), color-mix(in srgb, var(--board) 85%, #000 6%))",
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-stage-muted uppercase">
                specimen collection · {caught.length}/{TOTAL_BUGS}
              </p>
              <p className="mt-1 font-hand text-2xl leading-tight text-stage-foreground/80">
                Bugus portfolius — field notes of a bug catcher
              </p>
            </div>
            <span aria-hidden="true" className="h-2 w-40 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-signal transition-[width] duration-700"
                style={{ width: `${(caught.length / TOTAL_BUGS) * 100}%` }}
              />
            </span>
          </div>

          <ul
            className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Specimens"
          >
            {SPECIMENS.map((specimen, i) => {
              const found = caught.includes(specimen.id);
              return (
                <li
                  key={specimen.id}
                  className={`relative flex aspect-[3/4] flex-col items-center justify-between rounded-xl p-3 text-center ${
                    found
                      ? "border border-line bg-surface/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)]"
                      : "border-2 border-dashed border-line-strong"
                  }`}
                >
                  {found ? (
                    <>
                      <span
                        className="relative mt-3 block size-16"
                        style={{ rotate: `${PIN_TILT[i]}deg` }}
                      >
                        <BugArt
                          shell={specimen.hue}
                          wiggle={false}
                          className="size-full drop-shadow-[0_6px_4px_rgba(0,0,0,0.35)]"
                        />
                        {/* The pin */}
                        <span
                          aria-hidden="true"
                          className="absolute top-[42%] left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#d33] shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.35),0_2px_3px_rgba(0,0,0,0.4)]"
                        />
                      </span>
                      <span className="w-full rounded-md bg-[#fbf6e9] px-2 py-1.5 text-[#2a2620] shadow-sm">
                        <span className="block text-[13px] leading-tight font-semibold italic">
                          {specimen.latin}
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] tracking-[0.08em] text-[#6b665d] uppercase">
                          {specimen.habitat}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative mt-3 block size-14 opacity-[0.12] grayscale">
                        <BugArt shell="#888" wiggle={false} className="size-full" />
                      </span>
                      <span className="text-xs leading-snug text-stage-foreground/70">
                        <span className="mb-1 block font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
                          still loose
                        </span>
                        {specimen.hint}
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Glass reflection */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22),transparent_30%,transparent_70%,rgba(255,255,255,0.08))]"
          />
        </div>
      </div>

      {/* Reward */}
      <div
        aria-live="polite"
        className={`mt-6 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
          all ? "border-signal/50 bg-surface" : "border-line bg-surface/60"
        }`}
      >
        {all ? (
          <>
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-signal uppercase">
                🔓 dev mode unlocked
              </p>
              <p className="mt-1 font-heading text-xl font-semibold tracking-tight">
                You found every bug. That&apos;s literally the job — let&apos;s work together.
              </p>
              <button
                type="button"
                onClick={releaseBugs}
                className="mt-2 font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase underline-offset-4 hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                let them all loose again
              </button>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={devOn}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                applyDevMode(!devOn, {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                });
              }}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-signal px-6 font-mono text-sm font-semibold tracking-[0.12em] text-stage uppercase shadow-[0_12px_28px_-12px_var(--signal)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {"</>"} {devOn ? "leave dev mode" : "enter dev mode"}
            </button>
          </>
        ) : (
          <>
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-stage-muted uppercase">
                🔒 locked · {TOTAL_BUGS - caught.length} still loose
              </p>
              <p className="mt-1 text-stage-foreground/80">
                Catch all five to unlock <span className="font-semibold text-signal">Dev Mode</span>{" "}
                — a secret skin for this whole site.
              </p>
            </div>
            <span aria-hidden="true" className="font-mono text-3xl text-stage-muted">
              {"</>"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
