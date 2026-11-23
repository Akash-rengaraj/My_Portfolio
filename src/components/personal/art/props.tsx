import type { ReactNode } from "react";

/**
 * The owner's things, drawn without logos: a black Royal Enfield Himalayan
 * 450, a Yamaha F310 acoustic guitar and a laptop. Each is drawn in its own
 * local space; the scenes place them.
 */

/** The bike's front wheel in its local space (ground at y = 0). */
export const FRONT_WHEEL = { cx: 160, cy: -70, r: 70 } as const;
const REAR_WHEEL = { cx: -150, cy: -70, r: 70 } as const;

/** A spoked wheel; the spokes sit in a group the timeline can spin. */
function Wheel({ cx, cy, r, part }: { cx: number; cy: number; r: number; part: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke="#111114" strokeWidth="16" />
      <circle cx={cx} cy={cy} r={r - 20} fill="none" stroke="#6b6b73" strokeWidth="3" />
      <g data-part={part}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * (r - 21)}
              y2={cy + Math.sin(a) * (r - 21)}
              stroke="#9a9aa3"
              strokeWidth="1.6"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r="9" fill="#3a3a42" />
    </g>
  );
}

/** Black Himalayan 450, side view facing right; ground at y = 0. */
export function Himalayan() {
  return (
    <g>
      {/* rear fender, swingarm, exhaust */}
      <path
        d="M-230 -110 C-200 -150 -120 -150 -96 -128"
        stroke="#1a1a1f"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-150 -70 L-30 -88" stroke="#2a2a30" strokeWidth="14" strokeLinecap="round" />
      <path
        d="M-60 -64 L-150 -92 L-214 -100"
        stroke="#7d7d86"
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <Wheel {...REAR_WHEEL} part="rear-spokes" />
      {/* engine */}
      <path d="M-50 -136 L54 -136 L74 -70 L-34 -62 Z" fill="#2a2a30" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={-30 + i * 6}
          y1={-124 + i * 14}
          x2={50 + i * 4}
          y2={-124 + i * 14}
          stroke="#44444d"
          strokeWidth="5"
        />
      ))}
      {/* fork and front fender */}
      <path d="M112 -232 L160 -70" stroke="#8d8d96" strokeWidth="11" strokeLinecap="round" />
      <path
        d="M102 -134 C140 -158 196 -150 226 -114"
        stroke="#1a1a1f"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <Wheel {...FRONT_WHEEL} part="front-spokes" />
      {/* tank guard */}
      <path
        d="M-28 -150 L-56 -104 L-6 -84 L44 -112"
        stroke="#34343c"
        strokeWidth="7"
        fill="none"
        strokeLinejoin="round"
      />
      {/* tank */}
      <path d="M-44 -168 C-22 -196 52 -200 86 -170 L76 -138 L-40 -138 Z" fill="#1a1a1f" />
      <path
        d="M-20 -178 C4 -190 44 -190 70 -174"
        stroke="#ffffff"
        strokeOpacity=".2"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* seat and rear rack */}
      <path d="M-168 -160 C-130 -172 -68 -174 -42 -166 L-46 -150 L-168 -146 Z" fill="#2b211b" />
      <path d="M-200 -168 L-150 -168" stroke="#55555e" strokeWidth="5" />
      {/* handlebar, windscreen, headlamp */}
      <path d="M84 -236 L126 -244" stroke="#222228" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M120 -232 L134 -300 L156 -292 L146 -226 Z"
        fill="#c9daf2"
        fillOpacity=".35"
        stroke="#55555e"
        strokeWidth="2"
      />
      <circle cx="138" cy="-206" r="21" fill="#26262d" />
      <circle cx="138" cy="-206" r="14" fill="#f3eccb" />
    </g>
  );
}

/** The F310's sound hole in its local space (neck along +x). */
export const SOUND_HOLE = { cx: 30, cy: 0, r: 26 } as const;

/** The six strings, from bridge to headstock, in local space. */
export const STRINGS = Array.from({ length: 6 }, (_, i) => ({
  x1: -82,
  y1: -15 + i * 6,
  x2: 470,
  y2: -9 + i * 3.6,
}));

/** Yamaha F310 dreadnought, front view, neck pointing to +x. */
export function F310() {
  return (
    <g>
      {/* neck, frets, headstock */}
      <rect x="116" y="-15" width="310" height="30" rx="4" fill="#3d2414" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1={140 + i * 24}
          y1="-15"
          x2={140 + i * 24}
          y2="15"
          stroke="#c9c3b5"
          strokeWidth="2"
        />
      ))}
      <path d="M424 -20 L486 -26 C494 -16 494 16 486 26 L424 20 Z" fill="#2b190d" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={440 + i * 16} cy="-30" r="5" fill="#cfcfd6" />
          <circle cx={440 + i * 16} cy="30" r="5" fill="#cfcfd6" />
        </g>
      ))}
      {/* body */}
      <path
        d="M-150 0 C-150 -70 -110 -95 -60 -92 C-30 -90 -20 -70 0 -68 C20 -66 40 -82 70 -80 C110 -78 120 -40 120 0 C120 40 110 78 70 80 C40 82 20 66 0 68 C-20 70 -30 90 -60 92 C-110 95 -150 70 -150 0 Z"
        fill="#e4b97c"
        stroke="#6b4423"
        strokeWidth="5"
      />
      <path
        d="M-130 -30 C-110 -70 -60 -80 -20 -60"
        stroke="#fff4dc"
        strokeOpacity=".35"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* tortoiseshell pickguard, rosette, sound hole */}
      <path d="M56 6 C72 22 72 50 48 58 C34 52 32 34 44 26 Z" fill="#5a2e18" />
      <circle
        cx={SOUND_HOLE.cx}
        cy={SOUND_HOLE.cy}
        r="36"
        fill="none"
        stroke="#7a5230"
        strokeWidth="2"
      />
      <circle
        cx={SOUND_HOLE.cx}
        cy={SOUND_HOLE.cy}
        r="31"
        fill="none"
        stroke="#3a2414"
        strokeWidth="3"
      />
      <circle cx={SOUND_HOLE.cx} cy={SOUND_HOLE.cy} r={SOUND_HOLE.r} fill="#21140a" />
      {/* bridge */}
      <rect x="-96" y="-32" width="18" height="64" rx="5" fill="#2f1c0f" />
      <line x1="-84" y1="-26" x2="-84" y2="26" stroke="#efe6d2" strokeWidth="2" />
      {/* strings */}
      <g data-part="strings">
        {STRINGS.map((s, i) => (
          <line key={i} {...s} stroke="#e6e6ea" strokeWidth={1 + (i < 3 ? 0.6 : 0)} />
        ))}
      </g>
    </g>
  );
}

/** Laptop facing the viewer, 320 × 232; the screen rect is `data-part="screen"`. */
export function Laptop({ children }: { children?: ReactNode }) {
  return (
    <g>
      <rect x="0" y="0" width="320" height="212" rx="12" fill="#1d1d24" />
      <rect data-part="screen" x="12" y="12" width="296" height="186" rx="4" fill="#0b1020" />
      <svg x="12" y="12" width="296" height="186" viewBox="0 0 296 186" overflow="hidden">
        {children}
      </svg>
      <path d="M-24 212 L344 212 L374 234 L-54 234 Z" fill="#2b2b33" />
      <path d="M130 222 L190 222" stroke="#44444d" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}
