import type { MetadataRoute } from "next";

import { RESUME_PATH } from "@/config/resume";
import { siteConfig } from "@/config/site";

/** Prerendered to a static file for the static export. */
export const dynamic = "force-static";

/** Public routes listed in the sitemap. Add each new page here. */
const routes = ["/", "/personal", "/shop", RESUME_PATH] as const;

/** sitemap.xml generated from `routes`. */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
