import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Prerendered to a static file for the static export. */
export const dynamic = "force-static";

/** robots.txt — allow all crawlers and point them at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
