"use client";

import { useId, useState } from "react";

import { author } from "@/config/site";
import { STAMP_IDS, ticketName, ticketSerial } from "@/content/stamps";

const FIRST_NAME = author.name.split(" ")[0] ?? author.name;
const W = 1400;
const H = 560;

/** Draws the ticket onto a canvas and downloads it as a PNG. */
async function downloadTicket(holder: string, serial: string) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const css = getComputedStyle(document.documentElement);
  const sans = css.getPropertyValue("--font-geist-sans").trim() || "system-ui, sans-serif";
  const mono = css.getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";

  // Gold card.
  const gold = ctx.createLinearGradient(0, 0, W, H);
  gold.addColorStop(0, "#f9e29c");
  gold.addColorStop(0.45, "#e8b84a");
  gold.addColorStop(0.7, "#f6d77d");
  gold.addColorStop(1, "#c8922b");
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.fill();

  // Notches at the perforation.
  const perf = 1060;
  ctx.globalCompositeOperation = "destination-out";
  for (const y of [0, H]) {
    ctx.beginPath();
    ctx.arc(perf, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // Inner border and perforation.
  ctx.strokeStyle = "rgba(90,58,10,0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(24, 24, W - 48, H - 48, 24);
  ctx.stroke();
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(perf, 44);
  ctx.lineTo(perf, H - 44);
  ctx.stroke();
  ctx.setLineDash([]);

  const ink = "#3d2606";
  ctx.fillStyle = ink;
  ctx.font = `700 26px ${mono}`;
  ctx.fillText("ADMIT ONE  ·  GOLDEN TICKET", 80, 104);
  ctx.font = `800 92px ${sans}`;
  ctx.fillText("Next stop:", 76, 210);
  ctx.fillText(`working with ${FIRST_NAME}`, 76, 306);

  ctx.font = `700 22px ${mono}`;
  ctx.fillStyle = "rgba(61,38,6,0.7)";
  ctx.fillText("PASSENGER", 80, 396);
  ctx.fillText("FROM", 560, 396);
  ctx.fillText("VALID", 800, 396);
  ctx.fillStyle = ink;
  ctx.font = `700 40px ${sans}`;
  ctx.fillText(holder, 80, 446, 450);
  ctx.fillText("anywhere", 560, 446);
  ctx.fillText("anytime", 800, 446);

  // Stub.
  ctx.textAlign = "center";
  ctx.font = `700 22px ${mono}`;
  ctx.fillText(`ALL ${STAMP_IDS.length} STAMPS`, (perf + W) / 2, 150);
  ctx.font = `800 120px ${sans}`;
  ctx.fillText("★", (perf + W) / 2, 300);
  ctx.font = `700 26px ${mono}`;
  ctx.fillText(serial, (perf + W) / 2, 400);
  ctx.textAlign = "start";

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "golden-ticket.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The reward for a full passport: a shimmering golden ticket to "the next
 * stop: working with Akash". Visitors put their own name on it and can save
 * it as an image (made in the browser; the name never leaves the page).
 */
export function GoldenTicket() {
  const inputId = useId();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
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
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await downloadTicket(holder, serial);
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c8922b] px-6 font-mono text-xs font-bold tracking-[0.14em] text-[#2a1a04] uppercase shadow-[0_12px_26px_-12px_#c8922b] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal disabled:opacity-60"
        >
          {saving ? "printing…" : "download ticket ↓"}
        </button>
      </div>
    </div>
  );
}
