import { describe, expect, it } from "vitest";

import { BUG_IDS, parseCaught, serializeCaught, SPECIMENS } from "./bugs";

describe("bug hunt content", () => {
  it("has one specimen per hidden bug, each with a name and a hint", () => {
    expect(SPECIMENS.map((s) => s.id)).toEqual([...BUG_IDS]);
    for (const specimen of SPECIMENS) {
      expect(specimen.latin.length).toBeGreaterThan(0);
      expect(specimen.hint.length).toBeGreaterThan(0);
    }
  });

  it("round-trips caught ids in hunt order and ignores junk", () => {
    expect(parseCaught(serializeCaught(["footer", "hero"]))).toEqual(["hero", "footer"]);
    expect(parseCaught("nope,works,,works")).toEqual(["works"]);
    expect(parseCaught(null)).toEqual([]);
  });
});
