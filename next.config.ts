import type { NextConfig } from "next";

import { buildSecurityHeaders } from "./src/config/security-headers";

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
        source: "/:path*",
        headers: buildSecurityHeaders(isDev),
      },
    ];
  },
};

export default nextConfig;
