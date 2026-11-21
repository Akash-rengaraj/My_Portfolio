import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { contact } from "@/config/site";

import { ContactSection } from "./contact-section";

beforeEach(() => localStorage.clear());

describe("ContactSection", () => {
  it("shows the postcard and the direct links", () => {
    render(<ContactSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: /let's build something/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /write me a postcard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      contact.linkedin,
    );
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", contact.github);
  });

  it("won't post an unsigned, empty card", () => {
    render(<ContactSection />);
    fireEvent.click(screen.getByRole("button", { name: /send postcard/i }));
    expect(screen.getByText(/sign it with your name/i)).toBeInTheDocument();
    expect(screen.getByText(/write a little more/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send postcard/i })).toBeEnabled();
  });
});
