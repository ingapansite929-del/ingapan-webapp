# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 16 (App Router) web app for **Ingapan**, a food distribution company. React 19, TypeScript (strict), Tailwind CSS 4, Supabase (auth + Postgres). UI text is Portuguese (pt-BR); code and comments in English; database roles/enums use Portuguese naming (`admin_ingapan`, `cliente_ingapan`).

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm start       # serve production build
npm run lint    # eslint (eslint-config-next)
```

No test suite is configured. There is no typecheck script — `npm run build` is the type-safety gate.

## Environment

Required in `.env.local` (gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Architecture

### Supabase — three clients, never mixed

- `@/lib/supabase/server` — Server Components, Route Handlers, Server Actions (cookie-based).
- `@/lib/supabase/client` — Client Components (browser).
- `@/lib/supabase/middleware` — session refresh in `middleware.ts`.

Import the right one for the context; do not import a browser client into server code or vice versa.

### Auth & authorization

- User profiles live in the `clientes` table (linked to `auth.users` by UUID), with a `role` of `cliente_ingapan` (default) or `admin_ingapan`.
- `middleware.ts` refreshes the session on every non-asset request.
- Admin pages/actions must call `requireAdminAccess()` from `@/lib/auth/admin` rather than checking roles by hand. It verifies auth, reads the role from the DB, redirects unauthorized users, and returns `{ supabase, userId, adminName }`. Use `isAdminRole()` / `ADMIN_ROLE` from the same module for non-redirecting checks.

### Data-access layer: `src/features/`

Domain data logic is separated from UI. Each domain (`products`, `clients`, `orders`) has:
- `types.ts` — record shapes (e.g. `ProductRecord`).
- `data.ts` — Supabase query functions, wrapped in React `cache()` for per-request dedup; they build a shared `SELECT` string and throw `Error` on Supabase errors.
- `metrics.ts` (products) — aggregation/stats queries.

Prefer adding read queries here over inlining Supabase calls in components. Mutations for the admin panel live in colocated `actions.ts` Server Actions (e.g. `src/app/admin/products/actions.ts`), which validate `FormData` and call `revalidatePath()`.

### Routes (`src/app/`)

- `page.tsx` — public homepage. `produtos/` + `produtos/[id]/` — public catalog with filters/pagination. `auth/` — login, cadastro, error. `dashboard/` — authenticated client area. `admin/` — admin panel (products, clientes), gated by `admin_ingapan`. `api/track-view/` — Route Handler for product view tracking.
- `robots.ts`, `sitemap.ts`, and `@/lib/seo.ts` drive SEO metadata — update `seo.ts` when adding indexable routes.

### Cart

`@/lib/CartContext.tsx` is a client-side React Context provider for cart state — consume it via its hook in Client Components rather than duplicating cart logic.

## Conventions

- **Path alias:** `@/*` → `src/*`.
- **Pagination:** fetch `PAGE_SIZE + 1` with `.range(from, to)` to detect a next page. Public pages use 20/page; admin pages 15/page.
- **Images:** `next.config.ts` sets `images.unoptimized: true`; remote patterns allow `*.supabase.co` and `images.unsplash.com`. Still use the Next.js `<Image>` component. Category images are constants in `@/lib/constants`.
- **Styling:** Tailwind 4 via PostCSS; CSS variables in `src/app/globals.css`; fonts Inter (body) / Montserrat (headings).
- **Naming:** components `PascalCase.tsx`; route folders lowercase; Server Actions in `actions.ts`.

## Database schema (`scripts/*.sql`)

SQL migrations are numbered and applied manually in the Supabase dashboard, then committed. Per `scripts/README.md`, the intended source of truth is the latest `*_current_schema_snapshot.sql`; older numbered files are historical and do not reflect the live DB. Note: the newest committed snapshot is `009_current_schema_snapshot.sql`, but later deltas exist (through `011_product_subcategory_table.sql`) — verify against the live Supabase schema when in doubt. When changing the schema: apply in Supabase, commit an incremental delta file, then refresh the snapshot.
