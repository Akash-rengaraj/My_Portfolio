/**
 * Tweens for the investigation wall: understand → root cause → SWOT →
 * decision. Added to the master timeline by `buildStoryTimeline`.
 */

import type { gsap } from "gsap";

import { OPTION_BAR } from "./analysis-boards";
import {
  BRIEF,
  OPTIONS,
  SWOT,
  WHY_LAYOUT,
  WHYS,
  boardPoint,
  type BoardId,
} from "./analysis-layout";
import type { Point } from "./geometry";
import { ANALYSED_LINES } from "./scene-layout";
import { BEAT_AT } from "./story-beats";

export interface WallContext {
  tl: gsap.core.Timeline;
  /** Find a `[data-hero=name]` element or throw a named error. */
  pick: <T extends Element = SVGElement>(name: string) => T;
  /** Tween the camera to a named shot. */
  cameraTo: (shot: string, at: number, duration: number, ease?: string) => void;
  /** The owner's cursor position in the rig. */
  dev: Point;
  /** Where each highlighted line of the unfolded note ends (world space). */
  highlightEnd: (line: number) => Point;
  /** Width of each handwritten problem line. */
  lineWidth: (line: number) => number;
}

const REVEAL = { autoAlpha: 1, y: 0, duration: 1.2, ease: "power2.out" } as const;

/** Add every investigation-wall tween to the master timeline. */
export function addInvestigationTweens(ctx: WallContext): void {
  const { tl, pick, cameraTo, dev } = ctx;

  const reveal = (name: string, at: number, from: gsap.TweenVars = { y: 10 }) => {
    tl.fromTo(pick(name), { autoAlpha: 0, ...from }, { ...REVEAL }, at);
  };
  const pop = (name: string, at: number) => {
    tl.fromTo(
      pick(name),
      { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" },
      { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(2.2)" },
      at,
    );
  };
  const draw = (name: string, at: number, duration = 2.5) => {
    tl.to(pick(name), { strokeDashoffset: 0, duration, ease: "power1.inOut" }, at);
  };
  const board = (id: BoardId, at: number) => {
    tl.fromTo(
      pick(`board-${id}`),
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 2.5, ease: "power2.out" },
      at,
    );
  };
  const point = (at: number, p: Point, duration = 1.4) => {
    tl.to(dev, { x: p.x, y: p.y, duration, ease: "power2.inOut" }, at);
  };

  /* ------------------------------------------------- 03 understand */
  const understand = BEAT_AT.understand;
  cameraTo("understand", understand - 2, 6);
  cameraTo("brief", understand + 8, 5);

  ANALYSED_LINES.forEach((line, i) => {
    const at = understand + 1 + i * 2;
    const end = ctx.highlightEnd(line);
    point(at, { x: end.x + 6, y: end.y + 4 });
    tl.to(
      pick(`highlight-${line}`),
      { attr: { width: ctx.lineWidth(line) + 16 }, duration: 1.4, ease: "power2.out" },
      at + 0.3,
    );
  });
  draw("thread-0", understand + 3, 3);
  board("brief", understand + 4);

  ANALYSED_LINES.forEach((_, i) => {
    const token = pick(`token-${i}`);
    const target = boardPoint("brief", 48, BRIEF.symptomTop + i * BRIEF.rowHeight);
    const flyAt = understand + 8 + i * 1.2;
    tl.to(token, { autoAlpha: 1, duration: 1 }, understand + 2 + i * 2);
    tl.to(
      token,
      { attr: { x: target.x, y: target.y }, duration: 2.5, ease: "power2.inOut" },
      flyAt,
    );
    tl.to(token, { autoAlpha: 0, duration: 0.6 }, flyAt + 2.4);
    reveal(`brief-symptom-${i}`, flyAt + 2.3, { y: 0 });
  });
  point(understand + 11, boardPoint("brief", 330, 250));
  BRIEF.affected.forEach((_, i) => reveal(`brief-chip-${i}`, understand + 13 + i * 0.6));
  BRIEF.impact.forEach((_, i) => pop(`brief-impact-${i}`, understand + 15 + i * 0.8));
  point(understand + 15, boardPoint("brief", 470, 360));
  reveal("brief-done", understand + 18);

  /* ------------------------------------------------- 04 root cause */
  const root = BEAT_AT.rootCause;
  cameraTo("whys", root, 5);
  draw("thread-1", root, 3);
  board("whys", root + 2);
  WHYS.forEach((_, i) => {
    const at = root + 4 + i * 2.4;
    reveal(`why-${i}`, at, { x: -16, y: 0 });
    point(at, boardPoint("whys", 420, WHY_LAYOUT.top + i * WHY_LAYOUT.rowHeight + 46), 1.6);
  });
  pop("why-root", root + 16.4);

  /* ------------------------------------------------------- 05 SWOT */
  const swot = BEAT_AT.swot;
  cameraTo("swot", swot, 5);
  draw("thread-2", swot, 3);
  board("swot", swot + 2);
  SWOT.forEach((_, i) => {
    const at = swot + 5 + i * 2.4;
    tl.fromTo(
      pick(`swot-${i}`),
      { autoAlpha: 0, scale: 0.92, transformOrigin: "50% 50%" },
      { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" },
      at,
    );
    point(at, boardPoint("swot", 160 + (i % 2) * 286, 150 + Math.floor(i / 2) * 188));
  });

  /* --------------------------------------------------- 06 decision */
  const decision = BEAT_AT.decision;
  cameraTo("decision", decision, 5);
  draw("thread-3", decision, 3);
  board("decision", decision + 2);
  OPTIONS.rows.forEach((row, i) => {
    const at = decision + 5 + i * 2;
    reveal(`option-${i}`, at, { x: -16, y: 0 });
    tl.to(
      pick(`option-bar-${i}`),
      {
        attr: { width: (row.score / 10) * OPTION_BAR.maxWidth },
        duration: 1.5,
        ease: "power2.out",
      },
      at + 1,
    );
    point(at, boardPoint("decision", 250, 128 + i * 64));
  });
  pop("option-pick", decision + 13);
  reveal("option-note", decision + 16);
  point(decision + 16, boardPoint("decision", 380, 395));
  // Step back: the whole wall, every decision traced to evidence.
  cameraTo("wall", decision + 20, 6, "power2.inOut");
}
