import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { author } from "@/config/site";
import { SECTIONS } from "@/content/sections";

import { SiteHeader } from "./site-header";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    fireEvent.scroll(window);
  });
}

afterEach(() => scrollTo(0));

describe("SiteHeader", () => {
  it("links the brand home, named after the owner", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: author.name })).toHaveAttribute("href", "/");
  });

  it("offers a skip link to the main content", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
  });

  it("marks the developer portfolio as the current view", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: /portfolio/i });
    const developer = screen.getByRole("link", { name: /developer/i });
    expect(nav).toContainElement(developer);
    expect(developer).toHaveAttribute("aria-current", "page");
    expect(developer).toHaveAttribute("href", "/");
  });

  it("shows the personal portfolio switch as coming soon", () => {
    render(<SiteHeader />);
    const personal = screen.getByRole("button", { name: /personal/i });
    expect(personal).toHaveAttribute("aria-disabled", "true");
    expect(personal).toHaveTextContent(/soon/i);
  });

  it("links to every section of the page", () => {
    render(<SiteHeader />);
    const sections = screen.getAllByRole("navigation", { name: /sections/i })[0]!;
    for (const section of SECTIONS) {
      expect(within(sections).getByRole("link", { name: section.label })).toHaveAttribute(
        "href",
        `#${section.id}`,
      );
    }
  });

  it("stays on screen while scrolling, gaining a background once scrolled", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header")!;
    expect(header).toHaveAttribute("data-scrolled", "false");
    scrollTo(800);
    expect(header).toHaveAttribute("data-scrolled", "true");
    expect(header).not.toHaveAttribute("data-hidden");
  });

  it("opens and closes the sections menu on small screens", () => {
    render(<SiteHeader />);
    const button = screen.getByRole("button", { name: /open sections menu/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("navigation", { name: /sections/i })).toHaveLength(2);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("button", { name: /open sections menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps the theme toggle in the bar", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("switch", { name: /dark mode/i })).toBeInTheDocument();
  });
});
