import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PersonalHero } from "./personal-hero";
import { SCENES, STORY_SUMMARY, STORY_TITLE } from "./scenes";

describe("PersonalHero", () => {
  it("titles the page 'Akash, off the clock'", () => {
    render(<PersonalHero />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
    for (const heading of headings) expect(heading).toHaveTextContent(STORY_TITLE);
  });

  it("tells every scene's line", () => {
    render(<PersonalHero />);
    for (const scene of SCENES) {
      expect(screen.getAllByText(scene.line).length).toBeGreaterThan(0);
    }
  });

  it("keeps a screen-reader summary of the illustrated story", () => {
    render(<PersonalHero />);
    expect(screen.getByText(STORY_SUMMARY)).toHaveClass("sr-only");
  });

  it("lets visitors skip to the end", () => {
    render(<PersonalHero />);
    expect(screen.getByRole("link", { name: /skip to the end/i })).toHaveAttribute(
      "href",
      "#personal-end",
    );
  });
});
