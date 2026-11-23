import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ParlourHero } from "./parlour-hero";
import { RECORDS, recordSrc } from "./records";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ParlourHero", () => {
  it("titles the page", () => {
    render(<ParlourHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /coder by day,\s*poet by night\./i,
    );
  });

  it("opens the window onto Paris", () => {
    render(<ParlourHero />);
    const window = screen.getByRole("button", { name: /open the window onto paris/i });
    fireEvent.click(window);
    expect(screen.getByRole("button", { name: /close the window/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("dims the parlour when the cord is pulled", () => {
    render(<ParlourHero />);
    const cord = screen.getByRole("button", { name: /pull the cord to dim the lights/i });
    fireEvent.keyDown(cord, { key: "Enter" });
    expect(screen.getByRole("button", { name: /turn the lights back up/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("hangs a guitar you can strum", () => {
    render(<ParlourHero />);
    expect(screen.getByRole("button", { name: /strum my yamaha f310/i })).toBeInTheDocument();
  });

  it("puts every record on the shelf, and plays one when clicked", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(<ParlourHero />);
    for (const record of RECORDS) {
      expect(
        screen.getByRole("button", { name: `Play ${record.title} by ${record.composer}` }),
      ).toBeInTheDocument();
    }
    const first = RECORDS[0]!;
    fireEvent.click(
      screen.getByRole("button", { name: `Play ${first.title} by ${first.composer}` }),
    );
    expect(play).toHaveBeenCalledOnce();
    expect((play.mock.contexts[0] as HTMLAudioElement).src).toContain(recordSrc(first));
  });
});
