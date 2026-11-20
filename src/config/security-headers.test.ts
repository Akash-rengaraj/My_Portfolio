import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { buildCspPolicy, buildSecurityHeaders, serializeCsp } from "./security-headers";

/** Look up a header value by name, failing the test if it is missing. */
function getHeader(headers: { key: string; value: string }[], key: string): string {
  const header = headers.find((h) => h.key === key);
  if (!header) throw new Error(`Missing header: ${key}`);
  return header.value;
}

describe("buildSecurityHeaders (production)", () => {
  const headers = buildSecurityHeaders(false);
  const csp = getHeader(headers, "Content-Security-Policy");

  it("blocks framing, plugins and base-tag hijacking", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(getHeader(headers, "X-Frame-Options")).toBe("DENY");
  });

  it("restricts default-src to same origin and upgrades insecure requests", () => {
    expect(csp).toMatch(/default-src 'self';/);
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("never allows eval or websockets in production", () => {
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("ws:");
  });

  it("does not allow wildcard sources anywhere", () => {
    expect(csp).not.toMatch(/(^|\s)\*(\s|;|$)/);
    expect(csp).not.toMatch(/(^|\s)https:(\s|;|$)/);
  });

  it("sets HSTS, nosniff, referrer and isolation headers", () => {
    expect(getHeader(headers, "Strict-Transport-Security")).toMatch(/max-age=\d{8}/);
    expect(getHeader(headers, "X-Content-Type-Options")).toBe("nosniff");
    expect(getHeader(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(getHeader(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(getHeader(headers, "Permissions-Policy")).toContain("camera=()");
  });
});

describe("buildSecurityHeaders (development)", () => {
  const headers = buildSecurityHeaders(true);
  const csp = getHeader(headers, "Content-Security-Policy");

  it("allows eval and HMR websockets for the dev server only", () => {
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws:");
  });

  it("skips HSTS and upgrade-insecure-requests on plain-http localhost", () => {
    expect(headers.some((h) => h.key === "Strict-Transport-Security")).toBe(false);
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});

describe("serializeCsp", () => {
  it("joins every directive with a semicolon", () => {
    const policy = buildCspPolicy(false);
    const serialized = serializeCsp(policy, false);
    for (const directive of Object.keys(policy)) {
      expect(serialized).toContain(`${directive} `);
    }
    expect(serialized).not.toContain("\n");
  });
});

describe("next.config", () => {
  it("applies the security headers to every route", async () => {
    const rules = await nextConfig.headers?.();
    expect(rules).toBeDefined();
    const catchAll = rules?.find((rule) => rule.source === "/:path*");
    expect(catchAll?.headers.map((h) => h.key)).toContain("Content-Security-Policy");
  });

  it("hides the X-Powered-By header and disables browser source maps", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(nextConfig.productionBrowserSourceMaps).toBe(false);
  });

  it("does not allow arbitrary remote images or SVG optimisation", () => {
    expect(nextConfig.images?.remotePatterns).toEqual([]);
    expect(nextConfig.images?.dangerouslyAllowSVG).toBe(false);
  });
});
