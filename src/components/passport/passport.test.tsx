import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HiddenStamp } from "./hidden-stamp";
import { Passport } from "./passport";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Fill the Passport", () => {
  it("stamps the passport when a hidden stamp is clicked", () => {
    render(
      <>
        <HiddenStamp id="pinboard" />
        <Passport />
      </>,
    );
    expect(screen.getByText(/stuck on a sticky note on the pinboard/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /stamp your passport/i }));
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.queryByRole("button", { name: /stamp your passport/i })).toBeNull();
    expect(screen.getAllByRole("img", { name: /the pinboard stamp/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("1 / 8")).toBeInTheDocument();
  });

  it("keeps the Golden Ticket locked until every page is stamped", () => {
    render(<Passport />);
    expect(screen.getByText(/8 stamps to go/i)).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /golden ticket/i })).toBeNull();
  });

  it("issues a Golden Ticket with the visitor's name once the passport is full", () => {
    localStorage.setItem(
      "passport-stamps",
      "desk,pinboard,workbench,frames,scoreboard,road,afterHours,door",
    );
    render(<Passport />);
    expect(screen.getByRole("article", { name: /golden ticket for you/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/put your name on it/i), {
      target: { value: "Ada" },
    });
    expect(screen.getByRole("article", { name: /golden ticket for ada/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download ticket/i })).toBeInTheDocument();
  });
});
