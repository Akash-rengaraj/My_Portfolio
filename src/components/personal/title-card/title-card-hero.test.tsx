import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TITLE, TitleCardHero } from "./title-card-hero";

beforeEach(() => {
  // jsdom has no canvas; the spark field copes with a missing context.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TitleCardHero", () => {
  it("names the page in its h1", () => {
    render(<TitleCardHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(TITLE);
  });

  it("lists the roles for screen readers", () => {
    render(<TitleCardHero />);
    expect(screen.getByText("Coder, rider, gamer, guitarist, poet and baker.")).toHaveClass(
      "sr-only",
    );
  });

  it("offers the developer side and a way to say hi", () => {
    render(<TitleCardHero />);
    expect(screen.getByRole("link", { name: /the developer side/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /say hi/i })).toHaveAttribute("href", "/#contact");
  });

  it("starts with the sound off", () => {
    render(<TitleCardHero />);
    expect(screen.getByRole("button", { name: /sound off/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
