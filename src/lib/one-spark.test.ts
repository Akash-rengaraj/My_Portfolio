import { describe, expect, it } from "vitest";

import {
  BLAST,
  blastOver,
  blastRadius,
  LEVELS,
  passed,
  roundMessage,
  scaledRadius,
  touches,
} from "./one-spark";

describe("one spark rules", () => {
  it("grows a blast, holds it, then fades it out", () => {
    expect(blastRadius(0)).toBe(0);
    expect(blastRadius(BLAST.grow + 0.1)).toBe(BLAST.radius);
    const end = BLAST.grow + BLAST.hold + BLAST.shrink;
    expect(blastRadius(end)).toBe(0);
    expect(blastOver(end)).toBe(true);
    expect(blastOver(end - 0.01)).toBe(false);
  });

  it("catches lanterns inside the blast plus their own radius", () => {
    expect(touches(50, 0, 46, 7)).toBe(true);
    expect(touches(60, 0, 46, 7)).toBe(false);
    expect(touches(0, 0, 0, 7)).toBe(false);
  });

  it("has achievable levels that get harder", () => {
    for (const level of LEVELS) expect(level.goal).toBeLessThanOrEqual(level.lanterns);
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.goal).toBeGreaterThan(LEVELS[i - 1]!.goal);
    }
  });

  it("scales the blast for small skies, within limits", () => {
    expect(scaledRadius(320)).toBeLessThan(scaledRadius(800));
    expect(scaledRadius(4000)).toBeCloseTo(BLAST.radius * 1.15);
  });

  it("passes a level at its goal and cheers accordingly", () => {
    const level = { lanterns: 10, goal: 3 };
    expect(passed(level, 3)).toBe(true);
    expect(passed(level, 2)).toBe(false);
    expect(roundMessage(level, 10)).toMatch(/every single/i);
    expect(roundMessage(level, 2)).toMatch(/close/i);
  });
});
