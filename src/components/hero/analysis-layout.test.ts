import { describe, expect, it } from "vitest";

import {
  BOARD_ORDER,
  BOARDS,
  BRIEF,
  JOURNEY,
  OPTIONS,
  SWOT,
  WHYS,
  boardRect,
} from "./analysis-layout";
import { ANALYSED_LINES, EDITOR, PAPER_STAGES, SHEET, USERS } from "./scene-layout";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe("investigation content", () => {
  it("lifts one symptom from each highlighted line of the note", () => {
    expect(BRIEF.symptoms).toHaveLength(ANALYSED_LINES.length);
    expect(BRIEF.impact.length).toBeGreaterThanOrEqual(3);
  });

  it("asks why five times and ends on the root cause", () => {
    expect(WHYS).toHaveLength(5);
    expect(WHYS.filter((w) => w.root)).toHaveLength(1);
    expect(WHYS.at(-1)?.root).toBe(true);
  });

  it("fills all four SWOT quadrants", () => {
    expect(SWOT.map((q) => q.key)).toEqual(["S", "W", "O", "T"]);
    for (const quadrant of SWOT) expect(quadrant.items.length).toBeGreaterThanOrEqual(2);
  });

  it("picks exactly one option, the highest-scoring one", () => {
    const chosen = OPTIONS.rows.filter((r) => r.chosen);
    expect(chosen).toHaveLength(1);
    const best = Math.max(...OPTIONS.rows.map((r) => r.score));
    expect(chosen[0]!.score).toBe(best);
    for (const row of OPTIONS.rows) expect(row.cells).toHaveLength(OPTIONS.columns.length);
  });
});

describe("investigation wall layout", () => {
  const paper: Rect = {
    x: PAPER_STAGES.unfolded.x - SHEET.width / 2,
    y: PAPER_STAGES.unfolded.y - SHEET.height / 2,
    width: SHEET.width,
    height: SHEET.height,
  };
  const editor: Rect = {
    x: EDITOR.cx - EDITOR.width / 2,
    y: EDITOR.cy - EDITOR.height / 2,
    width: EDITOR.width,
    height: EDITOR.height,
  };

  it("never overlaps two boards, the note or the editor", () => {
    const rects = [paper, editor, ...BOARD_ORDER.map((id) => boardRect(BOARDS[id]))];
    rects.forEach((a, i) =>
      rects.slice(i + 1).forEach((b) => expect(overlaps(a, b), JSON.stringify([a, b])).toBe(false)),
    );
  });

  it("keeps the users ring clear of every board", () => {
    for (const user of USERS) {
      const node: Rect = { x: user.x - 70, y: user.y - 40, width: 140, height: 120 };
      for (const id of BOARD_ORDER) expect(overlaps(node, boardRect(BOARDS[id]))).toBe(false);
    }
  });

  it("threads the journey from the note through every board to the editor", () => {
    expect(JOURNEY).toHaveLength(BOARD_ORDER.length + 2);
    expect(JOURNEY[0]).toEqual({ x: PAPER_STAGES.unfolded.x, y: PAPER_STAGES.unfolded.y });
    expect(JOURNEY.at(-1)).toEqual({ x: EDITOR.cx, y: EDITOR.cy });
  });
});
