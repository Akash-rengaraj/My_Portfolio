import { env } from "@/env";

/** Who the portfolio belongs to. Used in the hero, metadata and structured data. */
export const author = {
  name: "Akash Rengaraj",
  /** Short handle shown on the hero's multiplayer cursor. */
  handle: "akash",
  role: "Full-stack developer · AI & Data Science",
  location: "Coimbatore, India",
} as const;

/** How to reach me — the contact section reads from here. */
export const contact = {
  email: "akashrengaraj2007@gmail.com",
  linkedin: "https://www.linkedin.com/in/akash-rengaraj-b45177355",
  github: "https://github.com/Akash-rengaraj",
  x: "https://x.com/akash_020160",
} as const;

/** Public coding profiles, used by the scoreboard section. */
export const profiles = {
  github: { user: "Akash-rengaraj", url: "https://github.com/Akash-rengaraj" },
  leetcode: { user: "Akash_Rengaraj", url: "https://leetcode.com/u/Akash_Rengaraj/" },
} as const;

/**
 * Single source of truth for site-wide identity and SEO defaults.
 */
export const siteConfig = {
  name: author.name,
  description:
    "Full-stack developer who turns messy, real-world problems into working software — React, Next.js, Python and FastAPI.",
  url: env.NEXT_PUBLIC_SITE_URL,
  locale: "en_IN",
} as const;

export type SiteConfig = typeof siteConfig;
