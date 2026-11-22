import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { RESUME_FILE, RESUME_PATH } from "./resume";
import {
  buildCspPolicy,
  buildDocumentHeaders,
  buildHostHeaders,
  buildMetaCsp,
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

interface HostRule {
  path: string;
  name: string;
  value: string;
}

/** The `headers:` rules from render.yaml (written as path / name / value triples). */
function readRenderHeaders(): HostRule[] {
  const yaml = readFileSync(join(process.cwd(), "render.yaml"), "utf8");
  const unquote = (raw: string) => {
    const value = raw.trim();
    if (value.startsWith('"')) return JSON.parse(value) as string;
    if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
    return value;
  };
  return [...yaml.matchAll(/- path: (\S+)\n\s+name: (\S+)\n\s+value: (.+)/g)].map((m) => ({
    path: m[1] ?? "",
    name: m[2] ?? "",
    value: unquote(m[3] ?? ""),
  }));
}

describe("buildMetaCsp", () => {
  it("is the production CSP minus frame-ancestors (ignored in <meta>)", () => {
    const csp = buildMetaCsp(false);
    expect(csp).not.toContain("frame-ancestors");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });
});

describe("render.yaml (static hosting)", () => {
  const rules = readRenderHeaders();

  it("sends every host security header on every path, matching the code", () => {
    const site = rules.filter((rule) => rule.path === "/*");
    const expected = buildHostHeaders().map((h) => ({ name: h.key, value: h.value }));
    expect(site.map(({ name, value }) => ({ name, value }))).toEqual(expected);
    expect(site.some((rule) => rule.name === "Content-Security-Policy")).toBe(false);
  });

  it("serves the résumé PDF inline, matching the code", () => {
    const pdf = rules.filter((rule) => rule.path === RESUME_PATH);
    const expected = buildDocumentHeaders(RESUME_FILE).map((h) => ({
      name: h.key,
      value: h.value,
    }));
    expect(pdf.map(({ name, value }) => ({ name, value }))).toEqual(expected);
    expect(getHeader(buildDocumentHeaders(RESUME_FILE), "Content-Disposition")).toBe(
      `inline; filename="${RESUME_FILE}"`,
    );
  });
});

describe("next.config", () => {
  it("builds a static export with unoptimized images", () => {
    expect(nextConfig.output).toBe("export");
    expect(nextConfig.images?.unoptimized).toBe(true);
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
