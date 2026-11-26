/**
 * Certifications, from the certificates themselves (issue dates and
 * Coursera / HackerRank / NPTEL verification IDs are read off each PDF). Files live in
 * /public/certificates; previews in /public/certificates/thumbs.
 */

export type Issuer = "Google" | "Meta" | "IBM" | "Atlassian" | "NPTEL" | "HackerRank";

export interface Certificate {
  slug: string;
  title: string;
  issuer: Issuer;
  /** What it's about, for grouping. */
  area:
    "Community" | "Databases" | "Front-end" | "Version control" | "Cybersecurity" | "AI" | "Python";
  /** ISO month the certificate was issued (or the course ended). */
  issued: string;
  /** Shown as-is on the card. */
  issuedLabel: string;
  /** Coursera, HackerRank or NPTEL verification code, when there is one. */
  verifyId?: string;
  /** Extra line under the title (e.g. a score). */
  note?: string;
}

export const ISSUER_LOGOS: Record<Issuer, string> = {
  Google: "/certificates/logos/google.webp",
  Meta: "/certificates/logos/meta.webp",
  IBM: "/certificates/logos/ibm.webp",
  Atlassian: "/certificates/logos/atlassian.webp",
  NPTEL: "/certificates/logos/nptel.webp",
  HackerRank: "/certificates/logos/hackerrank.webp",
};

export const CERTIFICATES: readonly Certificate[] = [
  {
    slug: "google-student-ambassador-semester-1",
    title: "Google Student Ambassador — Semester 1",
    issuer: "Google",
    area: "Community",
    issued: "2026-11",
    issuedLabel: "Nov 2026",
    note: "Certificate of Participation · GSA Program 2026",
  },
  {
    slug: "sql-intermediate",
    title: "SQL (Intermediate)",
    issuer: "HackerRank",
    area: "Databases",
    issued: "2026-11",
    issuedLabel: "Nov 2026",
    verifyId: "004CFE596C72",
    note: "HackerRank skill certification test",
  },
  {
    slug: "sql-basic",
    title: "SQL (Basic)",
    issuer: "HackerRank",
    area: "Databases",
    issued: "2026-11",
    issuedLabel: "Nov 2026",
    verifyId: "6D37259F860F",
    note: "HackerRank skill certification test",
  },
  {
    slug: "applied-accelerated-artificial-intelligence",
    title: "Applied Accelerated Artificial Intelligence",
    issuer: "NPTEL",
    area: "AI",
    issued: "2026-10",
    issuedLabel: "Jul – Oct 2026",
    verifyId: "NOC-F3Q4-DNE2-EC6H6",
    note: "Elite · 12-week course, IIT Guwahati · score 73",
  },
  {
    slug: "reinforcement-learning",
    title: "Reinforcement Learning",
    issuer: "NPTEL",
    area: "AI",
    issued: "2026-10",
    issuedLabel: "Jul – Oct 2026",
    verifyId: "NOC-SS8C-DA6J-PJD16",
    note: "12-week course, IIT Madras · score 55",
  },
  {
    slug: "react-basics",
    title: "React Basics",
    issuer: "Meta",
    area: "Front-end",
    issued: "2026-01",
    issuedLabel: "Jan 2026",
    verifyId: "J4ZPTDWB9ZF1",
  },
  {
    slug: "joy-of-computing-python",
    title: "The Joy of Computing using Python",
    issuer: "NPTEL",
    area: "Python",
    issued: "2025-10",
    issuedLabel: "Jul – Oct 2025",
    note: "12-week course · score 75",
  },
  {
    slug: "html-and-css-in-depth",
    title: "HTML and CSS in depth",
    issuer: "Meta",
    area: "Front-end",
    issued: "2025-05",
    issuedLabel: "May 2025",
    verifyId: "G9L3EDMGLJMH",
  },
  {
    slug: "version-control",
    title: "Version Control",
    issuer: "Meta",
    area: "Version control",
    issued: "2025-04",
    issuedLabel: "Apr 2025",
    verifyId: "HCO69LENYVIO",
  },
  {
    slug: "programming-with-javascript",
    title: "Programming with JavaScript",
    issuer: "Meta",
    area: "Front-end",
    issued: "2025-04",
    issuedLabel: "Apr 2025",
    verifyId: "1GZGV5EJ0O17",
  },
  {
    slug: "connect-and-protect",
    title: "Connect and Protect: Networks and Network Security",
    issuer: "Google",
    area: "Cybersecurity",
    issued: "2025-04",
    issuedLabel: "Apr 2025",
    verifyId: "OX03JQRT3VQC",
  },
  {
    slug: "intro-to-front-end",
    title: "Introduction to Front-End Development",
    issuer: "Meta",
    area: "Front-end",
    issued: "2025-04",
    issuedLabel: "Apr 2025",
    verifyId: "O4NUZ1E0Z734",
  },
  {
    slug: "intro-to-git-and-github",
    title: "Introduction to Git and GitHub",
    issuer: "Google",
    area: "Version control",
    issued: "2025-03",
    issuedLabel: "Mar 2025",
    verifyId: "JZTVMZF9EZUM",
  },
  {
    slug: "version-control-with-git",
    title: "Version Control with Git",
    issuer: "Atlassian",
    area: "Version control",
    issued: "2025-03",
    issuedLabel: "Mar 2025",
    verifyId: "5NB22ACJRCI7",
  },
  {
    slug: "play-it-safe",
    title: "Play It Safe: Manage Security Risks",
    issuer: "Google",
    area: "Cybersecurity",
    issued: "2025-03",
    issuedLabel: "Mar 2025",
    verifyId: "ZXY48ZAWMHWV",
  },
  {
    slug: "intro-to-ai",
    title: "Introduction to Artificial Intelligence (AI)",
    issuer: "IBM",
    area: "AI",
    issued: "2025-03",
    issuedLabel: "Mar 2025",
    verifyId: "3E299O4F7QG2",
  },
  {
    slug: "foundations-of-cybersecurity",
    title: "Foundations of Cybersecurity",
    issuer: "Google",
    area: "Cybersecurity",
    issued: "2025-03",
    issuedLabel: "Mar 2025",
    verifyId: "RR3UF4NH4743",
  },
];

