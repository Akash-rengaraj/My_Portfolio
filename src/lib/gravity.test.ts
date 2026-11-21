import { describe, expect, it } from "vitest";

import {
  CENTRE,
  circularVelocity,
  CLICK_DRAG,
  distance,
  launchVelocity,
  predictPath,
  step,
  sweep,
} from "./gravity";

describe("gravity physics", () => {
  it("keeps a circular orbit roughly circular", () => {
    const start = { x: CENTRE.x + 150, y: CENTRE.y };
    let body = {
      ...start,
      ...(() => {
        const v = circularVelocity(start);
        return { vx: v.x, vy: v.y };
      })(),
    };
    for (let i = 0; i < 60 * 8 * 4; i++) body = step(body, 1 / 240);
    expect(distance(body, CENTRE)).toBeGreaterThan(130);
    expect(distance(body, CENTRE)).toBeLessThan(170);
  });

  it("turns a click into a perfect orbit and a drag into a fling", () => {
    const at = { x: CENTRE.x + 100, y: CENTRE.y };
    expect(launchVelocity(at, { x: at.x + CLICK_DRAG / 2, y: at.y })).toEqual(circularVelocity(at));
    const flung = launchVelocity(at, { x: at.x, y: at.y + 100 });
    expect(flung.x).toBe(0);
    expect(flung.y).toBeGreaterThan(0);
  });

  it("stops the prediction at the event horizon", () => {
    const path = predictPath({ x: CENTRE.x + 100, y: CENTRE.y, vx: 0, vy: 0 }, 400);
    expect(path.length).toBeLessThan(400);
  });

  it("wraps swept angles across the ±π seam", () => {
    expect(sweep(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2);
    expect(sweep(0, 0.5)).toBeCloseTo(0.5);
  });
});
