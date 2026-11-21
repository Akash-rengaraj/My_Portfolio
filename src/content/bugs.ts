/**
 * "Catch the Bugs": five bugs hide around the portfolio, one per chapter.
 * Each becomes a pinned specimen in the After Hours case once caught.
 */

export const BUG_IDS = ["hero", "works", "toolkit", "journey", "footer"] as const;

export type BugId = (typeof BUG_IDS)[number];

export interface Specimen {
  id: BugId;
  /** Joke scientific name on the specimen label. */
  latin: string;
  /** Where it was found, once caught. */
  habitat: string;
  /** Hint shown in the empty slot until it's caught. */
  hint: string;
  /** Shell colour of the pinned specimen. */
  hue: string;
}

export const SPECIMENS: readonly Specimen[] = [
  {
    id: "hero",
    latin: "Nullus pointerus",
    habitat: "loitering in the tagline",
    hint: "One crept into my tagline, right at the very start.",
    hue: "#e5484d",
  },
  {
    id: "works",
    latin: "Offbyonus erroris",
    habitat: "stuck to a sticky note",
    hint: "One is stuck to a sticky note on the pinboard.",
    hue: "#f5b84b",
  },
  {
    id: "toolkit",
    latin: "Undefinedus notafunctionus",
    habitat: "hiding in a language card",
    hint: "One is hiding in a language card on the workbench.",
    hue: "#8ab4ff",
  },
  {
    id: "journey",
    latin: "Racecondita sneakii",
    habitat: "riding the train to Coimbatore",
    hint: "One hitched a ride on my train ticket.",
    hue: "#4ade80",
  },
  {
    id: "footer",
    latin: "Cssus centeritus",
    habitat: "lurking under the footer",
    hint: "One is lurking at the very bottom of the page.",
    hue: "#c4b5fd",
  },
];

/** Parses the stored list, keeping only known ids, in hunt order. */
export function parseCaught(raw: string | null): BugId[] {
  if (!raw) return [];
  const ids = new Set(raw.split(","));
  return BUG_IDS.filter((id) => ids.has(id));
}

export function serializeCaught(ids: readonly BugId[]): string {
  return BUG_IDS.filter((id) => ids.includes(id)).join(",");
}
