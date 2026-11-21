import { describe, expect, it } from "vitest";

import { byMonth, CERTIFICATES, issuerCounts, pdfFor, thumbFor, verifyUrl } from "./certificates";

describe("certificates", () => {
  it("has twelve certificates with unique slugs", () => {
    expect(CERTIFICATES).toHaveLength(12);
    expect(new Set(CERTIFICATES.map((c) => c.slug)).size).toBe(12);
  });

  it("points at the PDF and preview for each certificate", () => {
    const cert = CERTIFICATES[0]!;
    expect(pdfFor(cert)).toBe(`/certificates/${cert.slug}.pdf`);
    expect(thumbFor(cert)).toBe(`/certificates/thumbs/${cert.slug}.webp`);
  });

  it("links Coursera certificates to their verification page", () => {
    const react = CERTIFICATES.find((c) => c.slug === "react-basics")!;
    expect(verifyUrl(react)).toBe("https://coursera.org/verify/J4ZPTDWB9ZF1");
    const nptel = CERTIFICATES.find((c) => c.issuer === "NPTEL")!;
    expect(verifyUrl(nptel)).toBeNull();
  });

  it("counts issuers, most first", () => {
    const counts = issuerCounts(CERTIFICATES);
    expect(counts[0]).toEqual({ issuer: "Meta", count: 5 });
    expect(counts.reduce((sum, c) => sum + c.count, 0)).toBe(12);
  });

  it("groups by month, oldest first", () => {
    const months = byMonth(CERTIFICATES).map((m) => m.month);
    expect(months[0]).toBe("2025-03");
    expect(months.at(-1)).toBe("2026-01");
    expect([...months].sort()).toEqual(months);
  });
});
