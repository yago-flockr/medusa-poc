# Backend (`apps/backend`)

> Context for AI agents in the Medusa application. Keep accurate.

## Maintaining this file

Follow **Maintaining project documentation** in `agents/overview.md`.

## Overview

Medusa v2 application (`@dtc/backend`). System of record for catalogue, cart, checkout, orders, customers, and admin. Config: `medusa-config.ts`.

## Architecture

- Framework: `@medusajs/framework` / `@medusajs/medusa`
- Persistence: PostgreSQL via Medusa modules (not Prisma/Drizzle as primary)
- Extension model: custom modules, module links, workflows, API routes, subscribers, jobs, admin UI extensions

## Directory map (`src/`)

- `api/`: file-based routes (`api/store/*`, `api/admin/*`) exporting HTTP verbs
- `modules/`: custom domain modules (models, services, migrations)
- `workflows/`: orchestration; prefer over fat route handlers
- `links/`: links between module data models
- `subscribers/`: react to Medusa events
- `jobs/`: scheduled work (payouts later)
- `admin/`: Admin dashboard widgets and routes
- `migration-scripts/`: one-off / seed scripts (includes initial seed)
- `scripts/`: CLI exec helpers (for example publishable key sync)

## Patterns when extending

1. Add or change a custom module model → `pnpm exec medusa db:generate <module>` then `db:migrate`.
2. Business logic in **workflows** and steps; routes resolve and run workflows.
3. Do not open a raw DB client or write SQL in routes.
4. Marketplace concepts (house, consignment, commission) should become explicit modules/links once the spike lands (ADR 0002). Until then, avoid scattering house_id checks without a model.

## Conventions

- Satisfy `@medusajs/eslint-plugin` recommended rules (`eslint.config.ts` at repo root). A `@medusajs/*` lint failure usually means wrong framework shape.
- Files kebab-case; DB columns snake_case.
- No semicolons; double quotes; 2-space indent (starter style until Biome migration).

## Environment

Declared in `.env.template`. Required locally: `DATABASE_URL`, CORS vars, JWT/cookie secrets.

## Scripts

From `apps/backend`:

- `pnpm run dev` → `medusa develop`
- `pnpm exec medusa db:migrate`
- `pnpm exec medusa user -e ... -p ...`
- `pnpm exec medusa exec ./src/scripts/<file>.ts`

## Gotchas

- Editing models without generating migrations: schema never applies.
- Destructive DB ops only with explicit user confirmation.
- `.medusa/` is build output; do not hand-edit.
- Local Redis optional; fake Redis is not production-safe.
