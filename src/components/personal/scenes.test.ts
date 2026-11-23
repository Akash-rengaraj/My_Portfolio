import { describe, expect, it } from "vitest";

import { SCENES, sceneAt, sceneWindow, STORY_SUMMARY } from "./scenes";

describe("personal story scenes", () => {
  it("tells the six scenes in order, with their lines", () => {
    expect(SCENES.map((s) => [s.id, s.line])).toEqual([
      ["code", "I build things"],
      ["game", "I play everything"],
      ["ride", "I love travelling"],
      ["guitar", "I make music"],
      ["poem", "I write"],
      ["bake", "and I bake (and eat) everything"],
    ]);
  });

  it("splits the story into contiguous windows covering 0–1", () => {
    expect(sceneWindow(0).start).toBe(0);
    expect(sceneWindow(SCENES.length - 1).end).toBe(1);
    for (let i = 1; i < SCENES.length; i++) {
      expect(sceneWindow(i).start).toBe(sceneWindow(i - 1).end);
    }
  });

  it("finds the scene for any progress, clamped to the story", () => {
    expect(sceneAt(0)).toBe(0);
    expect(sceneAt(0.5)).toBe(3);
    expect(sceneAt(1)).toBe(5);
    expect(sceneAt(-1)).toBe(0);
    expect(sceneAt(2)).toBe(5);
  });

  it("summarises every scene for screen readers", () => {
    for (const scene of SCENES) expect(STORY_SUMMARY).toContain(scene.line);
  });
});