export const pdfFor = (cert: Certificate) => `/certificates/${cert.slug}.pdf`;
export const thumbFor = (cert: Certificate) => `/certificates/thumbs/${cert.slug}.webp`;
/** Where the certificate can be verified: HackerRank, NPTEL or Coursera, by issuer. */
export function verifyUrl(cert: Certificate): string | null {
  if (!cert.verifyId) return null;
  switch (cert.issuer) {
    case "HackerRank":
      return `https://www.hackerrank.com/certificates/${cert.verifyId.toLowerCase()}`;
    case "NPTEL":
      return `https://nptel.ac.in/verify/${cert.verifyId}`;
    default:
      return `https://coursera.org/verify/${cert.verifyId}`;
  }
}

/** Name of the site that hosts the verification page. */
export function verifySite(cert: Certificate): string {
  switch (cert.issuer) {
    case "HackerRank":
      return "hackerrank";
    case "NPTEL":
      return "nptel";
    default:
      return "coursera";
  }
}

/** Issuers in order of how many certificates each gave, with counts. */
export function issuerCounts(certs: readonly Certificate[]): { issuer: Issuer; count: number }[] {
  const counts = new Map<Issuer, number>();
  for (const cert of certs) counts.set(cert.issuer, (counts.get(cert.issuer) ?? 0) + 1);
  return [...counts]
    .map(([issuer, count]) => ({ issuer, count }))
    .sort((a, b) => b.count - a.count || a.issuer.localeCompare(b.issuer));
}

/** Certificates per month, oldest first — for the learning timeline. */
export function byMonth(certs: readonly Certificate[]): { month: string; certs: Certificate[] }[] {
  const map = new Map<string, Certificate[]>();
  for (const cert of certs) map.set(cert.issued, [...(map.get(cert.issued) ?? []), cert]);
  return [...map]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, list]) => ({ month, certs: list }));
}
