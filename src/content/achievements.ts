/** Badges and competition results for the scoreboard section. */

export const HACKERRANK_BADGES: readonly string[] = [
  "Python (Basics)",
  "Problem Solving (Basics)",
  "CSS (Basics)",
  "React (Basics)",
];

export interface Hackathon {
  title: string;
  kind: string;
  date: string;
  venue: string;
  result: string;
  project: string;
  team: string;
  highlights: readonly string[];
  photo: { src: string; width: number; height: number; alt: string };
  gallery: readonly { src: string; width: number; height: number; alt: string }[];
}

export const HACKATHONS: readonly Hackathon[] = [
  {
    title: "HackIndia 2025 · Spark 2",
    kind: "Regional hackathon · Web3 & AI",
    date: "Mar 2025",
    venue: "Muthayammal Engineering College, Rasipuram",
    result: "Top 10 Finalist",
    project: "Smart Traffic Management System",
    team: "Team of 4",
    highlights: [
      "Real-time congestion monitoring using AI",
      "Vehicle counting through CCTV analysis",
      "Instant accident detection with SOS alerts",
      "Smart re-routing around blocked roads",
    ],
    photo: {
      src: "/achievements/hackindia-2025-main.webp",
      width: 800,
      height: 452,
      alt: "HackIndia 2025 Spark 2 event banner",
    },
    gallery: [
      {
        src: "/achievements/hackindia-2025-1.webp",
        width: 960,
        height: 1280,
        alt: "HackIndia 2025, photo 1",
      },
      {
        src: "/achievements/hackindia-2025-2.webp",
        width: 1050,
        height: 1400,
        alt: "HackIndia 2025, photo 2",
      },
      {
        src: "/achievements/hackindia-2025-3.webp",
        width: 1280,
        height: 960,
        alt: "HackIndia 2025, photo 3",
      },
    ],
  },
];
