import type { CSSProperties } from "react";

const GILT: CSSProperties = {
  background:
    "linear-gradient(145deg, #f3d98f 0%, #b8904a 35%, #8a6428 55%, #e2bf72 80%, #a47c38 100%)",
};

type Cameo = "gentleman" | "lady";

/** A sepia cameo silhouette, facing right. */
function Silhouette({ kind }: { kind: Cameo }) {
  return (
    <svg viewBox="0 0 100 120" className="size-full" aria-hidden="true">
      <rect width="100" height="120" fill="#efe3c9" />
      <rect width="100" height="120" fill="url(#cameo-vignette)" />
      <defs>
        <radialGradient id="cameo-vignette" cx=".5" cy=".45" r=".7">
          <stop offset=".55" stopColor="#efe3c9" stopOpacity="0" />
          <stop offset="1" stopColor="#c9b48a" stopOpacity=".55" />
        </radialGradient>
      </defs>
      <g fill="#3b2a1c">
        <path d="M6 120 C8 102 28 97 40 92 L42 80 C36 74 34 66 34 56 C34 36 46 22 62 22 C76 22 84 34 83 46 L88 58 L91 61 L86 64 L87 68 L84 71 L86 76 L80 82 L63 83 L61 92 C75 97 92 102 96 120 Z" />
        {kind === "lady" ? (
          <>
            <circle cx="33" cy="40" r="13" />
            <path d="M44 24 C52 18 66 18 74 26 L66 30 Z" />
          </>
        ) : (
          <path d="M36 50 C36 30 50 20 64 21 C74 22 82 28 83 38 C74 28 56 28 44 40 Z" />
        )}
      </g>
    </svg>
  );
}

/** A gilt frame with a cream mat and a cameo portrait, mounted flat on the wall. */
export function PortraitFrame({
  kind,
  shape = "oval",
  className = "",
}: {
  kind: Cameo;
  shape?: "oval" | "rect";
  className?: string;
}) {
  const round = shape === "oval" ? "rounded-[50%]" : "rounded-[3px]";
  return (
    <div
      aria-hidden="true"
      className={`relative p-[7px] shadow-[3px_10px_14px_-4px_rgb(60_35_15/0.5),1px_2px_4px_rgb(60_35_15/0.35),inset_0_1px_0_rgb(255_255_255/0.5)] ${round} ${className}`}
      style={GILT}
    >
      <div
        className={`size-full overflow-hidden p-[5px] shadow-[inset_0_2px_4px_rgb(60_35_15/0.55)] ${round}`}
        style={{ background: "#f6efdd" }}
      >
        <div className={`size-full overflow-hidden shadow-[0_0_0_1px_rgb(120_95_60/0.5)] ${round}`}>
          <Silhouette kind={kind} />
        </div>
      </div>
    </div>
  );
}

/**
 * Leonardo's Mona Lisa (public domain) in a carved gilt frame with a dark
 * liner, hung flat on the wall. `className` positions it and sets its height.
 */
export function MonaLisa({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <div
        className="relative h-full w-fit rounded-[3px] p-[14px] shadow-[6px_16px_22px_-6px_rgb(60_35_15/0.55),2px_4px_6px_rgb(60_35_15/0.3),inset_0_1px_0_rgb(255_245_210/0.8),inset_0_-2px_3px_rgb(90_60_20/0.5)]"
        style={GILT}
      >
        {/* carved texture on the gilt */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[3px] opacity-60 mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgb(255 245 210 / 0.5) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgb(90 60 20 / 0.4) 0 1px, transparent 1px 6px)",
          }}
        />
        {/* the inner bead and the sight edge */}
        <div
          className="relative h-full rounded-[2px] p-[3px] shadow-[0_0_0_2px_#7a5a24,inset_0_0_0_1px_rgb(255_240_200/0.6)]"
          style={GILT}
        >
          <div className="h-full bg-[#2a1f14] p-[3px] shadow-[inset_0_2px_4px_rgb(0_0_0/0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
            <img
              src="/personal/mona-lisa.webp"
              alt="Mona Lisa by Leonardo da Vinci, in a gilt frame"
              className="h-full w-auto max-w-none shadow-[inset_0_0_20px_rgb(0_0_0/0.5)]"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </figure>
  );
}
