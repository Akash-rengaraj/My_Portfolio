/**
 * Skills for the "My Toolkit" section, grouped by the layer of a system they
 * serve. Edit here to add or change skills — the section renders from this.
 */

export interface SkillDomain {
  id: string;
  /** Short layer name used in the stack diagram. */
  layer: string;
  /** Two-or-three letter tag printed on the Skill Cube's centre sticker. */
  short: string;
  title: string;
  /** What I do with this layer, in one line. */
  summary: string;
  skills: readonly string[];
  /** Accent colour for the tile and its layer bar. */
  hue: string;
}

export const SKILL_DOMAINS: readonly SkillDomain[] = [
  {
    id: "frontend",
    layer: "interface",
    short: "UI",
    title: "Frontend",
    summary: "Fast, accessible interfaces with motion that serves the story.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "GSAP"],
    hue: "#8ab4ff",
  },
  {
    id: "backend",
    layer: "services",
    short: "API",
    title: "Backend & APIs",
    summary: "Typed, validated APIs with proper error handling on every path.",
    skills: ["Python", "FastAPI", "Flask", "Node.js", "Express", "REST APIs"],
    hue: "#4ade80",
  },
  {
    id: "data",
    layer: "data",
    short: "DB",
    title: "Databases",
    summary: "Schemas that model the real problem, not just the screen.",
    skills: ["PostgreSQL", "SQLAlchemy", "MongoDB", "Mongoose"],
    hue: "#f5b84b",
  },
  {
    id: "security",
    layer: "security",
    short: "SEC",
    title: "Security & Auth",
    summary: "Secure by default: auth, validation, headers and secrets done right.",
    skills: [
      "JWT + refresh tokens",
      "Input validation",
      "CSP & security headers",
      "Secret scanning",
    ],
    hue: "#ff5a1f",
  },
  {
    id: "delivery",
    layer: "delivery",
    short: "OPS",
    title: "Cloud & Deploy",
    summary: "From commit to live: CI, previews and one-click deploys.",
    skills: ["Vercel", "Railway", "Render", "GitHub Actions", "Git"],
    hue: "#ff8fb3",
  },
  {
    id: "quality",
    layer: "quality",
    short: "QA",
    title: "Workflow & Quality",
    summary: "Tests, linting and checks that run before every commit.",
    skills: ["Vitest", "Testing Library", "ESLint", "Prettier", "Husky", "pnpm"],
    hue: "#c4b5fd",
  },
];

export interface Language {
  name: string;
  /** What the language is typically used for. */
  traits: readonly string[];
  hue: string;
}

/** Programming languages — the foundation under every layer above. */
export const LANGUAGES: readonly Language[] = [
  { name: "C++", traits: ["compiled", "systems", "DSA"], hue: "#8ab4ff" },
  { name: "Java", traits: ["object-oriented", "JVM", "backend"], hue: "#f5b84b" },
  { name: "Python", traits: ["scripting", "data & AI", "APIs"], hue: "#4ade80" },
];
