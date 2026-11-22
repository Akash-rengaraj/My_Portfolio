/**
 * Security headers and CSP. The site is a static export served by Render, so
 * the HTTP headers are declared in `render.yaml` (a test keeps it in sync with
 * `buildHostHeaders` / `buildDocumentHeaders` here) and the CSP is a <meta> tag
 * in the root layout (`buildMetaCsp`) — so it covers pages but never the PDF.
 *
 * The CSP is static (not nonce-based) on purpose: nonces force every page into
 * dynamic rendering and can't work in a static export. The trade-off is
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
export function serializeCsp(policy: Partial<CspPolicy>, isDev: boolean): string {
  const directives = Object.entries(policy).map(
    ([directive, sources]) => `${directive} ${(sources ?? []).join(" ")}`,
  );
  // Upgrading on plain-http localhost breaks the dev server.
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/**
 * CSP for the <meta http-equiv> tag in the root layout. `frame-ancestors` is
 * dropped because browsers ignore it in <meta>; `X-Frame-Options: DENY` from
 * the host covers framing instead.
 */
export function buildMetaCsp(isDev: boolean): string {
  const policy: Partial<CspPolicy> = { ...buildCspPolicy(isDev) };
  delete policy["frame-ancestors"];
  return serializeCsp(policy, isDev);
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
        "autoplay=(self)",
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

/** Headers the static host sends on every path: the full set minus the CSP (that's a <meta> tag). */
export function buildHostHeaders(): Header[] {
  return buildSecurityHeaders(false).filter((header) => header.key !== "Content-Security-Policy");
}

/**
 * Extra headers for the résumé PDF, on top of `buildHostHeaders`: shown inline
 * (view in the browser, download from its toolbar) and revalidated on every
 * request so a replaced file shows up immediately.
 */
export function buildDocumentHeaders(fileName: string): Header[] {
  return [
    { key: "Content-Disposition", value: `inline; filename="${fileName}"` },
    { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
  ];
}
