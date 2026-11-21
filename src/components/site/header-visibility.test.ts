import { describe, expect, it } from "vitest";

import { nextHeaderState, type HeaderState } from "./header-visibility";

const at = (y: number, hidden = false, scrolled = y > 0): HeaderState => ({ y, hidden, scrolled });

describe("nextHeaderState", () => {
  it("stays visible near the top of the page", () => {
    expect(nextHeaderState(at(0), 60).hidden).toBe(false);
  });

  it("hides when scrolling down past the threshold", () => {
    expect(nextHeaderState(at(300), 340).hidden).toBe(true);
  });

  it("shows again as soon as the visitor scrolls up", () => {
    expect(nextHeaderState(at(900, true), 880).hidden).toBe(false);
  });

  it("ignores jitter smaller than a few pixels", () => {
    expect(nextHeaderState(at(900, true), 898).hidden).toBe(true);
    expect(nextHeaderState(at(900, false), 902).hidden).toBe(false);
  });

  it("reports when the page has scrolled at all (for the glass background)", () => {
    expect(nextHeaderState(at(0), 0).scrolled).toBe(false);
    expect(nextHeaderState(at(0), 12).scrolled).toBe(true);
  });
});
