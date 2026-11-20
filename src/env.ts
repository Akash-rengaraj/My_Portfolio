import { z } from "zod";

/**
 * Validated, typed environment variables.
 *
 * Only `NEXT_PUBLIC_*` values belong here — they are inlined into the client
 * bundle, so never put secrets in them. Server-only secrets go in a separate
 * module that imports `server-only`.
 *
 * `process.env.X` must be referenced literally so Next.js can inline it.
 */

/** http(s) URL with a real domain or localhost — rejects `javascript:`, bare hosts, etc. */
const httpUrl = z.url({
  protocol: /^https?$/,
  hostname: new RegExp(`${z.regexes.domain.source}|^localhost$`),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: httpUrl,
});

/** Resolve the canonical site URL: explicit env → Vercel production domain → localhost. */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
