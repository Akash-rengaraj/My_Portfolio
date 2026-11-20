@AGENTS.md

# Portfolio — project rules

Combined developer + personal portfolio. Next.js 16 (App Router, `cacheComponents`), React 19,
TypeScript strict, Tailwind v4, shadcn/ui (radix-nova), pnpm, deployed on Vercel.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm check` — format, lint, typecheck, tests, secret scan (run before every commit)
- `pnpm dlx shadcn@latest add <component>` — add UI primitives into `src/components/ui`

## Layout

- `src/app` — routes, metadata files (`robots.ts`, `sitemap.ts`), error/404 boundaries
- `src/components/ui` — shadcn primitives (generated; edit sparingly)
- `src/config` — `site.ts` (identity/SEO), `security-headers.ts` (CSP + headers)
- `src/env.ts` — zod-validated env; add every new variable here and to `.env.example`
- `src/lib` — framework-agnostic helpers

## Rules

- Pages stay statically rendered. Do not add nonce-based CSP, `headers()`/`cookies()` in shared layouts, or `connection()` without a reason.
- New third-party origin (analytics, embeds, APIs) → add to `extraSources` in `src/config/security-headers.ts`; never widen `default-src` or use wildcards.
- Remote images → explicit hostname in `images.remotePatterns`.
- Secrets live only in server modules that `import "server-only"`; never in `NEXT_PUBLIC_*`.
- Error UIs never render `error.message`.
- New public routes → add to `src/app/sitemap.ts`.
- Use Node from `.nvmrc` (24).
