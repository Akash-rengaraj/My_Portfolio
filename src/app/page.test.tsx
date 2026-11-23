import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { siteConfig } from "@/config/site";

import HomePage from "./page";

// The scoreboard is an async server component that fetches live stats; it has
// its own tests, so the page test renders without it.
vi.mock("@/components/stats/stats-section", () => ({ StatsSection: () => null }));
// The shop door walks in with the app router, which isn't mounted in tests.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

describe("HomePage", () => {
  it("renders the site name as the only h1", () => {
    render(<HomePage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(siteConfig.name);
  });

  it("has no placeholder work section", () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector("#work")).toBeNull();
  });

  it("gives the skip link a target", () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector("main#main")).not.toBeNull();
  });
});
