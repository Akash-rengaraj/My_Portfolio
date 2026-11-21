import { describe, expect, it } from "vitest";

import {
  createRandom,
  crumpledOutline,
  layerTransform,
  localToWorld,
  sheetOutline,
  toPointsAttr,
  worldToScreen,
  wrinkledOutline,
  type Camera,
} from "./geometry";

const viewport = { width: 1600, height: 900 };

describe("createRandom", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("outlines", () => {
  const sheet = sheetOutline(460, 580, 72);

  it("keeps point counts equal so outlines can morph", () => {
    expect(sheet).toHaveLength(72);
    expect(crumpledOutline(sheet, 60, 7)).toHaveLength(72);
    expect(wrinkledOutline(sheet, 5, 7)).toHaveLength(72);
  });

  it("crumples within [0.6r, 1.15r] and preserves each point's angle", () => {
    crumpledOutline(sheet, 60, 7).forEach((p, i) => {
      const r = Math.hypot(p.x, p.y);
      expect(r).toBeGreaterThan(36);
      expect(r).toBeLessThan(69);
      const src = sheet[i]!;
      expect(Math.atan2(p.y, p.x)).toBeCloseTo(Math.atan2(src.y, src.x), 6);
    });
  });

  it("serializes points with one decimal", () => {
    expect(toPointsAttr([{ x: 1, y: -2.25 }])).toBe("1.0,-2.3");
  });
});

describe("parallax camera", () => {
  const camera: Camera = { x: 400, y: 200, zoom: 1, tilt: 0 };

  it("centres camera × depth on each layer (the camera target itself on the mid layer)", () => {
    for (const depth of [0.6, 1, 1.35]) {
      const p = worldToScreen({ x: 400 * depth, y: 200 * depth }, camera, depth, viewport);
      expect(p.x).toBeCloseTo(800);
      expect(p.y).toBeCloseTo(450);
    }
  });

  it("doubles screen distance on the mid layer at zoom 2", () => {
    const near = worldToScreen({ x: 500, y: 200 }, camera, 1, viewport);
    const zoomed = worldToScreen({ x: 500, y: 200 }, { ...camera, zoom: 2 }, 1, viewport);
    expect(zoomed.x - 800).toBeCloseTo((near.x - 800) * 2);
  });

  it("moves the far layer less than the mid layer for the same pan", () => {
    const point = { x: 0, y: 0 };
    const panned = { ...camera, x: camera.x + 100 };
    const farShift =
      worldToScreen(point, panned, 0.6, viewport).x - worldToScreen(point, camera, 0.6, viewport).x;
    const midShift =
      worldToScreen(point, panned, 1, viewport).x - worldToScreen(point, camera, 1, viewport).x;
    expect(Math.abs(farShift)).toBeLessThan(Math.abs(midShift));
  });

  it("agrees with layerTransform's rotation", () => {
    const tilted = { ...camera, tilt: 10 };
    expect(layerTransform(tilted, 1, viewport)).toContain("rotate(10");
    const p = worldToScreen({ x: 500, y: 200 }, tilted, 1, viewport);
    expect(p.y).toBeGreaterThan(450); // +x rotates clockwise (downward) in SVG
  });
});

describe("localToWorld", () => {
  it("rotates paper-space points about the pose origin, then translates", () => {
    const p = localToWorld({ x: 10, y: 0 }, { x: 100, y: 50 }, 90);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(60);
  });
});
