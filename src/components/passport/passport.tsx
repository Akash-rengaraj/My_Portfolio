"use client";

import { STAMPS } from "@/content/stamps";

import { GoldenTicket } from "./golden-ticket";
import { StampMark } from "./stamp-art";
import { resetPassport, TOTAL_STAMPS, useStamps } from "./stamp-store";

/** Each visa lands at its own slightly crooked angle. */
const SLOT_TILT = [-9, 7, -4, 11, -7, 5, -10, 8] as const;
const SLOT_SHIFT = [
  "",
  "sm:translate-y-4",
  "",
  "sm:-translate-y-2",
  "sm:translate-y-3",
  "",
  "sm:translate-y-2",
  "",
] as const;

/** Guilloche-style security pattern for the pages. */
const PAGE_PATTERN =
  "repeating-radial-gradient(circle at 30% 40%, transparent 0 9px, rgba(30,42,74,0.05) 9px 10px), repeating-radial-gradient(circle at 75% 70%, transparent 0 13px, rgba(190,24,93,0.04) 13px 14px)";

function title(visited: number): string {
  if (visited >= TOTAL_STAMPS) return "Globetrotter";
  if (visited >= 3) return "Explorer";
  if (visited >= 1) return "Traveller";
  return "New arrival";
}

/**
 * The visitor's passport: an open booklet. The left page holds their details
 * and progress; the right page fills with a stamp for every place they've
 * found. A full passport unlocks the Golden Ticket.
 */
export function Passport() {
  const stamps = useStamps();
  const full = stamps.length >= TOTAL_STAMPS;

  return (
    <div>
      {/* Cover */}
      <div className="rounded-[1.8rem] bg-[#1e2a4a] p-2.5 shadow-[0_40px_70px_-40px_var(--shadow-ink)] sm:p-3">
        <div className="grid overflow-hidden rounded-[1.3rem] text-[#2a2620] md:grid-cols-[5fr_7fr]">
          {/* Left page: holder details */}
          <div
            className="relative flex flex-col gap-6 bg-[#f6f0df] p-6 sm:p-7"
            style={{ backgroundImage: PAGE_PATTERN }}
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#b8860b] font-mono text-base font-bold text-[#b8860b]"
              >
                {"{ }"}
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#1e2a4a] uppercase">
                  passport
                </p>
                <p className="font-heading text-2xl leading-tight font-bold tracking-tight">
                  Akash&apos;s World
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs">
              {[
                ["holder", "You"],
                ["status", title(stamps.length)],
                ["places visited", `${stamps.length} / ${TOTAL_STAMPS}`],
                ["issued at", "the desk"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[9px] tracking-[0.2em] text-[#6b665d] uppercase">{label}</dt>
                  <dd className="mt-0.5 font-bold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto">
              <ol className="flex gap-1.5" aria-label="Places">
                {STAMPS.map((stamp) => {
                  const got = stamps.includes(stamp.id);
                  return (
                    <li
                      key={stamp.id}
                      title={stamp.place}
                      className="h-2 flex-1 rounded-full transition-colors duration-500"
                      style={{ background: got ? stamp.ink : "rgba(30,42,74,0.14)" }}
                    >
                      <span className="sr-only">
                        {stamp.place}: {got ? "stamped" : "not yet"}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {stamps.length > 0 ? (
                <button
                  type="button"
                  onClick={resetPassport}
                  className="mt-3 font-mono text-[10px] tracking-[0.16em] text-[#6b665d] uppercase underline-offset-4 hover:text-[#1e2a4a] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  start a fresh passport
                </button>
              ) : null}
            </div>
          </div>

          {/* Right page: visas */}
          <div
            className="relative bg-[#f8f3e6] p-6 shadow-[inset_14px_0_18px_-14px_rgba(30,42,74,0.35)] sm:p-7"
            style={{ backgroundImage: PAGE_PATTERN }}
          >
            <p className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#1e2a4a] uppercase">
              visas · entries
            </p>
            <ul
              aria-label="Stamps"
              className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-4"
            >
              {STAMPS.map((stamp, i) => {
                const got = stamps.includes(stamp.id);
                return (
                  <li
                    key={stamp.id}
                    className={`flex flex-col items-center text-center ${SLOT_SHIFT[i]}`}
                  >
                    {got ? (
                      <span className="block" style={{ rotate: `${SLOT_TILT[i]}deg` }}>
                        <StampMark
                          stamp={stamp}
                          seed={i + 3}
                          className="size-28 motion-safe:animate-[stamp-thunk_0.45s_cubic-bezier(0.2,1.4,0.5,1)_both]"
                        />
                      </span>
                    ) : (
                      <>
                        <span className="grid size-24 place-items-center rounded-full border-2 border-dashed border-[#1e2a4a]/25 font-mono text-lg font-bold text-[#1e2a4a]/30">
                          {stamp.number}
                        </span>
                        <span className="mt-2 max-w-[10rem] text-[11px] leading-snug text-[#6b665d]">
                          {stamp.hint}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Reward */}
      <div aria-live="polite" className="mt-6">
        {full ? (
          <GoldenTicket />
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-line-strong bg-surface/60 p-5 sm:p-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-stage-muted uppercase">
                🔒 reward · {TOTAL_STAMPS - stamps.length} stamps to go
              </p>
              <p className="mt-1 text-stage-foreground/80">
                Fill every page to earn the{" "}
                <span className="font-semibold text-[#b8860b] dark:text-[#e8c15a]">
                  Golden Ticket
                </span>{" "}
                — with your name on it.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="grid h-14 w-24 shrink-0 place-items-center rounded-lg border-2 border-dashed border-[#c8922b]/60 text-2xl text-[#c8922b]/70"
            >
              ★
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
