import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HiddenBug } from "./hidden-bug";
import { SpecimenCase } from "./specimen-case";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Catch the Bugs", () => {
  it("catches a bug and pins it in the specimen case", () => {
    render(
      <>
        <HiddenBug id="works" />
        <SpecimenCase />
      </>,
    );
    expect(screen.queryByText(/offbyonus erroris/i)).toBeNull();
    expect(screen.getByText(/stuck to a sticky note on the pinboard/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /catch it/i }));
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.queryByRole("button", { name: /catch it/i })).toBeNull();
    expect(screen.getByText(/offbyonus erroris/i)).toBeInTheDocument();
    expect(screen.getByText(/specimen collection · 1\/5/i)).toBeInTheDocument();
  });

  it("keeps Dev Mode locked until every bug is caught", () => {
    render(<SpecimenCase />);
    expect(screen.getByText(/locked · 5 still loose/i)).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: /dev mode/i })).toBeNull();
  });

  it("unlocks Dev Mode once all five are caught", () => {
    localStorage.setItem("caught-bugs", "hero,works,toolkit,journey,footer");
    render(<SpecimenCase />);
    expect(screen.getByText(/dev mode unlocked/i)).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});
