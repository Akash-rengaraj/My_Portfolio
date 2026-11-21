import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PROJECTS } from "@/content/projects";

import { WorksSection } from "./works-section";

const tiles = () => screen.getAllByRole("button", { name: /^open case study/i });

describe("WorksSection (pinboard)", () => {
  it("has a labelled section with an h2 and the anchor the hero links to", () => {
    const { container } = render(<WorksSection />);
    expect(screen.getByRole("heading", { level: 2, name: /my works/i })).toBeInTheDocument();
    expect(container.querySelector("section#works")).toHaveAttribute(
      "aria-labelledby",
      "works-title",
    );
  });

  it("shows one tile per project, each with its tagline and stack in the page", () => {
    const { container } = render(<WorksSection />);
    expect(tiles()).toHaveLength(PROJECTS.length);
    for (const project of PROJECTS) {
      expect(container.textContent).toContain(project.tagline);
      expect(container.textContent).toContain(project.stack[0]);
    }
  });

  it("opens the full case study in a dialog and closes it with Escape", () => {
    render(<WorksSection />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /open case study: get up/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 3 })).toHaveTextContent(/get up/i);
    expect(within(dialog).getAllByText(/bunk-o-meter/i).length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("link", { name: /source/i })).toHaveAttribute(
      "href",
      PROJECTS.find((p) => p.slug === "get-up")!.links.github,
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("browses to the next and previous project inside the dialog, wrapping around", () => {
    render(<WorksSection />);
    fireEvent.click(tiles()[0]!);
    let dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 3 })).toHaveTextContent(/neo/i);
    fireEvent.click(within(dialog).getByRole("button", { name: /next project/i }));
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 3 })).toHaveTextContent(/get up/i);
    fireEvent.click(within(dialog).getByRole("button", { name: /previous project/i }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /previous project/i }),
    );
    expect(within(screen.getByRole("dialog")).getByRole("heading", { level: 3 })).toHaveTextContent(
      /terminal portfolio/i,
    );
  });

  it("filters the tiles by category", () => {
    render(<WorksSection />);
    const chip = screen.getByRole("button", { name: /^mobile & ar/i });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(tiles()).toHaveLength(PROJECTS.filter((p) => p.category === "Mobile & AR").length);
    fireEvent.click(screen.getByRole("button", { name: /^all/i }));
    expect(tiles()).toHaveLength(PROJECTS.length);
  });

  it("highlights the projects that use a technology and dims the rest", () => {
    const { container } = render(<WorksSection />);
    const chip = screen.getByRole("button", { name: /^react 19/i });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    const dimmed = container.querySelectorAll('[data-dim="true"]');
    const using = PROJECTS.filter((p) => p.stack.includes("React 19")).length;
    expect(dimmed).toHaveLength(PROJECTS.length - using);
    fireEvent.click(chip);
    expect(container.querySelectorAll('[data-dim="true"]')).toHaveLength(0);
  });

  it("summarises the work on sticky notes", () => {
    render(<WorksSection />);
    const stats = screen.getByRole("list", { name: /at a glance/i });
    expect(within(stats).getByText(/projects/i)).toBeInTheDocument();
    expect(within(stats).getByText(/shipped/i)).toBeInTheDocument();
  });

  it("lazy-loads tile previews: no video downloads until hovered", () => {
    const { container } = render(<WorksSection />);
    const videos = container.querySelectorAll("video");
    expect(videos.length).toBe(PROJECTS.length);
    for (const video of videos) {
      expect(video).toHaveAttribute("preload", "none");
      expect(video).toHaveAttribute("poster");
    }
  });
});
