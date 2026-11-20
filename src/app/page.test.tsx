import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the site name as the only h1", () => {
    render(<HomePage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(siteConfig.name);
  });
});
