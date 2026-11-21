import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StoryScene } from "./story-scene";

const range = (name: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${name}-${i}`);

const REQUIRED_IDS = [
  "svg",
  "layer-far",
  "layer-mid",
  "layer-near",
  "paper",
  "paper-inner",
  "sheet",
  "sheet-shadow",
  "sheet-content",
  "creases-ball",
  "creases-sheet",
  ...range("line", 4),
  ...range("reveal", 4),
  "highlight-1",
  "highlight-2",
  "highlight-3",
  "scribble",
  "ball-blur",
  "trail-ghosts",
  "tag",
  "client",
  "bubble",
  "dev",
  "dev-trail",
  "you",
  "shock",
  "caught",
  "editor",
  "tab-spec",
  "tab-build",
  "spec",
  ...range("spec-reveal", 7),
  "build",
  ...range("build-reveal", 6),
  "terminal",
  ...range("term", 3),
  "progress",
  "wipe",
  "scan",
  ...range("token", 3),
  ...range("user-line", 8),
  ...range("user-fill", 8),
  "vignette",
  // investigation wall
  ...["brief", "whys", "swot", "decision"].map((b) => `board-${b}`),
  ...range("brief-symptom", 3),
  ...range("brief-chip", 4),
  ...range("brief-impact", 3),
  "brief-done",
  ...range("why", 5),
  "why-root",
  ...range("swot", 4),
  ...range("option", 3),
  ...range("option-bar", 3),
  "option-pick",
  "option-note",
  ...range("thread", 5),
];

describe("StoryScene", () => {
  it("renders a decorative svg hidden from assistive tech", () => {
    const { container } = render(<StoryScene devName="akash" />);
    const svg = container.querySelector('[data-hero="svg"]');
    expect(svg?.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes every node the timeline animates", () => {
    const { container } = render(<StoryScene devName="akash" />);
    const missing = REQUIRED_IDS.filter((id) => !container.querySelector(`[data-hero="${id}"]`));
    expect(missing).toEqual([]);
    expect(container.querySelectorAll("[data-hero-user]")).toHaveLength(8);
    expect(container.querySelectorAll("[data-hero-bar]").length).toBeGreaterThan(0);
  });

  it("uses a real blur primitive for motion blur", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="ball-blur"]')?.tagName).toBe("feGaussianBlur");
  });

  it("labels the developer cursor with the given name and hides the visitor cursor", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="dev"]')?.textContent).toContain("akash");
    expect(container.querySelector('[data-hero="you"]')).toHaveStyle({ opacity: "0" });
  });

  it("keeps the problem text in the sheet", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="line-1"]')?.textContent).toBe(
      "in 14 spreadsheets.",
    );
  });
});

describe("StoryScene · first paint", () => {
  it("starts transparent until the timeline has framed it", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="svg"]')).toHaveStyle({ opacity: "0" });
  });

  it("labels the illustrative product as an example", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="editor"]')?.textContent).toMatch(/example/i);
  });

  it("draws the visitor cursor above the overlays", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="you"]')).toHaveClass("z-30");
  });
});

describe("StoryScene · investigation wall", () => {
  it("starts with every board and board item hidden", () => {
    const { container } = render(<StoryScene devName="akash" />);
    const items = container.querySelectorAll<SVGElement>("[data-hero-item]");
    expect(items.length).toBeGreaterThan(20);
    for (const item of items) expect(item).toHaveStyle({ opacity: "0" });
  });

  it("writes the root cause on the five-whys board", () => {
    const { container } = render(<StoryScene devName="akash" />);
    expect(container.querySelector('[data-hero="why-4"]')?.textContent).toMatch(
      /single source of truth/,
    );
  });
});
