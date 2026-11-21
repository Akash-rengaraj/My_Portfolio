import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { AfterHoursSection } from "./after-hours-section";

beforeEach(() => localStorage.clear());

describe("AfterHoursSection", () => {
  it("introduces the stamp hunt and shows the passport", () => {
    const { container } = render(<AfterHoursSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: /fill the passport/i }),
    ).toBeInTheDocument();
    expect(container.querySelector("section#play")).not.toBeNull();
    expect(screen.getByRole("list", { name: /^stamps$/i }).children).toHaveLength(8);
  });
});
