# Backend (`apps/backend`)

> Context for AI agents in the Medusa application. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`. Update this file and the package README if setup/run changes.

## Overview

Medusa v2 commerce engine for the chassis. Config: `medusa-config.ts`. Default seed markets: `src/lib/markets.ts` (UK / EU / US regions for seed).

## Architecture and flow

- Framework: `@medusajs/framework` / `@medusajs/medusa`
- Persistence: PostgreSQL via Medusa modules (not Prisma/Drizzle as primary)
- Extension model: custom modules, module links, workflows, API routes, subscribers, jobs, admin UI extensions
- Entry: `medusa develop` / `medusa start` with Admin at `/app`

## Data model (ER)

Full diagram and field detail: `apps/backend/docs/ER_MODEL.md`.

- Store: PostgreSQL
- Layer: Medusa module data models and migrations
- Custom modules with owned models: **Brand** (`src/modules/brand`) — product taxonomy via `product-brand` link; see `docs/ER_MODEL.md`. Not the white-label client brand in `docs/plan.md`.
- Planned extensions (see `docs/features/`): vendors and vendor users, consignments, commission and payout ledger

## Core technologies

- **Medusa v2**: `medusa-config.ts`, commerce modules
- **PostgreSQL / Redis**: via root Docker Compose and env URLs
- **TypeScript**: package `tsconfig.json`

## Module / directory breakdown (`src/`)

- `api/`: file-based routes (`api/store/*`, `api/admin/*`) exporting HTTP verbs. Medusa loads **only** root `api/middlewares.ts` — keep it a thin composer that spreads feature `MiddlewareRoute[]` exports. Do not nest `defineMiddlewares` in feature files.
  - Per Admin feature: `validators.ts`, `query-config.ts` (when the feature has list/retrieve), `middlewares.ts` (wire that feature’s matchers only).
  - Product `additional_data`: each feature that extends product create/update exports a fragment from `api/admin/<feature>/additional-data.ts`. Compose them in `api/admin/products/additional-data.ts` and pass the result from `products/middlewares.ts`. Do not put foreign-route matchers in the feature’s middlewares, and do not bury cross-route fields inside CRUD validators.
- `modules/`: custom domain modules (models, services, migrations)
- `workflows/`: orchestration; prefer over fat route handlers
- `links/`: links between module data models
- `subscribers/`: react to Medusa events
- `jobs/`: scheduled work (payouts later)
- `admin/`: Admin dashboard widgets and routes
- `migration-scripts/`: one-off / seed scripts (includes initial seed; runs once via `db:migrate`)
- `scripts/`: CLI exec helpers (for example publishable key sync)
- `lib/`: shared helpers (including default markets seed config)

## Patterns to follow when extending

1. Add or change a custom module model → `pnpm exec medusa db:generate <module>` then `db:migrate`. Update `docs/ER_MODEL.md` in the same session.
2. Business logic in **workflows** and steps; routes resolve and run workflows.
3. Do not open a raw DB client or write SQL in routes.
4. Marketplace concepts (vendor, consignment, commission) become explicit modules/links once you spike them. Avoid scattering vendor_id checks without a model.
5. Shared chassis modules should stay brand-agnostic; brand config belongs outside core logic when you add it.
6. Money and rates use `bigNumber`, never a float.
7. Keep provider and host choices at the edges: nothing outside a seam should know which payment, tax, carrier, content, search or hosting vendor a clone picked (`docs/plan.md`, "Not decided").

## Marketplace implementation constraints

What the requirements in `docs/features/` imply for the code. The briefs state
behaviour only and deliberately name no primitives; this is where the mapping lives.

- **Vendor isolation cannot come from Admin.** The User Module gives users and
  invites but no granular per-user permissions, so a vendor-facing portal is a
  separate app on a custom actor type, with every `/vendors/*` query scoped from
  `req.auth_context.actor_id`. Never a filter a route author has to remember.
- **Never store the customer-facing order status.** It is derived from the states of
  its parts, so it cannot drift out of agreement with them.
- **Compute the money split inside the order workflow**, so it is stored atomically
  with the order and rolls back with it.
- **Ledger entries are append-only.** A refund or correction is a new row; nothing is
  updated in place.
- **Checkout must be idempotent.** Lock the cart and guard the split, or a retry or
  double-click produces duplicate parts that are very hard to unwind.
- **Per-vendor stock means a stock location per vendor**, with reservation on
  placement and release on cancellation.
- **Extend core flows, never fork them.** Product creation and approval hook into
  Medusa's own product workflow rather than growing a parallel product path.
- The order container itself is **still open** — child orders (the official
  marketplace recipe) versus one order plus consignment records. Settle it with
  `docs/spikes/multi-vendor-order.md` before building a module to keep.

## Conventions and standards

- Satisfy `@medusajs/eslint-plugin` recommended rules (`eslint.config.ts` at repo root). A `@medusajs/*` lint failure usually means wrong framework shape.
- Files kebab-case; DB columns snake_case.
- No semicolons; double quotes; 2-space indent (starter / Prettier style).

## Environment variables

Declared in `.env.template`. Required locally: `DATABASE_URL`, CORS vars, JWT/cookie secrets. Prefer setting `REDIS_URL` to match Docker Compose.

## Scripts / commands

From `apps/backend`:

- `pnpm run dev` → `medusa develop`
- `pnpm exec medusa db:migrate`
- `pnpm exec medusa user -e ... -p ...`
- `pnpm exec medusa exec ./src/scripts/<file>.ts`

## Gotchas and notes

- Editing models without generating migrations: schema never applies.
- Destructive DB ops only with explicit user confirmation.
- Local Redis optional; fake Redis is not production-safe.
- **Mandatory:** `src/admin` is frontend — never import `modules/**/models` or `InferTypeOf` of models. Wire types live once in `api/admin/<resource>/contract.ts` (entity + query). Shared list shapes: `CustomListQuery` / `CustomListResponse<"resource", Item>` in `api/admin/list-response.ts`. Admin hooks under `admin/hooks/queries/` only wrap `useQuery` and import those. Core Medusa entities: extend `HttpTypes` / JS SDK in the same contract file when needed.
- Query keys: `admin/lib/query-keys.ts`.
- Admin UI that imports `@medusajs/js-sdk` needs it as a **direct** backend dependency (same version as other `@medusajs/*`). It is not pulled in by `@medusajs/admin-sdk` alone.
- Multi-vendor planning notes: `docs/spikes/multi-vendor-order.md` (do not productize on the demo path yet).
