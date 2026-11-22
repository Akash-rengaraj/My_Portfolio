@AGENTS.md

# Portfolio — project rules

Combined developer + personal portfolio. Next.js 16 (App Router), React 19,
TypeScript strict, Tailwind v4, shadcn/ui (radix-nova), pnpm. Built as a **static export**
(`output: "export"` → `out/`) and hosted as a Render Static Site (`render.yaml`) — no server,
so no cold starts.

## Commands

- `pnpm dev` / `pnpm build` (writes `out/`) / `pnpm start` (serves `out/` locally)
- `pnpm check` — format, lint, typecheck, tests, secret scan (run before every commit)
- `pnpm dlx shadcn@latest add <component>` — add UI primitives into `src/components/ui`

## Layout

- `src/app` — routes, metadata files (`robots.ts`, `sitemap.ts`), error/404 boundaries
- `src/components/ui` — shadcn primitives (generated; edit sparingly)
- `src/config` — `site.ts` (identity/SEO), `security-headers.ts` (CSP + headers), `resume.ts`
- `src/env.ts` — zod-validated env; add every new variable here and to `.env.example`
- `src/lib` — framework-agnostic helpers

## Rules

- Static export only: no server features — no `headers()`/`cookies()`/`connection()`, Server
  Actions, request-reading Route Handlers, `next.config` headers/redirects/rewrites, image
  optimization, or Cache Components/`"use cache"`. Data is fetched at build time; a daily GitHub
  Action (`refresh-stats.yml`) redeploys via the Render deploy hook.
- HTTP headers live in `render.yaml` (a test keeps them equal to `security-headers.ts`); the CSP
  is a `<meta>` tag in the root layout. Change both together. No nonce-based CSP.
- New third-party origin (analytics, embeds, APIs) → add to `extraSources` in `src/config/security-headers.ts`; never widen `default-src` or use wildcards.
- Remote images → explicit hostname in `images.remotePatterns`.
- Secrets live only in server modules that `import "server-only"`; never in `NEXT_PUBLIC_*`.
- Error UIs never render `error.message`.
- New public routes → add to `src/app/sitemap.ts`.
- Use Node from `.nvmrc` (24).
