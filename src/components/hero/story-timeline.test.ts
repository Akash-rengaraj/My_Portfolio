import { render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { STORY_DURATION } from "./story-beats";
import { StoryScene } from "./story-scene";
import { buildStoryTimeline, type StoryController } from "./story-timeline";

const WIDE = { width: 1600, height: 900 };

let story: StoryController | null = null;

afterEach(() => {
  story?.timeline.kill();
  story = null;
});

function mountScene(): HTMLElement {
  const { container } = render(createElement(StoryScene, { devName: "akash" }));
  return container;
}

const attr = (root: HTMLElement, id: string, name = "transform") =>
  root.querySelector(`[data-hero="${id}"]`)?.getAttribute(name);

describe("buildStoryTimeline", () => {
  it("builds a full-length timeline for both layouts", () => {
    for (const layout of ["wide", "narrow"] as const) {
      const built = buildStoryTimeline({ root: mountScene(), layout, viewport: WIDE });
      expect(built.timeline.duration()).toBeCloseTo(STORY_DURATION);
      built.timeline.kill();
    }
  });

  it("restores the opening frame exactly after jumping to the end and back", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    const ids = ["layer-far", "layer-mid", "layer-near", "paper", "paper-inner", "client"];
    const before = ids.map((id) => attr(root, id));
    const sheetBefore = attr(root, "sheet", "points");

    story.timeline.progress(1);
    expect(attr(root, "layer-mid")).not.toBe(before[1]);

    story.timeline.progress(0);
    expect(ids.map((id) => attr(root, id))).toEqual(before);
    expect(attr(root, "sheet", "points")).toBe(sheetBefore);
  });

  it("moves the ball on screen while it is in flight", () => {
    story = buildStoryTimeline({ root: mountScene(), layout: "wide", viewport: WIDE });
    story.timeline.progress(0.1);
    const early = story.ballScreen();
    story.timeline.progress(0.13);
    const later = story.ballScreen();
    expect(later.x).not.toBeCloseTo(early.x, 0);
  });

  it("blurs the ball mid-flight and not at rest", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    const blur = () => Number(attr(root, "ball-blur", "stdDeviation")?.split(" ")[0] ?? 0);
    story.timeline.progress(0.115);
    expect(blur()).toBeGreaterThan(2);
    story.timeline.progress(0.5);
    expect(blur()).toBe(0);
  });

  it("reframes when the viewport changes", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    const before = attr(root, "layer-mid");
    story.setViewport({ width: 900, height: 900 });
    expect(attr(root, "layer-mid")).not.toBe(before);
    expect(attr(root, "svg", "viewBox")).not.toBe("0 0 1500.00 843.75");
  });

  it("names the missing element when the scene is incomplete", () => {
    const root = mountScene();
    root.querySelector('[data-hero="tag"]')?.remove();
    expect(() => buildStoryTimeline({ root, layout: "wide", viewport: WIDE })).toThrow(
      'Hero story: missing element [data-hero="tag"]',
    );
  });
});

describe("first frame", () => {
  it("reveals the scene once it is framed", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "narrow", viewport: { width: 390, height: 844 } });
    expect(root.querySelector<SVGSVGElement>('[data-hero="svg"]')?.style.opacity).toBe("1");
  });
});

describe("investigation wall", () => {
  it("reveals every board item by the end and hides them again at the start", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    const items = Array.from(root.querySelectorAll<SVGElement>("[data-hero-item]"));
    story.timeline.progress(1);
    expect(items.filter((el) => el.style.opacity !== "1").map((el) => el.dataset.hero)).toEqual([]);
    story.timeline.progress(0);
    expect(items.filter((el) => el.style.opacity !== "0").map((el) => el.dataset.hero)).toEqual([]);
  });

  it("draws the thread of reasoning all the way to the editor", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    story.timeline.progress(1);
    const threads = Array.from(root.querySelectorAll<SVGPathElement>('[data-hero^="thread-"]'));
    expect(threads.length).toBe(5);
    for (const thread of threads) expect(Number(thread.style.strokeDashoffset)).toBe(0);
  });

  it("scores the options: the chosen bar is the longest", () => {
    const root = mountScene();
    story = buildStoryTimeline({ root, layout: "wide", viewport: WIDE });
    story.timeline.progress(1);
    const widths = [0, 1, 2].map((i) =>
      Number(root.querySelector(`[data-hero="option-bar-${i}"]`)?.getAttribute("width")),
    );
    expect(Math.max(...widths)).toBe(widths[2]);
    expect(widths[2]).toBeGreaterThan(0);
  });
});
