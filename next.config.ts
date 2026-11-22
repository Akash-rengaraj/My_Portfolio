import type { NextConfig } from "next";

/**
 * Built as a fully static site (`next build` → `out/`) and served by Render's
 * static hosting / CDN, so there is no server to sleep or cold-start.
 *
 * Static export has no server, so:
 * - HTTP security headers live in `render.yaml` (mirroring
 *   `src/config/security-headers.ts`, kept in sync by a test), and the CSP is a
 *   <meta> tag in the root layout.
 * - Images are served as-is (no on-demand optimization).
 * - No Cache Components / PPR (they need a server). Live stats are fetched at
 *   build time; a scheduled GitHub Action redeploys daily to refresh them
 *   (`.github/workflows/refresh-stats.yml`).
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  typedRoutes: true,
  // Don't advertise the framework in responses.
  poweredByHeader: false,
  // Never ship source maps to the browser in production.
  productionBrowserSourceMaps: false,
  images: {
    // No image-optimization server in a static export.
    unoptimized: true,
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
};

export default nextConfig;
