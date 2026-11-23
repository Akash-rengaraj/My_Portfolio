/**
 * Where things sit in the 1600 × 900 story frame, and the shapes the match
 * cuts travel between. Scenes and the timeline both read these, so a cut
 * always starts and ends exactly on the drawn object.
 */

import { FRONT_WHEEL, SOUND_HOLE, STRINGS } from "./props";

export const FRAME = { width: 1600, height: 900 } as const;

type Placement = { x: number; y: number; rotate: number; scale: number };

/** Maps a point from an object's local space into the frame. */
export function place(x: number, y: number, at: Placement): { x: number; y: number } {
  const a = (at.rotate * Math.PI) / 180;
  return {
    x: at.x + at.scale * (x * Math.cos(a) - y * Math.sin(a)),
    y: at.y + at.scale * (x * Math.sin(a) + y * Math.cos(a)),
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The laptop's top-left corner; its screen is 296 × 186, inset 12. */
export const LAPTOP_AT = { x: 870, y: 406 } as const;
export const SCREEN_CENTER = { x: LAPTOP_AT.x + 160, y: LAPTOP_AT.y + 105 } as const;

/** The bike (ground point) in the ride scene. */
export const BIKE_AT = { x: 720, y: 830 } as const;
export const FRONT_SPOKES_ORIGIN = `${BIKE_AT.x + FRONT_WHEEL.cx} ${BIKE_AT.y + FRONT_WHEEL.cy}`;
export const REAR_SPOKES_ORIGIN = `${BIKE_AT.x - 150} ${BIKE_AT.y - 70}`;

/** The guitar in the guitar scene. */
export const GUITAR_AT: Placement = { x: 760, y: 650, rotate: -14, scale: 0.95 };

/** Cut 3 → 4: the front wheel's tyre… */
export const WHEEL_CUT = {
  cx: BIKE_AT.x + FRONT_WHEEL.cx,
  cy: BIKE_AT.y + FRONT_WHEEL.cy,
  r: FRONT_WHEEL.r - 8,
} as const;
const hole = place(SOUND_HOLE.cx, SOUND_HOLE.cy, GUITAR_AT);
/** …becomes the guitar's sound hole. */
export const HOLE_CUT = {
  cx: round(hole.x),
  cy: round(hole.y),
  r: round(SOUND_HOLE.r * GUITAR_AT.scale),
} as const;

type Line = { x1: number; y1: number; x2: number; y2: number };

/** Cut 4 → 5: the six strings… */
export const STRING_CUTS: readonly Line[] = STRINGS.map((s) => {
  const a = place(s.x1, s.y1, GUITAR_AT);
  const b = place(s.x2, s.y2, GUITAR_AT);
  return { x1: round(a.x), y1: round(a.y), x2: round(b.x), y2: round(b.y) };
});

/** …become the six rules on the notebook's right page. */
export const RULES: readonly Line[] = Array.from({ length: 6 }, (_, i) => ({
  x1: 972,
  y1: 606 + i * 9.5,
  x2: 1104,
  y2: 606 + i * 9.5,
}));

/** Cut 5 → 6: an ink blot on the page… */
export const BLOT =
  "M1040 630 C1052 628 1060 636 1058 645 C1056 654 1044 657 1036 651 C1028 645 1030 632 1040 630 Z";

/** …becomes the chocolate glaze dripping down the cake. */
export const DRIP =
  "M830 516 C860 506 1000 506 1030 516 L1030 548 C1024 548 1022 574 1014 574 C1006 574 1006 550 998 550 C990 550 990 590 980 590 C970 590 972 552 962 552 C954 552 954 568 946 568 C938 568 940 552 930 552 C920 552 922 584 912 584 C902 584 904 552 894 552 C886 552 886 566 878 566 C870 566 872 552 862 552 C852 552 852 578 842 578 C834 578 834 550 830 550 Z";

/** The candle flame, whose glow opens the closing frame. */
export const CANDLE = { cx: 930, cy: 446 } as const;
