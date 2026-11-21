import type { CSSProperties } from "react";

import { PALETTE } from "./scene-layout";

/** Initially hidden; the timeline reveals it with `autoAlpha`. */
export const HIDDEN: CSSProperties = { opacity: 0, visibility: "hidden" };
export const HAND_FONT: CSSProperties = { fontFamily: "var(--font-caveat), cursive" };
export const MONO_FONT: CSSProperties = { fontFamily: "var(--font-geist-mono), monospace" };
export const SANS_FONT: CSSProperties = { fontFamily: "var(--font-geist-sans), sans-serif" };

/** Builds a document-unique id for SVG defs (gradients, filters, clip paths). */
export type Ids = (name: string) => string;

interface GlassProps {
  x: number;
  y: number;
  width: number;
  height: number;
  ids: Ids;
  radius?: number;
}

/** Translucent panel (theme-aware) with a 1px gradient border and an inner top highlight. */
export function Glass({ x, y, width, height, ids, radius = 14 }: GlassProps) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        fill={PALETTE.panel}
        fillOpacity={0.82}
      />
      <rect
        x={x + 0.5}
        y={y + 0.5}
        width={width - 1}
        height={height - 1}
        rx={radius}
        fill="none"
        stroke={`url(#${ids("glass-border")})`}
        strokeWidth={1}
      />
      <line
        x1={x + radius}
        x2={x + width - radius}
        y1={y + 1.5}
        y2={y + 1.5}
        stroke={`url(#${ids("glass-top")})`}
        strokeWidth={1}
      />
    </>
  );
}

/** Window chrome: traffic lights, file name and a step tag. */
export function TitleBar({ width, file, step }: { width: number; file: string; step?: string }) {
  return (
    <>
      <line x1={0} x2={width} y1={40} y2={40} stroke={PALETTE.panelBorder} />
      {["#ff5f57", "#febc2e", "#28c840"].map((color, i) => (
        <circle key={color} cx={22 + i * 20} cy={20} r={6} fill={color} opacity={0.75} />
      ))}
      <text x={92} y={25} fontSize={14} fill={PALETTE.uiMuted} style={MONO_FONT}>
        {file}
      </text>
      {step ? (
        <text
          x={width - 20}
          y={25}
          fontSize={12}
          letterSpacing={1.5}
          textAnchor="end"
          fill={PALETTE.accent}
          style={MONO_FONT}
        >
          {step.toUpperCase()}
        </text>
      ) : null}
    </>
  );
}
