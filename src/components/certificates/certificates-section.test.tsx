import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CertificatesSection } from "./certificates-section";

const frames = () => screen.getAllByRole("button", { name: /^view certificate/i });

describe("CertificatesSection", () => {
  it("shows a card for every certificate", () => {
    render(<CertificatesSection />);
    expect(screen.getByRole("heading", { level: 2, name: /certifications/i })).toBeInTheDocument();
    expect(frames()).toHaveLength(17);
  });

  it("opens a certificate with its PDF and verification link", () => {
    render(<CertificatesSection />);
    fireEvent.click(screen.getByRole("button", { name: /view certificate: react basics/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: /open pdf/i })).toHaveAttribute(
      "href",
      "/certificates/react-basics.pdf",
    );
    expect(within(dialog).getByRole("link", { name: /verify on coursera/i })).toHaveAttribute(
      "href",
      "https://coursera.org/verify/J4ZPTDWB9ZF1",
    );
  });
});
