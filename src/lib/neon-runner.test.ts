import { describe, expect, it } from "vitest";

import {
  GROUND,
  jump,
  makeThing,
  nextGap,
  overlaps,
  scoreFor,
  speedAt,
  START_RUNNER,
  stepRunner,
} from "./neon-runner";

describe("neon runner rules", () => {
  it("jumps, double-jumps, then has no jumps left until landing", () => {
    const once = jump(START_RUNNER);
    expect(once.vy).toBeLessThan(0);
    expect(once.grounded).toBe(false);
    const twice = jump(once);
    expect(twice.jumpsLeft).toBe(0);
    expect(jump(twice)).toBe(twice);
  });

  it("lands back on the ground with jumps restored", () => {
    let runner = jump(START_RUNNER);
    for (let i = 0; i < 200; i++) runner = stepRunner(runner, 1 / 60, false);
    expect(runner.y).toBe(GROUND);
    expect(runner.grounded).toBe(true);
    expect(runner.jumpsLeft).toBe(2);
  });

  it("jumps higher while the button is held", () => {
    const peak = (hold: boolean) => {
      let runner = jump(START_RUNNER);
      let top = runner.y;
      for (let i = 0; i < 120; i++) {
        runner = stepRunner(runner, 1 / 120, hold);
        top = Math.min(top, runner.y);
      }
      return top;
    };
    expect(peak(true)).toBeLessThan(peak(false));
  });

  it("speeds up over time and keeps gaps jumpable", () => {
    expect(speedAt(30)).toBeGreaterThan(speedAt(0));
    expect(nextGap(speedAt(0), 0)).toBeGreaterThan(300);
  });

  it("detects overlaps and scores distance plus coffee", () => {
    expect(overlaps({ x: 0, y: 0, w: 20, h: 20 }, { x: 10, y: 10, w: 20, h: 20 })).toBe(true);
    expect(overlaps({ x: 0, y: 0, w: 20, h: 20 }, { x: 30, y: 0, w: 20, h: 20 })).toBe(false);
    expect(scoreFor(1000, 2)).toBe(150);
    expect(makeThing(1, 500, 0.1).kind).toBe("coffee");
    expect(makeThing(1, 500, 0.9).kind).toBe("bug");
  });
});
