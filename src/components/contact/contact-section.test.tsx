import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contact } from "@/config/site";

import { ContactSection } from "./contact-section";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

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

  it("opens a pre-filled Gmail compose tab when the card is posted", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<ContactSection />);
    fireEvent.change(screen.getByLabelText(/dear akash/i), {
      target: { value: "Would love to chat about an internship." },
    });
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: /send postcard/i }));

    expect(open).toHaveBeenCalledOnce();
    const [href, target] = open.mock.calls[0] ?? [];
    const url = new URL(String(href));
    expect(url.host).toBe("mail.google.com");
    expect(url.searchParams.get("to")).toBe(contact.email);
    expect(target).toBe("_blank");
    expect(screen.getByRole("link", { name: /open gmail/i })).toHaveAttribute("href", String(href));
    expect(screen.getByRole("link", { name: /another email app/i }).getAttribute("href")).toMatch(
      /^mailto:/,
    );
  });
});
