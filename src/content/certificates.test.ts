import { describe, expect, it } from "vitest";

import { byMonth, CERTIFICATES, issuerCounts, pdfFor, thumbFor, verifyUrl } from "./certificates";

describe("certificates", () => {
  it("has seventeen certificates with unique slugs, GSA first", () => {
    expect(CERTIFICATES).toHaveLength(17);
    expect(new Set(CERTIFICATES.map((c) => c.slug)).size).toBe(17);
    expect(CERTIFICATES[0]!.slug).toBe("google-student-ambassador-semester-1");
  });

  it("points at the PDF and preview for each certificate", () => {
    const cert = CERTIFICATES[0]!;
    expect(pdfFor(cert)).toBe(`/certificates/${cert.slug}.pdf`);
    expect(thumbFor(cert)).toBe(`/certificates/thumbs/${cert.slug}.webp`);
  });

  it("links Coursera certificates to their verification page", () => {
    const react = CERTIFICATES.find((c) => c.slug === "react-basics")!;
    expect(verifyUrl(react)).toBe("https://coursera.org/verify/J4ZPTDWB9ZF1");
    const joy = CERTIFICATES.find((c) => c.slug === "joy-of-computing-python")!;
    expect(verifyUrl(joy)).toBeNull();
  });

  it("links NPTEL certificates to their verification page", () => {
    const rl = CERTIFICATES.find((c) => c.slug === "reinforcement-learning")!;
    expect(verifyUrl(rl)).toBe("https://nptel.ac.in/verify/NOC-SS8C-DA6J-PJD16");
  });

  it("links HackerRank certificates to their verification page", () => {
    const sql = CERTIFICATES.find((c) => c.slug === "sql-basic")!;
    expect(verifyUrl(sql)).toBe("https://www.hackerrank.com/certificates/6d37259f860f");
  });

  it("counts issuers, most first", () => {
    const counts = issuerCounts(CERTIFICATES);
    expect(counts.slice(0, 2)).toEqual([
      { issuer: "Google", count: 5 },
      { issuer: "Meta", count: 5 },
    ]);
    expect(counts.reduce((sum, c) => sum + c.count, 0)).toBe(17);
  });

  it("groups by month, oldest first", () => {
    const months = byMonth(CERTIFICATES).map((m) => m.month);
    expect(months[0]).toBe("2025-03");
    expect(months.at(-1)).toBe("2026-11");
    expect([...months].sort()).toEqual(months);
  });
});
