/**
 * "Fill the Passport": every place on the page hides a rubber stamp. Stamp all
 * of them into the passport to earn the Golden Ticket.
 */

export const STAMP_IDS = [
  "desk",
  "pinboard",
  "workbench",
  "frames",
  "scoreboard",
  "road",
  "afterHours",
  "door",
] as const;

export type StampId = (typeof STAMP_IDS)[number];

export interface StampInfo {
  id: StampId;
  /** Printed around the top of the stamp. */
  place: string;
  number: string;
  /** Printed along the bottom of the stamp. */
  motto: string;
  /** Hint shown on the empty visa slot. */
  hint: string;
  ink: string;
  icon: "pen" | "pin" | "wrench" | "frame" | "trophy" | "train" | "moon" | "door";
}

export const STAMPS: readonly StampInfo[] = [
  {
    id: "desk",
    place: "THE DESK",
    number: "01",
    motto: "problems caught",
    hint: "The first stamp sits right where my story starts.",
    ink: "#d9480f",
    icon: "pen",
  },
  {
    id: "pinboard",
    place: "THE PINBOARD",
    number: "02",
    motto: "shipped & pinned",
    hint: "One is stuck on a sticky note on the pinboard.",
    ink: "#be185d",
    icon: "pin",
  },
  {
    id: "workbench",
    place: "THE WORKBENCH",
    number: "03",
    motto: "tools sharpened",
    hint: "One is resting on a language card on the workbench.",
    ink: "#1d4ed8",
    icon: "wrench",
  },
  {
    id: "frames",
    place: "THE FRAME WALL",
    number: "04",
    motto: "homework done",
    hint: "One is resting on a certificate card on the frame wall.",
    ink: "#b45309",
    icon: "frame",
  },
  {
    id: "scoreboard",
    place: "THE SCOREBOARD",
    number: "05",
    motto: "numbers kept",
    hint: "One is sitting with the HackerRank badges.",
    ink: "#0e7490",
    icon: "trophy",
  },
  {
    id: "road",
    place: "THE ROAD",
    number: "06",
    motto: "miles travelled",
    hint: "One is riding along on my train ticket.",
    ink: "#15803d",
    icon: "train",
  },
  {
    id: "afterHours",
    place: "AFTER HOURS",
    number: "07",
    motto: "lights still on",
    hint: "The last one waits at the very end of the road.",
    ink: "#6d28d9",
    icon: "moon",
  },
  {
    id: "door",
    place: "THE DOOR",
    number: "08",
    motto: "always open",
    hint: "One is waiting by my email address.",
    ink: "#9f1239",
    icon: "door",
  },
];

/** Parses the stored list, keeping only known ids, in route order. */
export function parseStamps(raw: string | null): StampId[] {
  if (!raw) return [];
  const ids = new Set(raw.split(","));
  return STAMP_IDS.filter((id) => ids.has(id));
}

export function serializeStamps(ids: readonly StampId[]): string {
  return STAMP_IDS.filter((id) => ids.includes(id)).join(",");
}

/** Cleans a visitor's name for the Golden Ticket. */
export function ticketName(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, 24);
}

/** A stable, friendly serial for a ticket holder. */
export function ticketSerial(name: string): string {
  let hash = 2166136261;
  for (const char of name.toLowerCase()) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `AR-${String((hash >>> 0) % 100000).padStart(5, "0")}`;
}
