/**
 * The investigation wall: where each analysis board sits in the world and
 * what it says. Brief → 5 whys → SWOT → decision.
 */

import type { Point } from "./geometry";
import { EDITOR, PAPER_STAGES } from "./scene-layout";

export type BoardId = "brief" | "whys" | "swot" | "decision";

export interface Board {
  id: BoardId;
  /** Centre in world units. */
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** File name shown in the board's title bar. */
  file: string;
  /** Step tag shown at the right of the title bar. */
  step: string;
}

export const BOARD_ORDER: readonly BoardId[] = ["brief", "whys", "swot", "decision"];

export const BOARDS: Record<BoardId, Board> = {
  brief: {
    id: "brief",
    cx: 3420,
    cy: 400,
    width: 600,
    height: 440,
    file: "problem.md",
    step: "03 · understand",
  },
  whys: {
    id: "whys",
    cx: 4180,
    cy: 400,
    width: 640,
    height: 440,
    file: "five-whys.md",
    step: "04 · root cause",
  },
  swot: {
    id: "swot",
    cx: 4980,
    cy: 400,
    width: 600,
    height: 440,
    file: "swot.md",
    step: "05 · swot",
  },
  decision: {
    id: "decision",
    cx: 4580,
    cy: 1000,
    width: 680,
    height: 460,
    file: "decision.md",
    step: "06 · decision",
  },
};

/** Top-left corner and size of a board. */
export function boardRect(board: Board) {
  return {
    x: board.cx - board.width / 2,
    y: board.cy - board.height / 2,
    width: board.width,
    height: board.height,
  };
}

/** World point at (dx, dy) from a board's top-left corner. */
export function boardPoint(id: BoardId, dx: number, dy: number): Point {
  const { x, y } = boardRect(BOARDS[id]);
  return { x: x + dx, y: y + dy };
}

/* ------------------------------------------------------------------ 03 */

export const BRIEF = {
  /** One symptom per highlighted line of the note (ANALYSED_LINES order). */
  symptoms: ["14 copies of the same orders", "totals never match", "hours of manual checking"],
  affected: ["ops", "sales", "finance", "support"],
  impact: [
    { value: "14", label: "sources of truth" },
    { value: "~6h", label: "lost every week" },
    { value: "0", label: "trust in totals" },
  ],
  doneWhen: "one number everyone trusts",
  /** Layout (board-relative). */
  symptomTop: 110,
  rowHeight: 30,
} as const;

/* ------------------------------------------------------------------ 04 */

export interface Why {
  question: string;
  answer: string;
  root?: boolean;
}

export const WHYS: readonly Why[] = [
  { question: "Why don't the totals match?", answer: "each team edits its own copy" },
  { question: "Why separate copies?", answer: "sheets get emailed, not shared" },
  { question: "Why emailed?", answer: "the tools can't talk to each other" },
  { question: "Why can't they?", answer: "no common order ID or schema" },
  { question: "Why no schema?", answer: "there is no single source of truth", root: true },
];

export const WHY_LAYOUT = { top: 64, rowHeight: 70 } as const;

/* ------------------------------------------------------------------ 05 */

export type SwotKey = "S" | "W" | "O" | "T";

export interface SwotQuadrant {
  key: SwotKey;
  title: string;
  items: readonly string[];
}

export const SWOT: readonly SwotQuadrant[] = [
  { key: "S", title: "strengths", items: ["data already exists", "team knows the process"] },
  { key: "W", title: "weaknesses", items: ["manual entry everywhere", "no IDs, many duplicates"] },
  { key: "O", title: "opportunities", items: ["automate the sync", "one live dashboard for all"] },
  { key: "T", title: "threats", items: ["wrong totals → refunds", "growth will break the sheets"] },
];

/* ------------------------------------------------------------------ 06 */

export interface OptionRow {
  name: string;
  cells: readonly string[];
  /** Weighted score out of 10. */
  score: number;
  chosen?: boolean;
}

export const OPTIONS = {
  columns: ["cost", "build", "risk", "impact"],
  rows: [
    { name: "manual weekly cleanup", cells: ["$", "0 d", "high", "low"], score: 2.4 },
    { name: "buy an ERP", cells: ["$$$$", "90 d", "med", "high"], score: 5.8 },
    {
      name: "sync service + one DB",
      cells: ["$", "10 d", "low", "high"],
      score: 8.9,
      chosen: true,
    },
  ] satisfies OptionRow[],
  complexity: "dedupe: O(n²) → O(n)",
  complexityNote: "hash map on orderId · 50k rows in 1.8 s",
} as const;

/* -------------------------------------------------------------- thread */

/** The thread of reasoning: note → every board → editor. */
export const JOURNEY: readonly Point[] = [
  { x: PAPER_STAGES.unfolded.x, y: PAPER_STAGES.unfolded.y },
  ...BOARD_ORDER.map((id) => ({ x: BOARDS[id].cx, y: BOARDS[id].cy })),
  { x: EDITOR.cx, y: EDITOR.cy },
];
