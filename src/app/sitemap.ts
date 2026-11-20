import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** Public routes listed in the sitemap. Add each new page here. */
const routes = ["/"] as const;

/** sitemap.xml generated from `routes`. */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: new URL(route, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
