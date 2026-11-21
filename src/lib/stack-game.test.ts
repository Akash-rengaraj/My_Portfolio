import { describe, expect, it } from "vitest";

import { axisFor, BASE_SIZE, drop, speedFor, verdictFor, type Slab } from "./stack-game";

const slab = (over: Partial<Slab> = {}): Slab => ({
  x: -BASE_SIZE / 2,
  z: -BASE_SIZE / 2,
  w: BASE_SIZE,
  d: BASE_SIZE,
  y: 0,
  hue: "#8ab4ff",
  label: "React",
  ...over,
});

describe("stack game rules", () => {
  it("alternates the sliding axis and speeds up", () => {
    expect(axisFor(1)).toBe("x");
    expect(axisFor(2)).toBe("z");
    expect(speedFor(10)).toBeGreaterThan(speedFor(1));
  });

  it("snaps a near-perfect drop into place with no offcut", () => {
    const result = drop(slab(), slab({ x: -48 }), "x");
    expect(result.perfect).toBe(true);
    expect(result.debris).toBeNull();
    expect(result.placed).toMatchObject({ x: -50, w: 100 });
  });

  it("slices off what overhangs on the far side", () => {
    const result = drop(slab(), slab({ x: -30 }), "x");
    expect(result.placed).toMatchObject({ x: -30, w: 80 });
    expect(result.debris).toMatchObject({ x: 50, w: 20 });
  });

  it("slices off what overhangs on the near side", () => {
    const result = drop(slab(), slab({ z: -75 }), "z");
    expect(result.placed).toMatchObject({ z: -50, d: 75 });
    expect(result.debris).toMatchObject({ z: -75, d: 25 });
  });

  it("misses completely when nothing overlaps", () => {
    const result = drop(slab(), slab({ x: 60 }), "x");
    expect(result.placed).toBeNull();
    expect(result.debris).toMatchObject({ x: 60 });
  });

  it("always has a kind verdict", () => {
    expect(verdictFor(0)).toMatch(/again/i);
    expect(verdictFor(40)).toMatch(/cloud/i);
  });
});
