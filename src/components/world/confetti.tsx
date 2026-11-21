import type { CSSProperties } from "react";

const COLORS = ["#ff5a1f", "#8ab4ff", "#4ade80", "#f5b84b", "#ff8fb3", "#c4b5fd"] as const;

/** Precomputed, deterministic burst (no Math.random during render). */
const PIECES = Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.21;
  const distance = 110 + ((i * 47) % 120);
  return {
    key: i,
    color: COLORS[i % COLORS.length],
    cx: `${Math.round(Math.cos(angle) * distance)}px`,
    cy: `${Math.round(Math.sin(angle) * distance + 90)}px`,
    cr: `${(i * 97) % 540}deg`,
    delay: `${(i % 6) * 25}ms`,
    wide: i % 2 === 0,
  };
});

/**
 * One-shot confetti burst from the centre of its parent. Re-key it to replay.
 * Hidden entirely for reduced motion.
 */
export function Confetti() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-30 motion-reduce:hidden"
    >
      {PIECES.map((piece) => (
        <span
          key={piece.key}
          className={`absolute block rounded-[1px] ${piece.wide ? "h-1.5 w-3" : "h-3 w-1.5"}`}
          style={
            {
              background: piece.color,
              "--cx": piece.cx,
              "--cy": piece.cy,
              "--cr": piece.cr,
              animation: `confetti-fall 1.4s cubic-bezier(0.2, 0.7, 0.3, 1) ${piece.delay} both`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
