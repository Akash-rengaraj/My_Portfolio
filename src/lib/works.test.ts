import { describe, expect, it } from "vitest";

import {
  ALL,
  categoriesOf,
  countUpValue,
  filterProjects,
  formatIndex,
  moveIndex,
  splitTitle,
  techCounts,
  tiltFor,
} from "./works";

const items = [
  { slug: "a", category: "AI / ML" },
  { slug: "b", category: "Frontend" },
  { slug: "c", category: "AI / ML" },
  { slug: "d", category: "Full-stack" },
];

describe("categories and filtering", () => {
  it("lists each category once, in order of first appearance, after All", () => {
    expect(categoriesOf(items)).toEqual([ALL, "AI / ML", "Frontend", "Full-stack"]);
  });

  it("filters by category and returns everything for All", () => {
    expect(filterProjects(items, ALL)).toHaveLength(4);
    expect(filterProjects(items, "AI / ML").map((p) => p.slug)).toEqual(["a", "c"]);
  });
});

describe("moveIndex (keyboard navigation)", () => {
  it("moves down/right and up/left with wrap-around", () => {
    expect(moveIndex(0, "ArrowDown", 4)).toBe(1);
    expect(moveIndex(3, "ArrowRight", 4)).toBe(0);
    expect(moveIndex(0, "ArrowUp", 4)).toBe(3);
    expect(moveIndex(2, "ArrowLeft", 4)).toBe(1);
  });

  it("jumps to the ends with Home and End and ignores other keys", () => {
    expect(moveIndex(2, "Home", 4)).toBe(0);
    expect(moveIndex(1, "End", 4)).toBe(3);
    expect(moveIndex(1, "a", 4)).toBeNull();
    expect(moveIndex(0, "ArrowDown", 0)).toBeNull();
  });
});

describe("formatIndex", () => {
  it("zero-pads to two digits", () => {
    expect(formatIndex(0)).toBe("01");
    expect(formatIndex(11)).toBe("12");
  });
});

describe("tiltFor", () => {
  const rect = { left: 100, top: 100, width: 400, height: 200 };

  it("is flat at the centre", () => {
    expect(tiltFor(300, 200, rect, 10)).toEqual({ rx: 0, ry: 0 });
  });

  it("tilts towards the pointer, up to the maximum", () => {
    const right = tiltFor(500, 200, rect, 10);
    expect(right.ry).toBeCloseTo(10);
    const top = tiltFor(300, 100, rect, 10);
    expect(top.rx).toBeCloseTo(10);
    expect(tiltFor(5000, 5000, rect, 10).ry).toBe(10);
  });
});

describe("countUpValue", () => {
  it("eases from 0 to the target and clamps", () => {
    expect(countUpValue(0, 50)).toBe(0);
    expect(countUpValue(1, 50)).toBe(50);
    expect(countUpValue(2, 50)).toBe(50);
    expect(countUpValue(0.5, 50)).toBeGreaterThan(25);
  });

  it("returns whole numbers", () => {
    expect(Number.isInteger(countUpValue(0.37, 94))).toBe(true);
  });
});

describe("splitTitle", () => {
  it("splits a project title into a short name and a subtitle", () => {
    expect(splitTitle("Neo — Interactive Defensive Analytics")).toEqual({
      name: "Neo",
      subtitle: "Interactive Defensive Analytics",
    });
  });

  it("keeps a title without a dash as the name", () => {
    expect(splitTitle("Full-Stack Jewellery E-Commerce")).toEqual({
      name: "Full-Stack Jewellery E-Commerce",
      subtitle: "",
    });
  });
});

describe("techCounts", () => {
  it("counts how many projects use each technology, most used first", () => {
    const counts = techCounts([
      { stack: ["React", "Node"] },
      { stack: ["React", "Python"] },
      { stack: ["Go"] },
    ]);
    expect(counts[0]).toEqual({ tech: "React", count: 2 });
    expect(counts.map((c) => c.tech).sort()).toEqual(["Go", "Node", "Python", "React"]);
  });
});
