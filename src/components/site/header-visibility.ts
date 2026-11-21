/** Scroll state that decides whether the fixed header is shown. */
export interface HeaderState {
  /** Last observed scroll position. */
  y: number;
  hidden: boolean;
  /** True once the page has scrolled at all (header gets its glass background). */
  scrolled: boolean;
}

/** Always visible above this scroll position. */
const REVEAL_ZONE = 120;
/** Ignore scroll changes smaller than this (trackpad jitter). */
const JITTER = 4;

/** Hide on scroll down, show on scroll up or near the top. */
export function nextHeaderState(prev: HeaderState, y: number): HeaderState {
  const delta = y - prev.y;
  const scrolled = y > 0;
  if (y <= REVEAL_ZONE) return { y, hidden: false, scrolled };
  if (Math.abs(delta) < JITTER) return { ...prev, scrolled };
  return { y, hidden: delta > 0, scrolled };
}
