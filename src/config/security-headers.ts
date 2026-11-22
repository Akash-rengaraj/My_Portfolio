/**
 * HTTP security headers applied to every route via `next.config.ts`.
 *
 * The CSP is static (not nonce-based) on purpose: nonces force every page into
 * dynamic rendering and are incompatible with Partial Prerendering /
 * `cacheComponents`. A static policy keeps pages CDN-cacheable. The trade-off is
 * `'unsafe-inline'` for scripts, which Next.js needs for its inline RSC payload
 * scripts. Everything else is locked down to same-origin.
 *
 * To allow a third-party service (analytics, embeds, a form API), add its
 * origin to `extraSources` below — never loosen `default-src`.
 */

type CspDirective =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "font-src"
  | "connect-src"
  | "media-src"
  | "frame-src"
  | "worker-src"
  | "manifest-src"
  | "object-src"
  | "base-uri"
  | "form-action"
  | "frame-ancestors";

type CspPolicy = Record<CspDirective, readonly string[]>;

export interface Header {
  key: string;
  value: string;
}

/** Third-party origins allowed per directive. Keep this list minimal. */
const extraSources: Partial<Record<CspDirective, readonly string[]>> = {};

/** Build the CSP directive map for the given environment. */
export function buildCspPolicy(isDev: boolean): CspPolicy {
  const base: CspPolicy = {
    "default-src": ["'self'"],
    // 'unsafe-eval' is only needed by React's dev-mode debugging tools.
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    // Dev server HMR uses a websocket.
    "connect-src": ["'self'", ...(isDev ? ["ws:", "wss:"] : [])],
    "media-src": ["'self'"],
    "frame-src": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  for (const [directive, sources] of Object.entries(extraSources) as [
    CspDirective,
    readonly string[],
  ][]) {
    const current = base[directive].filter((source) => source !== "'none'");
    base[directive] = [...new Set([...current, ...sources])];
  }

  return base;
}

/** Serialize a CSP directive map into a header value. */
export function serializeCsp(policy: CspPolicy, isDev: boolean): string {
  const directives = Object.entries(policy).map(
    ([directive, sources]) => `${directive} ${sources.join(" ")}`,
  );
  // Upgrading on plain-http localhost breaks the dev server.
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** Full list of security headers for the given environment. */
export function buildSecurityHeaders(isDev: boolean): Header[] {
  const headers: Header[] = [
    { key: "Content-Security-Policy", value: serializeCsp(buildCspPolicy(isDev), isDev) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: [
        "accelerometer=()",
        "autoplay=()",
        "browsing-topics=()",
        "camera=()",
        "display-capture=()",
        "geolocation=()",
        "gyroscope=()",
        "magnetometer=()",
        "microphone=()",
        "payment=()",
        "usb=()",
      ].join(", "),
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "Origin-Agent-Cluster", value: "?1" },
  ];

  if (!isDev) {
    // 2 years. Add `; preload` only after submitting the domain to hstspreload.org.
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}

/**
 * Headers for a static document (the résumé PDF). Same hardening as pages, minus
 * the page CSP — browser PDF viewers can be blocked by `object-src 'none'` /
 * `default-src 'self'`. Served inline (view in the browser, download from its
 * toolbar) and revalidated each request so a replaced file shows up immediately.
 */
export function buildDocumentHeaders(isDev: boolean, fileName: string): Header[] {
  return [
    ...buildSecurityHeaders(isDev).filter((header) => header.key !== "Content-Security-Policy"),
    { key: "Content-Type", value: "application/pdf" },
    { key: "Content-Disposition", value: `inline; filename="${fileName}"` },
    { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
  ];
}
