import { env } from "@/env";

/**
 * Single source of truth for site-wide identity and SEO defaults.
 * Fill `name`, `description` and `links` once the content plan is final.
 */
export const siteConfig = {
  name: "Portfolio",
  description: "Developer and personal portfolio.",
  url: env.NEXT_PUBLIC_SITE_URL,
  locale: "en_IN",
} as const;

export type SiteConfig = typeof siteConfig;
