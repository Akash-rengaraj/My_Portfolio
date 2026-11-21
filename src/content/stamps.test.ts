import { describe, expect, it } from "vitest";

import {
  parseStamps,
  serializeStamps,
  STAMP_IDS,
  STAMPS,
  ticketName,
  ticketSerial,
} from "./stamps";

describe("passport stamps", () => {
  it("has one stamp per place, each with a hint and an ink", () => {
    expect(STAMPS.map((s) => s.id)).toEqual([...STAMP_IDS]);
    for (const stamp of STAMPS) {
      expect(stamp.hint.length).toBeGreaterThan(0);
      expect(stamp.ink).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("round-trips stamps in route order and ignores junk", () => {
    expect(parseStamps(serializeStamps(["road", "desk"]))).toEqual(["desk", "road"]);
    expect(parseStamps("x,pinboard,,pinboard")).toEqual(["pinboard"]);
    expect(parseStamps(null)).toEqual([]);
  });

  it("tidies ticket names and gives each a stable serial", () => {
    expect(ticketName("  Ada   Lovelace  ")).toBe("Ada Lovelace");
    expect(ticketName("x".repeat(40))).toHaveLength(24);
    expect(ticketSerial("Ada")).toBe(ticketSerial("ada"));
    expect(ticketSerial("Ada")).toMatch(/^AR-\d{5}$/);
  });
});
