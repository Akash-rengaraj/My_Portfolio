"use client";

import { useState } from "react";

/** A CSS mask that bites half-circle notches out of one side's corners. */
function notches(side: "left" | "right"): string {
  const x = side === "left" ? "0" : "100%";
  return [
    `radial-gradient(circle at ${x} 0, transparent 10px, #000 10.5px) top / 100% 51% no-repeat`,
    `radial-gradient(circle at ${x} 100%, transparent 10px, #000 10.5px) bottom / 100% 51% no-repeat`,
  ].join(", ");
}

/**
 * An event ticket with a perforated stub. Click the stub to tear it off;
 * click it again to put it back.
 */
export function TicketStub({
  event = "Design Week",
  date = "Sat 14 Mar",
  seat = "Row C · Seat 12",
}: {
  event?: string;
  date?: string;
  seat?: string;
}) {
  const [torn, setTorn] = useState(false);

  return (
    <div className="flex w-80 font-mono drop-shadow-[0_14px_22px_rgb(0_0_0/0.25)]">
      <div
        style={{ mask: notches("right"), WebkitMask: notches("right") }}
        className="flex-1 rounded-l-xl bg-linear-to-br from-orange-400 to-rose-500 p-4 text-white"
      >
        <p className="text-[10px] tracking-[0.25em] uppercase opacity-80">admit one</p>
        <p className="mt-1 text-lg leading-tight font-bold">{event}</p>
        <p className="mt-3 text-[11px] tracking-[0.12em] uppercase opacity-90">{date}</p>
        <p className="mt-1 text-[11px] opacity-90" aria-live="polite">
          {torn ? "✓ admitted — enjoy the show" : seat}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setTorn((t) => !t)}
        aria-pressed={torn}
        aria-label={torn ? "Put the stub back" : "Tear off the stub"}
        data-torn={torn}
        style={{ mask: notches("left"), WebkitMask: notches("left") }}
        className="grid w-20 shrink-0 place-items-center rounded-r-xl border-l-2 border-dashed border-white/60 bg-linear-to-br from-rose-500 to-fuchsia-600 text-white transition-[translate,rotate] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset data-[torn=true]:translate-x-6 data-[torn=true]:translate-y-3 data-[torn=true]:rotate-12"
      >
        <span className="-rotate-90 text-[10px] tracking-[0.3em] whitespace-nowrap uppercase">
          {torn ? "kept" : "tear here"}
        </span>
      </button>
    </div>
  );
}
