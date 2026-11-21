/**
 * World layout for the hero story: every position, size, copy line and colour
 * the scene and the timeline share. Coordinates are mid-layer (depth 1) world
 * units; the camera decides how much of the world is on screen.
 */

import {
  crumpledOutline,
  sheetOutline,
  toPointsAttr,
  wrinkledOutline,
  type Point,
} from "./geometry";

/**
 * Scene colours. Paper and ink are physical objects and never change; the
 * stage and UI chrome read CSS variables from globals.css so the whole scene
 * follows the light / dark theme (SVG presentation attributes accept var()).
 */
export const PALETTE = {
  stage: "var(--stage)",
  accent: "#ff5a1f",
  accentSoft: "#ff5a1f33",
  highlight: "#ff5a1f40",
  paper: "#f4f0e6",
  paperEdge: "#e3dccb",
  paperShade: "#cfc6b1",
  ink: "#1d2a4a",
  inkSoft: "#1d2a4a66",
  rule: "#8fb0d855",
  margin: "#e2553b88",
  grid: "var(--hero-grid)",
  uiText: "var(--hero-ui-text)",
  uiMuted: "var(--hero-ui-muted)",
  panel: "var(--hero-panel)",
  panelBorder: "var(--hero-panel-border)",
  cool: "var(--cool)",
  ok: "var(--ok)",
  client: "var(--hero-client)",
  warn: "var(--warn)",
  blob: "var(--hero-blob)",
  terminal: "var(--hero-term)",
  tint: "var(--hero-tint)",
  glassEdge: "var(--hero-glass-edge)",
  paperShadow: "var(--hero-paper-shadow)",
  panelShadow: "var(--hero-panel-shadow)",
} as const;

/* ------------------------------------------------------------------ paper */

export const SHEET = { width: 460, height: 580, pointCount: 72 } as const;

const sheetPoints = sheetOutline(SHEET.width, SHEET.height, SHEET.pointCount);

export const PAPER_OUTLINES = {
  sheet: toPointsAttr(sheetPoints),
  ball: toPointsAttr(crumpledOutline(sheetPoints, 62, 7)),
  wrinkled: toPointsAttr(wrinkledOutline(sheetPoints, 5, 11)),
} as const;

export interface PaperPose {
  x: number;
  y: number;
  rot: number;
}

/** Where the paper sits at each stage of the story (world space). */
export const PAPER_STAGES = {
  desk: { x: 800, y: 480, rot: -4 },
  crumpled: { x: 800, y: 470, rot: 28 },
  catch: { x: 2560, y: 430, rot: 28 + 720 },
  unfolded: { x: 2540, y: 480, rot: 3 },
} as const satisfies Record<string, PaperPose>;

/** Arc the ball flies along, desk → over the camera → into the catch. */
export const THROW_PATH: Point[] = [
  { x: 800, y: 470 },
  { x: 1180, y: 170 },
  { x: 1700, y: 70 },
  { x: 2220, y: 190 },
  { x: 2560, y: 430 },
];

/** Paper-space typography for the handwritten problem. */
export const HANDWRITING = {
  x: -170,
  firstBaseline: -120,
  lineHeight: 66,
  fontSize: 40,
} as const;

export const PROBLEM_LINES = [
  "We track every order",
  "in 14 spreadsheets.",
  "Nothing ever matches.",
  "We lose hours. Help?",
] as const;

/** Lines highlighted during the analysis, by index into PROBLEM_LINES. */
export const ANALYSED_LINES = [1, 2, 3] as const;

/** Crease lines visible on the flattened sheet (paper space). */
export const SHEET_CREASES: Point[][] = [
  [
    { x: -230, y: -60 },
    { x: -40, y: -10 },
    { x: 230, y: -90 },
  ],
  [
    { x: -110, y: -290 },
    { x: -60, y: 20 },
    { x: -140, y: 290 },
  ],
  [
    { x: 90, y: -290 },
    { x: 40, y: 60 },
    { x: 120, y: 290 },
  ],
  [
    { x: -230, y: 150 },
    { x: 20, y: 120 },
    { x: 230, y: 190 },
  ],
];

/** Fold lines visible on the crumpled ball (paper space). */
export const BALL_CREASES: Point[][] = [
  [
    { x: -40, y: -30 },
    { x: 5, y: -8 },
    { x: 38, y: -36 },
  ],
  [
    { x: -30, y: 34 },
    { x: 0, y: 6 },
    { x: 18, y: 44 },
  ],
  [
    { x: -50, y: 4 },
    { x: -14, y: 14 },
  ],
  [
    { x: 22, y: -4 },
    { x: 46, y: 18 },
  ],
];

/* ---------------------------------------------------------------- cursors */

