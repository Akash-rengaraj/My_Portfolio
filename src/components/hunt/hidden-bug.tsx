"use client";

import { useState, type CSSProperties } from "react";

import { Confetti } from "@/components/world/confetti";
import { SPECIMENS, type BugId } from "@/content/bugs";

import { BugArt } from "./bug-art";
import { catchBug, TOTAL_BUGS, useCaughtBugs } from "./bug-store";

/**
 * One of the five bugs hiding around the site. It idles and scurries in
 * place; click it to catch it (it squashes, a "caught!" pops up, and it joins
 * the specimen case). Position it with `className` (absolute utilities).
 */
export function HiddenBug({
  id,
  className = "",
  angle = 0,
}: {
  id: BugId;
  className?: string;
  /** Which way the bug faces, in degrees. */
  angle?: number;
}) {
  const caught = useCaughtBugs();
  const [squashing, setSquashing] = useState(false);
  const specimen = SPECIMENS.find((s) => s.id === id);
  const done = caught.includes(id);

  if (!specimen || (done && !squashing)) return null;

  const count = caught.length + (done ? 0 : 1);

  return (
    <span className={`z-30 ${className}`} style={{ "--bug-angle": `${angle}deg` } as CSSProperties}>
      <button
        type="button"
        aria-label="A bug! Catch it"
        disabled={squashing}
        onClick={() => {
          setSquashing(true);
          window.setTimeout(() => {
            catchBug(id);
            setSquashing(false);
          }, 650);
        }}
        className="group/bug relative block size-7 rounded-full p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <span
          className={`block size-full transition-transform duration-200 group-hover/bug:scale-125 ${
            squashing
              ? "animate-[bug-squash_0.35s_ease-in_forwards]"
              : "motion-safe:animate-[bug-scurry_6s_ease-in-out_infinite]"
          }`}
        >
          <BugArt shell={specimen.hue} className="size-full rotate-[var(--bug-angle)]" />
        </span>
        {squashing && count === TOTAL_BUGS ? <Confetti /> : null}
        {squashing ? (
          <span
            aria-live="polite"
            className="pointer-events-none absolute -top-7 left-1/2 font-hand text-xl whitespace-nowrap text-signal motion-safe:animate-[bug-caught_0.65s_ease-out_forwards]"
          >
            caught! {count}/{TOTAL_BUGS}
          </span>
        ) : null}
      </button>
    </span>
  );
}
