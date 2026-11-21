import { describe, expect, it } from "vitest";

import { layerTransform } from "./geometry";
import { createRig, frameViewport, rigTransforms } from "./story-rig";

describe("frameViewport", () => {
  it("shows 1500 world units across on a wide 16:9 screen", () => {
    const frame = frameViewport({ width: 1600, height: 900 }, "wide");
    expect(frame.width).toBe(1500);
    expect(frame.height).toBeCloseTo(843.75);
  });

  it("keeps at least 800 units of height on ultra-wide screens", () => {
    const frame = frameViewport({ width: 3200, height: 900 }, "wide");
    expect(frame.height).toBe(800);
    expect(frame.width / frame.height).toBeCloseTo(3200 / 900);
  });

  it("shows 760 units across on a phone, preserving its aspect", () => {
    const frame = frameViewport({ width: 390, height: 844 }, "narrow");
    expect(frame.width).toBe(760);
    expect(frame.height / frame.width).toBeCloseTo(844 / 390);
  });

  it("falls back to 16:9 for an unmeasured (0×0) stage", () => {
    const frame = frameViewport({ width: 0, height: 0 }, "wide");
    expect(frame.width / frame.height).toBeCloseTo(16 / 9);
  });
});

describe("rig", () => {
  it("frames the opening differently on phones", () => {
    expect(createRig("narrow").camera).not.toEqual(createRig("wide").camera);
  });

  it("renders the mid layer with the shared parallax transform", () => {
    const rig = createRig("wide");
    const frame = frameViewport({ width: 1600, height: 900 }, "wide");
    const t = rigTransforms(rig, frame);
    expect(t.mid).toBe(layerTransform(rig.camera, 1, frame));
    expect(t.far).not.toBe(t.mid);
    expect(t.paper).toBe(`translate(${rig.paper.x.toFixed(2)} ${rig.paper.y.toFixed(2)})`);
  });
});
