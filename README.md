# Portfolio

Developer + personal portfolio built with Next.js 16, React 19, TypeScript, Tailwind CSS v4 and shadcn/ui.

## Requirements

- Node 24 (`nvm use`)
- pnpm ≥ 10.16

## Getting started

```bash
nvm use
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `pnpm dev`          | Dev server (Turbopack)                             |
| `pnpm build`        | Production build                                   |
| `pnpm start`        | Serve the production build                         |
| `pnpm lint`         | ESLint (zero warnings allowed)                     |
| `pnpm typecheck`    | Generate route types + `tsc --noEmit`              |
| `pnpm format`       | Prettier (with Tailwind class sorting)             |
| `pnpm test`         | Vitest + Testing Library                           |
| `pnpm secrets:scan` | secretlint over the working tree                   |
| `pnpm audit:deps`   | `pnpm audit` on production dependencies            |
| `pnpm check`        | Everything above except build — run before pushing |

Git hooks (Husky): **pre-commit** runs secretlint, Prettier and ESLint on staged files;
**pre-push** runs typecheck and tests.

## Project structure

```
src/
  app/            routes, layout, error + 404 pages, robots.ts, sitemap.ts
  components/ui/  shadcn/ui primitives
  config/         site.ts (identity, SEO), security-headers.ts (CSP + headers)
  lib/            helpers (cn)
  env.ts          validated environment variables
  test/           test setup
```

## Hero assets

The developer hero is a scroll-driven WebGL film built from locally generated photoreal plates.
See [docs/design/2026-11-20-dev-hero.md](./docs/design/2026-11-20-dev-hero.md) for the story,
the pipeline (`tools/hero-studio/`) and how to regenerate plates.

## Security

See [SECURITY.md](./SECURITY.md). Short version: strict CSP and security headers on every route
(tested), validated env, no source maps or `X-Powered-By` in production, pnpm supply-chain
hardening, secret scanning on commit and in CI, CodeQL and Dependabot on GitHub.

## Deployment

Vercel: import the repo, set `NEXT_PUBLIC_SITE_URL` to the production domain, deploy.
