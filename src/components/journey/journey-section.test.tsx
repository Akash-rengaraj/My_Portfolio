import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JourneySection } from "./journey-section";

describe("JourneySection", () => {
  it("is a labelled section with the journey heading", () => {
    const { container } = render(<JourneySection />);
    expect(screen.getByRole("heading", { level: 2, name: /my journey/i })).toBeInTheDocument();
    expect(container.querySelector("section#journey")).toHaveAttribute(
      "aria-labelledby",
      "journey-title",
    );
  });

  it("walks the road from school to college to the roles", () => {
    render(<JourneySection />);
    const road = screen.getByRole("list", { name: /journey/i });
    expect(within(road).getByText(/thiruthangal lions/i)).toBeInTheDocument();
    expect(within(road).getByText(/snm matriculation/i)).toBeInTheDocument();
    expect(within(road).getByText(/sri krishna college/i)).toBeInTheDocument();
    expect(within(road).getByText(/google student ambassador/i)).toBeInTheDocument();
    expect(within(road).getByText(/you are here/i)).toBeInTheDocument();
  });

  it("points on to the game in the next section", () => {
    render(<JourneySection />);
    expect(screen.getByRole("link", { name: /games after this/i })).toHaveAttribute(
      "href",
      "#play",
    );
  });
});
