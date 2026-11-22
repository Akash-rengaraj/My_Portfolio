import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { RESUME_FILE, RESUME_PATH } from "./resume";
import {
  buildCspPolicy,
  buildDocumentHeaders,
  buildSecurityHeaders,
  serializeCsp,
} from "./security-headers";

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
  /** Header keys Next would send for `pathname`, using Next's own source matcher. */
  async function headerKeysFor(pathname: string): Promise<string[]> {
    const rules = (await nextConfig.headers?.()) ?? [];
    return rules
      .filter((rule) => getPathMatch(rule.source, { strict: true })(pathname) !== false)
      .flatMap((rule) => rule.headers.map((h) => h.key));
  }

  it("applies the security headers to every route", async () => {
    for (const pathname of ["/", "/sitemap.xml", "/_next/static/chunk.js", "/works/x.png"]) {
      const keys = await headerKeysFor(pathname);
      expect(keys).toContain("Content-Security-Policy");
      expect(keys).toContain("X-Frame-Options");
    }
  });

  it("serves the résumé PDF inline with hardening but without the page CSP", async () => {
    const keys = await headerKeysFor(RESUME_PATH);
    expect(keys).not.toContain("Content-Security-Policy");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("X-Frame-Options");

    const headers = buildDocumentHeaders(false, RESUME_FILE);
    expect(getHeader(headers, "Content-Type")).toBe("application/pdf");
    expect(getHeader(headers, "Content-Disposition")).toBe(`inline; filename="${RESUME_FILE}"`);
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
