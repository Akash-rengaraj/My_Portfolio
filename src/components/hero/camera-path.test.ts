import { describe, expect, it } from "vitest";

import { sectionProgress, warpProgress } from "./camera-path";

describe("warpProgress", () => {
  const warps = [{ at: 0.5, radius: 0.1, speed: 0.25 }];

  it("maps 0→0 and 1→1", () => {
    expect(warpProgress(0, warps)).toBeCloseTo(0);
    expect(warpProgress(1, warps)).toBeCloseTo(1);
  });

  it("is monotonic", () => {
    let previous = -1;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const t = warpProgress(p, warps);
      expect(t).toBeGreaterThanOrEqual(previous);
      previous = t;
    }
  });

  it("slows story time inside the warp window", () => {
    const step = 0.01;
    const centre = warpProgress(0.5 + step, warps) - warpProgress(0.5, warps);
    const outside = warpProgress(0.05 + step, warps) - warpProgress(0.05, warps);
    expect(centre).toBeLessThan(outside * 0.5);
  });

  it("is the identity without warps", () => {
    expect(warpProgress(0.37, [])).toBe(0.37);
  });
});

describe("sectionProgress", () => {
  it("maps the pinned scroll distance to 0–1 and clamps", () => {
    expect(sectionProgress(0, 6800, 1000)).toBe(0);
    expect(sectionProgress(-2900, 6800, 1000)).toBeCloseTo(0.5);
    expect(sectionProgress(-9000, 6800, 1000)).toBe(1);
    expect(sectionProgress(300, 6800, 1000)).toBe(0);
  });

  it("is 0 when the section is not taller than the viewport", () => {
    expect(sectionProgress(-50, 900, 900)).toBe(0);
  });
});
