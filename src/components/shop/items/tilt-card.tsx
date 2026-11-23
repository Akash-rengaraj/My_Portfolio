"use client";

import type { PointerEvent } from "react";

/** Tilts the card toward the pointer and moves its glare there. */
function tilt(event: PointerEvent<HTMLDivElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width;
  const py = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--rx", `${(0.5 - py) * 18}deg`);
  el.style.setProperty("--ry", `${(px - 0.5) * 22}deg`);
  el.style.setProperty("--gx", `${px * 100}%`);
  el.style.setProperty("--gy", `${py * 100}%`);
}

/** Lays the card flat again. */
function settle(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

/**
 * A card that tilts in 3D toward the pointer, with a glare that slides across
 * it like light on a glossy print. Stays flat for reduced-motion users.
 */
export function TiltCard({
  title = "Tilt card",
  subtitle = "Hover and move around",
  label = "No. 001",
}: {
  title?: string;
  subtitle?: string;
  label?: string;
}) {
  return (
    <div className="[perspective:800px]">
      <div
        onPointerMove={tilt}
        onPointerLeave={settle}
        className="relative flex h-48 w-72 flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500 via-violet-500 to-orange-400 p-6 text-white shadow-2xl shadow-violet-500/30 transition-transform duration-200 ease-out [--gx:50%] [--gy:50%] [--rx:0deg] [--ry:0deg] motion-safe:[transform:rotateX(var(--rx))_rotateY(var(--ry))]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at var(--gx) var(--gy), rgb(255 255 255 / 0.6), transparent 55%)",
          }}
        />
        <span className="relative font-mono text-[11px] tracking-[0.25em] uppercase opacity-80">
          {label}
        </span>
        <div className="relative">
          <p className="text-2xl font-bold">{title}</p>
          <p className="text-sm opacity-80">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
