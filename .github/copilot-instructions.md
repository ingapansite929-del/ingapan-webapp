# Copilot Instructions - Ingapan Web App

## Project Overview

Next.js 16 web application for Ingapan, a food distribution company. Features include:
- Public-facing product catalog with carousels
- Authentication system via Supabase
- Role-based access control (admin/client)
- Admin panel for product management
- Portuguese (pt-BR) as primary language

## Build & Development Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint all files
npm run lint
```

**Note:** No test suite is currently configured.

## Architecture

### Authentication & Authorization

**Three-tier Supabase client pattern:**
- `@/lib/supabase/server` - Server Components & Route Handlers (uses cookies)
- `@/lib/supabase/client` - Client Components (browser-based)
- `@/lib/supabase/middleware` - Middleware for session refresh

**Role-based access:**
- Roles stored in `clientes` table: `cliente_ingapan` (default) or `admin_ingapan`
- Admin protection via `requireAdminAccess()` from `@/lib/auth/admin`
- Middleware protects `/admin` and `/cliente` routes (redirects to `/auth/login`)
- Additional admin role check happens server-side in admin pages

**Admin access pattern:**
```typescript
import { requireAdminAccess } from "@/lib/auth/admin";

export default async function AdminPage() {
  const { supabase, userId, adminName } = await requireAdminAccess();
  // Admin-only logic here
}
```

### Directory Structure

```
src/
├── app/               # Next.js App Router
│   ├── auth/         # Login, cadastro (registration), error pages
│   ├── admin/        # Admin panel (requires admin_ingapan role)
│   ├── dashboard/    # Client dashboard (requires authentication)
│   ├── produtos/     # Public product catalog with filters & pagination
│   └── page.tsx      # Public homepage
├── components/        # React components
│   ├── admin/        # Admin-specific components (forms, filters)
│   ├── ProductsFilters.tsx    # Public product search/filter component
│   └── ProductsGrid.tsx       # Public product grid with pagination
├── lib/
│   ├── supabase/     # Three client implementations (server/client/middleware)
│   ├── auth/         # Admin role checking & access control
│   └── constants.ts  # Product categories, contact info, social links
└── types/
    └── index.ts      # TypeScript type definitions
```

### Database Schema

**Main tables:**
- `clientes` - User profile data (linked to auth.users via UUID)
  - Fields: `id`, `nome`, `email`, `cnpj`, `role`, timestamps
  - RLS enabled with role-based policies
- `products` - Product catalog (admin-managed, public read)
  - Fields: `id`, `nome`, `id_categoria`, `descricao`, `image_url`, timestamps
  - Foreign key to `product_categoria` table
  - RLS policies: admins have full CRUD, public/authenticated users have SELECT
- `product_categoria` - Product categories
  - Fields: `id`, `category`
  - Referenced by products via `id_categoria`

See `scripts/*.sql` for full schema definitions and migrations.

## Key Conventions

### Path Aliases
Use `@/*` for imports from `src/`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/types";
```

### Supabase Client Selection
- **Server Components/Actions**: Use `@/lib/supabase/server`
- **Client Components**: Use `@/lib/supabase/client`
- **Never** mix client types or import the wrong one

### Role Checking
Always use `requireAdminAccess()` for admin routes, not manual checks. It:
1. Verifies authentication
2. Checks role from database
3. Redirects unauthorized users automatically
4. Returns typed context (supabase, userId, adminName)

### Image Handling
- Remote images configured via Next.js config (accepts all HTTPS hosts)
- Product category images stored as constants in `@/lib/constants`
- Use Next.js `<Image>` component for optimization

### Styling
- Tailwind CSS 4 via PostCSS
- CSS variables defined in `globals.css`
- Custom fonts: Inter (body), Montserrat (headings)

### File Naming
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Routes: lowercase (e.g., `cadastro/`, `login/`, `produtos/`)
- Server actions: `actions.ts` (e.g., `admin/products/actions.ts`)

### Pagination Pattern
- Public pages use 20 items per page (e.g., `/produtos`)
- Admin pages use 15 items per page (e.g., `/admin/products`)
- Use `.range(from, to)` with Supabase queries
- Fetch PAGE_SIZE + 1 items to determine if next page exists

### Language
- UI text in Portuguese (pt-BR)
- Comments and code in English
- Database roles/enums use Portuguese naming (`admin_ingapan`, `cliente_ingapan`)

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Store in `.env.local` (gitignored).
