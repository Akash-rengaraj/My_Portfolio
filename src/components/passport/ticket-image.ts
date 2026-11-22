"use client";

import { author } from "@/config/site";
import { STAMP_IDS } from "@/content/stamps";

const FIRST_NAME = author.name.split(" ")[0] ?? author.name;
const W = 1400;
const H = 560;
const FILE_NAME = "golden-ticket.png";

/** Draws the Golden Ticket onto a new canvas, or null when canvas isn't available. */
export function drawTicket(holder: string, serial: string): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
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

  return canvas;
}

/** Encodes a canvas as a PNG blob synchronously (so it can be used inside a click). */
function canvasToPng(canvas: HTMLCanvasElement): Blob {
  const data = canvas.toDataURL("image/png");
  const bytes = atob(data.slice(data.indexOf(",") + 1));
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: "image/png" });
}

/** Saves a PNG blob through a temporary download link. */
function savePng(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Draws the ticket and downloads it as a PNG. */
export function downloadTicket(holder: string, serial: string) {
  const canvas = drawTicket(holder, serial);
  if (canvas) savePng(canvasToPng(canvas));
}

export type TicketHandoff = "copied" | "saved" | "failed";

/**
 * Gets the ticket image ready to go into an email, which links can't attach:
 * copies the PNG to the clipboard (paste it into the email), or downloads it
 * when the clipboard refuses images. The clipboard write starts synchronously,
 * so call this inside the click, before opening a new tab steals focus.
 */
export async function handOffTicket(holder: string, serial: string): Promise<TicketHandoff> {
  let blob: Blob;
  try {
    const canvas = drawTicket(holder, serial);
    if (!canvas) return "failed";
    blob = canvasToPng(canvas);
  } catch {
    return "failed";
  }

  try {
    if (typeof ClipboardItem === "undefined" || !("clipboard" in navigator)) {
      throw new Error("Image clipboard unsupported");
    }
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "copied";
  } catch {
    try {
      savePng(blob);
      return "saved";
    } catch {
      return "failed";
    }
  }
}
