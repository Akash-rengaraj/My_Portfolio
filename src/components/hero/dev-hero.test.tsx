import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { author } from "@/config/site";

import { DevHero } from "./dev-hero";
import { STORY_BEATS, STORY_SUMMARY, VISITOR_CATCH_LINE } from "./story-beats";
import { addOverlayTweens, buildStoryTimeline } from "./story-timeline";

const catchHandler = vi.hoisted(() => ({ current: null as null | (() => void) }));

vi.mock("./use-catch-interaction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./use-catch-interaction")>();
  return {
    ...actual,
    useCatchInteraction: (options: { onCatch: () => void }) => {
      catchHandler.current = options.onCatch;
      return () => undefined;
    },
  };
});

beforeEach(() => {
  catchHandler.current = null;
});

describe("DevHero", () => {
  it("shows the owner's name as the h1 and labels the region with it", () => {
    render(<DevHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(author.name);
    expect(screen.getByRole("region", { name: author.name })).toBeInTheDocument();
  });

  it("keeps a screen-reader summary of the decorative story", () => {
    render(<DevHero />);
    expect(screen.getByText(STORY_SUMMARY)).toHaveClass("sr-only");
  });

  it("renders every beat's caption", () => {
    render(<DevHero />);
    for (const beat of STORY_BEATS) expect(screen.getByText(beat.line)).toBeInTheDocument();
  });

  it("ends with a link on to the works section, and has a hero anchor", () => {
    const { container } = render(<DevHero />);
    expect(screen.getByRole("link", { name: /see my works/i })).toHaveAttribute("href", "#works");
    expect(container.querySelector("section#hero")).not.toBeNull();
  });

  it("keeps the captions clear of the fixed header", () => {
    const { container } = render(<DevHero />);
    const captions = container.querySelector('[data-hero="caption-throw"]')?.parentElement;
    expect(captions?.className).toMatch(/\btop-20\b/);
  });

  it("swaps the catch caption when the visitor catches the ball", () => {
    const { container } = render(<DevHero />);
    act(() => catchHandler.current?.());
    const caption = container.querySelector('[data-hero="caption-catch"]');
    expect(caption).toHaveTextContent(VISITOR_CATCH_LINE);
    expect(screen.getByText(/you caught it/i)).toBeInTheDocument();
  });
});

describe("DevHero · accessibility", () => {
  it("keeps pinch-zoom available on the stage", () => {
    const { container } = render(<DevHero />);
    expect(container.querySelector(".sticky")).not.toHaveClass("touch-pan-y");
  });

  it("keeps the h1 in the accessibility tree after the intro fades", () => {
    const { container } = render(<DevHero />);
    const stage = container.querySelector<HTMLElement>(".sticky")!;
    const story = buildStoryTimeline({
      root: stage,
      layout: "wide",
      viewport: { width: 1600, height: 900 },
    });
    addOverlayTweens(story.timeline, stage);
    story.timeline.progress(0.3);
    const intro = stage.querySelector<HTMLElement>('[data-hero="intro"]')!;
    expect(intro.style.opacity).toBe("0");
    expect(intro.style.visibility).not.toBe("hidden");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    story.timeline.kill();
  });
});

describe("DevHero · pacing", () => {
  it("gives the story about 10 screens of scroll per 100 story units", () => {
    const { container } = render(<DevHero />);
    expect(container.querySelector("section")).toHaveClass("h-[1740svh]");
  });

  it("shows one progress-rail stop per beat", () => {
    const { container } = render(<DevHero />);
    for (const beat of STORY_BEATS) {
      expect(container.querySelector(`[data-hero="rail-${beat.id}"]`)).not.toBeNull();
    }
  });
});
