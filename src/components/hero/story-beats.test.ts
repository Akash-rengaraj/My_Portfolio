import { describe, expect, it } from "vitest";

import { ANALYSED_LINES, PAPER_OUTLINES, PROBLEM_LINES, SHEET, USERS } from "./scene-layout";
import { CATCH_WINDOW, STORY_BEATS, STORY_DURATION, TIME_WARPS } from "./story-beats";

describe("STORY_BEATS", () => {
  it("tells the full process in order: catch, analyse, decide, build, ship", () => {
    expect(STORY_BEATS.map((b) => b.id)).toEqual([
      "throw",
      "catch",
      "understand",
      "root-cause",
      "swot",
      "decision",
      "build",
      "ship",
    ]);
  });

  it("numbers the beats sequentially as 01–08", () => {
    expect(STORY_BEATS.map((b) => b.index)).toEqual(
      Array.from({ length: 8 }, (_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  it("keeps windows ordered, non-overlapping and inside 0–1, after an intro", () => {
    expect(STORY_BEATS[0]!.start).toBeGreaterThanOrEqual(0.05);
    STORY_BEATS.forEach((beat, i) => {
      expect(beat.start).toBeLessThan(beat.end);
      expect(beat.end).toBeLessThanOrEqual(1);
      const next = STORY_BEATS[i + 1];
      if (next) expect(beat.end).toBeLessThanOrEqual(next.start);
    });
  });

  it("gives the analysis chapters more than a third of the story", () => {
    const analysis = STORY_BEATS.filter((b) =>
      ["understand", "root-cause", "swot", "decision"].includes(b.id),
    );
    const share = analysis.reduce((sum, b) => sum + (b.end - b.start), 0);
    expect(share).toBeGreaterThan(1 / 3);
  });

  it("runs on a 174-unit timeline", () => {
    expect(STORY_DURATION).toBe(174);
  });
});

describe("catch timing", () => {
  it("ends the interactive window exactly when the catch beat starts", () => {
    const catchBeat = STORY_BEATS.find((b) => b.id === "catch")!;
    expect(CATCH_WINDOW[0]).toBeLessThan(CATCH_WINDOW[1]);
    expect(CATCH_WINDOW[1]).toBe(catchBeat.start);
  });

  it("slows time around the catch", () => {
    const catchBeat = STORY_BEATS.find((b) => b.id === "catch")!;
    expect(TIME_WARPS.some((w) => w.at === catchBeat.start && w.speed < 1)).toBe(true);
  });
});

describe("scene layout", () => {
  it("highlights only lines that exist", () => {
    for (const index of ANALYSED_LINES) expect(PROBLEM_LINES[index]).toBeDefined();
  });

  it("gives every paper outline the same point count so they can morph", () => {
    for (const outline of Object.values(PAPER_OUTLINES)) {
      expect(outline.split(" ")).toHaveLength(SHEET.pointCount);
    }
  });

  it("has the eight user nodes", () => {
    expect(USERS.map((u) => u.label)).toEqual([
      "ops",
      "sales",
      "finance",
      "support",
      "warehouse",
      "founders",
      "drivers",
      "you?",
    ]);
  });
});
