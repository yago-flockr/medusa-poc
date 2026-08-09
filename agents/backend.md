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
- No custom chassis modules with owned models yet (starter + seed helpers only)
- Planned extensions (Phase 2): house-scoped product/order fields, consignments, commission

## Core technologies

- **Medusa v2**: `medusa-config.ts`, commerce modules
- **PostgreSQL / Redis**: via root Docker Compose and env URLs
- **TypeScript**: package `tsconfig.json`

## Module / directory breakdown (`src/`)

- `api/`: file-based routes (`api/store/*`, `api/admin/*`) exporting HTTP verbs
- `modules/`: custom domain modules (models, services, migrations)
- `workflows/`: orchestration; prefer over fat route handlers
- `links/`: links between module data models
- `subscribers/`: react to Medusa events
- `jobs/`: scheduled work (payouts later)
- `admin/`: Admin dashboard widgets and routes
- `migration-scripts/`: one-off / seed scripts (includes initial seed)
- `scripts/`: CLI exec helpers (for example publishable key sync)
- `lib/`: shared helpers (including default markets seed config)

## Patterns to follow when extending

1. Add or change a custom module model → `pnpm exec medusa db:generate <module>` then `db:migrate`. Update `docs/ER_MODEL.md` in the same session.
2. Business logic in **workflows** and steps; routes resolve and run workflows.
3. Do not open a raw DB client or write SQL in routes.
4. Marketplace concepts (house, consignment, commission) become explicit modules/links once the spike lands (ADR 0002). Avoid scattering house_id checks without a model.
5. Shared chassis modules should stay brand-agnostic; brand config belongs outside core logic (`docs/plan.md` Phase 4).

## Conventions and standards

- Satisfy `@medusajs/eslint-plugin` recommended rules (`eslint.config.ts` at repo root). A `@medusajs/*` lint failure usually means wrong framework shape.
- Files kebab-case; DB columns snake_case.
- No semicolons; double quotes; 2-space indent (starter style until Biome migration).

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
- `.medusa/` is build output; do not hand-edit.
- Local Redis optional; fake Redis is not production-safe.
