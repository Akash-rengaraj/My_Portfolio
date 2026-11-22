import type { NextConfig } from "next";

import { RESUME_FILE, RESUME_PATH } from "./src/config/resume";
import { buildDocumentHeaders, buildSecurityHeaders } from "./src/config/security-headers";

/** `Akash_Rengaraj_Resume.pdf` with path-to-regexp specials (and dots) escaped. */
const RESUME_PATTERN = RESUME_FILE.replace(/[.()[\]{}:*+?]/g, "\\$&");

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  typedRoutes: true,
  // Don't advertise the framework in responses.
  poweredByHeader: false,
  // Never ship source maps to the browser in production.
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Add explicit hostnames here when remote images are needed. Never use wildcards.
    remotePatterns: [],
    dangerouslyAllowSVG: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers() {
    return [
      {
        // Every path except the résumé PDF, which gets document headers below.
        source: `/((?!${RESUME_PATTERN}$).*)`,
        headers: buildSecurityHeaders(isDev),
      },
      {
        source: RESUME_PATH,
        headers: buildDocumentHeaders(isDev, RESUME_FILE),
      },
    ];
  },
};

export default nextConfig;
