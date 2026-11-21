"use client";

import { useState } from "react";

import { Confetti } from "@/components/world/confetti";
import { STAMPS, type StampId } from "@/content/stamps";

import { RubberStamp, StampMark } from "./stamp-art";
import { collectStamp, TOTAL_STAMPS, useStamps } from "./stamp-store";

/**
 * One of the rubber stamps hidden around the site. Click it and it
 * presses down, leaves an ink mark where it stood, and stamps the passport.
 * After that only the faded ink mark stays, as a "you were here".
 * Position it with `className` (absolute or inline utilities).
 */
export function HiddenStamp({ id, className = "" }: { id: StampId; className?: string }) {
  const stamps = useStamps();
  const [pressing, setPressing] = useState(false);
  const stamp = STAMPS.find((s) => s.id === id);
  if (!stamp) return null;

  const done = stamps.includes(id);
  const count = stamps.length + (done ? 0 : 1);

  if (done && !pressing) {
    return (
      <span className={`z-20 ${className}`} aria-hidden="true">
        <StampMark stamp={stamp} className="block size-9 -rotate-12 opacity-45" />
      </span>
    );
  }

  return (
    <span className={`z-30 ${className}`}>
      <button
        type="button"
        aria-label={`A rubber stamp for ${stamp.place.toLowerCase()}. Stamp your passport`}
        disabled={pressing}
        onClick={() => {
          setPressing(true);
          window.setTimeout(() => {
            collectStamp(id);
            setPressing(false);
          }, 700);
        }}
        className="group/stamp relative block size-8 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        {/* Ink mark appears under the stamp as it presses. */}
        {pressing ? (
          <StampMark
            stamp={stamp}
            className="pointer-events-none absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 -rotate-12 motion-safe:animate-[stamp-ink_0.7s_ease-out_both]"
          />
        ) : null}
        <span
          className={`relative block size-full transition-transform duration-200 group-hover/stamp:-translate-y-1 group-hover/stamp:-rotate-6 ${
            pressing
              ? "motion-safe:animate-[stamp-press_0.7s_ease-in-out_both]"
              : "motion-safe:animate-[stamp-bob_3.2s_ease-in-out_infinite]"
          }`}
        >
          <RubberStamp
            ink={stamp.ink}
            className="size-full drop-shadow-[0_3px_2px_rgba(0,0,0,0.3)]"
          />
        </span>
        {pressing && count === TOTAL_STAMPS ? <Confetti /> : null}
        {pressing ? (
          <span
            aria-live="polite"
            className="pointer-events-none absolute -top-8 left-1/2 font-hand text-xl whitespace-nowrap motion-safe:animate-[bug-caught_0.7s_ease-out_forwards]"
            style={{ color: stamp.ink }}
          >
            stamped! {count}/{TOTAL_STAMPS}
          </span>
        ) : null}
      </button>
    </span>
  );
}