/** v1 arrow cursor, tip at (0, 0). */
export const CURSOR_PATH = "M0 0 L0 36 L10 27 L17 42 L24 39 L17 24.5 L29.5 24.5 Z";

export const CLIENT_CURSOR = {
  rest: { x: 1090, y: 700 },
  /** Where the client reappears among the users at the end. */
  return: { x: 5500, y: 880 },
} as const;

export const DEV_CURSOR = {
  enter: { x: 3500, y: 980 },
  catch: { x: 2572, y: 446 },
  aside: { x: 2840, y: 690 },
} as const;

/* ----------------------------------------------------------------- editor */

export const EDITOR = { cx: 6300, cy: 480, width: 700, height: 460 } as const;

export const EDITOR_BOX = {
  x: EDITOR.cx - EDITOR.width / 2,
  y: EDITOR.cy - EDITOR.height / 2,
  titleBar: 40,
  terminalHeight: 128,
  codeX: EDITOR.cx - EDITOR.width / 2 + 56,
  codeTop: EDITOR.cy - EDITOR.height / 2 + 82,
  codeLineHeight: 30,
} as const;

export type CodeTone = "plain" | "muted" | "accent" | "cool" | "ok";

export interface CodeLine {
  segments: readonly { text: string; tone: CodeTone }[];
}

/** The spec, distilled from the decision — typed when the editor opens. */
export const SPEC_LINES: readonly CodeLine[] = [
  { segments: [{ text: "// spec.ts  ← decision.md", tone: "muted" }] },
  {
    segments: [
      { text: "const rootCause = ", tone: "plain" },
      { text: '"no single source of truth"', tone: "accent" },
      { text: ";", tone: "plain" },
    ],
  },
  {
    segments: [
      { text: "const store = { db: ", tone: "plain" },
      { text: '"postgres"', tone: "cool" },
      { text: ", key: ", tone: "plain" },
      { text: '"orderId"', tone: "cool" },
      { text: " };", tone: "plain" },
    ],
  },
  {
    segments: [
      { text: "const dedupe = ", tone: "plain" },
      { text: '"hash map · O(n)"', tone: "cool" },
      { text: ";", tone: "plain" },
    ],
  },
  {
    segments: [
      { text: "const doneWhen = ", tone: "plain" },
      { text: '"one number everyone trusts"', tone: "ok" },
      { text: ";", tone: "plain" },
    ],
  },
  { segments: [{ text: "", tone: "plain" }] },
  {
    segments: [
      { text: "export const plan = { rootCause, store, dedupe, doneWhen };", tone: "plain" },
    ],
  },
];

/** Phrases lifted off the note into the brief's symptoms, in ANALYSED_LINES order. */
export const TOKEN_LABELS = ["14 spreadsheets", "nothing matches", "hours lost"] as const;

export const BUILD_LINES: readonly CodeLine[] = [
  {
    segments: [
      { text: "export async function ", tone: "cool" },
      { text: "syncOrders", tone: "accent" },
      { text: "() {", tone: "plain" },
    ],
  },
  { segments: [{ text: "  const rows = await readAll(sheets);", tone: "plain" }] },
  { segments: [{ text: "  const orders = dedupe(normalize(rows));", tone: "plain" }] },
  { segments: [{ text: "  await db.orders.upsert(orders);", tone: "plain" }] },
  { segments: [{ text: "  return { synced: orders.length };", tone: "plain" }] },
  { segments: [{ text: "}", tone: "plain" }] },
];

export const TERMINAL_LINES = [
  { command: "$ pnpm test", result: "✓ 42 passed" },
  { command: "$ pnpm build", result: "✓ compiled" },
  { command: "$ deploy", result: "✓ live" },
] as const;

/** The shipped product revealed by the deploy wipe (illustrative example). */
export const DASHBOARD = {
  name: "OrderSync",
  stats: [
    { value: "1", label: "source of truth" },
    { value: "0", label: "mismatches" },
    { value: "6h", label: "saved / week" },
  ],
  bars: [0.42, 0.58, 0.5, 0.71, 0.66, 0.84, 0.93],
} as const;

/* ------------------------------------------------------------------ users */

export interface UserNode {
  x: number;
  y: number;
  label: string;
}

const USER_LABELS = [
  "ops",
  "sales",
  "finance",
  "support",
  "warehouse",
  "founders",
  "drivers",
  "you?",
] as const;
const USER_ANGLES = [-152, -112, -68, -28, 28, 68, 112, 152] as const;

export const USERS: readonly UserNode[] = USER_ANGLES.map((deg, index) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: EDITOR.cx + Math.cos(rad) * 780,
    y: EDITOR.cy + Math.sin(rad) * 420,
    label: USER_LABELS[index] ?? "user",
  };
});
