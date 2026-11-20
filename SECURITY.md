# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's
[private vulnerability reporting](../../security/advisories/new) on this repository instead.
You can expect an acknowledgement within 72 hours.

## Measures in place

- Strict HTTP security headers on every route (CSP, HSTS, `X-Frame-Options`,
  `Permissions-Policy`, COOP/CORP) — see `src/config/security-headers.ts`, covered by tests.
- No `X-Powered-By` header and no production browser source maps.
- Validated environment variables (`src/env.ts`); only non-secret `NEXT_PUBLIC_*` values reach the browser.
- Error boundaries never render raw error messages.
- Remote images disabled unless explicitly allow-listed by hostname.
- Supply chain: pnpm blocks dependency install scripts by default, refuses versions younger than
  24h, and CI installs from a frozen lockfile. Dependabot (with cooldown) keeps deps patched.
- Secret scanning: secretlint on every commit (pre-commit hook) and in CI; gitleaks scans git history in CI.
- CodeQL static analysis on every PR and weekly.
