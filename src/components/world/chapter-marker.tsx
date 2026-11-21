/**
 * The site is one world with different places: the desk (hero), the
 * pinboard (works), the workbench (toolkit), the frame wall (certificates),
 * the scoreboard (stats), the road (journey), after hours (passport) and the
 * door (contact). Each section opens with its chapter number, its place and a
 * handwritten aside.
 */
export const CHAPTERS = {
  desk: { number: "01", place: "the desk" },
  pinboard: { number: "02", place: "the pinboard" },
  workbench: { number: "03", place: "the workbench" },
  frames: { number: "04", place: "the frame wall" },
  scoreboard: { number: "05", place: "the scoreboard" },
  road: { number: "06", place: "the road" },
  afterHours: { number: "07", place: "after hours" },
  door: { number: "08", place: "the door" },
} as const;

export type ChapterId = keyof typeof CHAPTERS;

/** "chapter 02 —— the pinboard" with a handwritten note underneath. */
export function ChapterMarker({ chapter, note }: { chapter: ChapterId; note: string }) {
  const { number, place } = CHAPTERS[chapter];
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-stage-muted uppercase">
        <span className="text-signal">chapter {number}</span>
        <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
        <span>{place}</span>
      </p>
      <p className="-rotate-1 font-hand text-2xl leading-tight text-stage-foreground/75 sm:text-[1.7rem]">
        {note}
      </p>
    </div>
  );
}
