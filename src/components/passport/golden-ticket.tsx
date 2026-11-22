"use client";

import { useId, useState } from "react";

import { author } from "@/config/site";
import { STAMP_IDS, ticketName, ticketSerial } from "@/content/stamps";

import { downloadTicket } from "./ticket-image";

const FIRST_NAME = author.name.split(" ")[0] ?? author.name;

/**
 * The reward for a full passport: a shimmering golden ticket to "the next
 * stop: working with Akash". Visitors put their own name on it and can save
 * it as an image (made in the browser; the name never leaves the page).
 */
export function GoldenTicket() {
  const inputId = useId();
  const [name, setName] = useState("");
  const clean = ticketName(name);
  const holder = clean || "You";
  const serial = ticketSerial(clean || "guest");

  return (
    <div className="motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-top-6">
      <article
        aria-label={`Golden ticket for ${holder}: next stop, working with ${FIRST_NAME}`}
        className="relative flex overflow-hidden rounded-[1.6rem] text-[#3d2606] shadow-[0_30px_60px_-28px_rgba(160,110,20,0.7)]"
        style={{
          background: "linear-gradient(120deg, #f9e29c, #e8b84a 45%, #f6d77d 70%, #c8922b)",
        }}
      >
        {/* Moving shine */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.55)_50%,transparent_65%)] bg-[length:250%_100%] motion-safe:animate-[ticket-shine_3.2s_ease-in-out_infinite]"
        />
        <div className="relative min-w-0 flex-1 p-6 sm:p-8">
          <p className="font-mono text-[11px] font-bold tracking-[0.24em] uppercase">
            admit one · golden ticket
          </p>
          <p className="mt-3 font-heading text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Next stop: working with {FIRST_NAME}
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-4">
            {[
              ["passenger", holder],
              ["from", "anywhere"],
              ["valid", "anytime"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                  {label}
                </dt>
                <dd className="mt-1 truncate text-lg font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden w-36 shrink-0 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-[#5a3a0a]/40 sm:flex">
          <span
            aria-hidden="true"
            className="absolute -top-4 -left-4 size-8 rounded-full bg-[var(--bg-play)]"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-4 -left-4 size-8 rounded-full bg-[var(--bg-play)]"
          />
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase">
            all {STAMP_IDS.length} stamps
          </span>
          <span aria-hidden="true" className="text-5xl leading-none">
            ★
          </span>
          <span className="font-mono text-xs font-bold">{serial}</span>
        </div>
      </article>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor={inputId} className="min-w-0 flex-1">
          <span className="font-mono text-[11px] tracking-[0.16em] text-stage-muted uppercase">
            put your name on it
          </span>
          <input
            id={inputId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoComplete="name"
            placeholder="Your name"
            className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-surface px-4 text-stage-foreground outline-none placeholder:text-stage-muted/60 focus:border-signal"
          />
        </label>
        <button
          type="button"
          onClick={() => downloadTicket(holder, serial)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c8922b] px-6 font-mono text-xs font-bold tracking-[0.14em] text-[#2a1a04] uppercase shadow-[0_12px_26px_-12px_#c8922b] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          download ticket ↓
        </button>
      </div>
    </div>
  );
}
