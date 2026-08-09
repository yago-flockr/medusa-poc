# medusa-poc (commerce chassis)

> Context for AI agents. Keep accurate; future sessions trust this file.

## Maintaining project documentation

Update **in the same session** when you discover:

- User preference (style, tooling, workflow)
- Recurring bug or gotcha
- Non-obvious architecture or wiring
- New module, package, folder, or script not mapped here
- Schema or persistence change → `apps/backend/docs/ER_MODEL.md`
- Useful command missing from Scripts

Do not record generic facts, obvious code, or duplicates.

**Where to update:**

- Repo-wide → `agents/overview.md`
- Roadmap / phased work → `plan.md`
- Decisions that bind the codebase → `docs/adr/`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa study path → `agents/medusa-learning-map.md`
- Backend ER model → `apps/backend/docs/ER_MODEL.md`
- `AGENTS.md` → only when agent files are added or renamed
- Local IDE adapter (Cursor: `.cursor/rules/*.mdc`, gitignored) → when router paths or globs change

## Overview

This repo is a **Medusa v2 monorepo chassis**: high-leverage, modular commerce foundation meant to be cloned and specialized for client marketplaces. It is brand-agnostic; client names and styling live in the Phase 4 config layer, not in core.

Goals (see `plan.md`):

1. Strong developer experience (Biome, Next.js + Tailwind + shadcn/ui, i18next, Zustand, TanStack Query).
2. Multi-vendor-aware Medusa engine (consignments by house, commission, schema extensions).
3. Clear storefront ↔ backend contract (API strategy, auth for customer / house / admin).
4. Factory workflow: clone, swap brand config, onboard data.

Current code base is still close to the Medusa DTC starter. Treat `plan.md` phases as the direction of travel; do not invent brand-specific product rules in the chassis.

## Architecture and flow

1. Customer browses and checks out on `apps/storefront` (Next.js).
2. Storefront calls Medusa Store API with a publishable API key.
3. `apps/backend` (Medusa) is system of record for products, cart, checkout, orders, customers.
4. Staff use Medusa Admin (`http://localhost:9000/app`) plus custom admin UI extensions.
5. Vendor ("house") portal is a separate surface over the same backend (ADR 0003).
6. Local DB and Redis: Docker Compose (ADR 0004).

Hard chassis problem: **one basket, many houses** → one payment, per-house consignments (ADR 0002). De-risk with a two-house spike before large UI work.

## Core technologies and where they live

- **Medusa v2 backend**: `apps/backend`
- **Next.js storefront**: `apps/storefront`
- **pnpm + Turborepo**: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- **Postgres + Redis**: `docker-compose.yml`
- **Roadmap**: `plan.md`
- **ADRs**: `docs/adr/`
- **Default seed markets**: `apps/backend/src/lib/markets.ts`

## Module / directory breakdown

- `apps/backend/`: Medusa application. Detail → `agents/backend.md`
- `apps/storefront/`: customer storefront. Detail → `agents/storefront.md`
- `docs/adr/`: architecture decisions for the chassis
- `plan.md`: phased roadmap (DX → engine → bridge → factory)
- `docker-compose.yml`: local Postgres and Redis only

## Patterns to follow when extending

1. Prefer Medusa modules, workflows, links, and subscribers over ad hoc services.
2. Routes stay thin; business logic in workflows.
3. Content/CMS may reference products; never duplicate price or stock.
4. House isolation is structural (module filters / ownership), not ad hoc checks in every handler.
5. Keep **core logic** separate from **brand styling** (colors, copy, images in config or theme layer).
6. Buy vs build: justify custom code against an off-the-shelf Medusa module or provider.

## Conventions and standards

- Package manager: **pnpm only** (ADR 0005).
- Lint today: ESLint + Prettier from the starter (`@medusajs/eslint-plugin`). Biome swap is Phase 1 in `plan.md`; do not mix both.
- Code artifacts in English.
- No secrets in git: `.env` / `.env.local` gitignored; document new vars in `.env.template`.
- House style for docs in this repo: no markdown tables, no em dashes.

## Environment variables

- Backend: `apps/backend/.env` from `.env.template` (`DATABASE_URL`, `REDIS_URL`, CORS, JWT/cookie secrets).
- Storefront: `apps/storefront/.env.local` (`NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`).
- Never print secret values in chat or commits.

## Scripts / commands

From repo root (pnpm):

- `pnpm run setup`: Ubuntu tooling bootstrap (`scripts/setup.sh`)
- `pnpm run backend:dev`: Medusa on http://localhost:9000 (admin `/app`)
- `pnpm run storefront:dev`: storefront on http://localhost:8000
- `pnpm run dev`: all workspace apps
- `docker compose up -d`: local Postgres and Redis

Backend DB (from `apps/backend`):

- `pnpm exec medusa db:migrate`
- `pnpm exec medusa user -e <email> -p <password>`

## Gotchas and notes

- `.cursor/` stays gitignored; local Cursor routers point at `agents/`, they do not duplicate it.
- pnpm 11: `trustLockfile` and `allowBuilds` live in `pnpm-workspace.yaml`. Install may fail with `ERR_PNPM_IGNORED_BUILDS` until builds are approved.
- create-medusa-app may leave publishable key unset if interrupted; sync via admin or `apps/backend/src/scripts/sync-publishable-key.ts` if present.
- Redis URL may be unset locally; Medusa uses an in-memory fake Redis (not for production).
- Storefront without publishable key fails in confusing ways; check `.env.local` first.
## Open chassis decisions

- API contract: Medusa GraphQL vs REST + BFF (`plan.md` Phase 3).
- Shipping charge policy for multi-house orders (one vs per-house vs absorbed).
- CMS and search provider defaults for the factory workflow.
- Exact auth standard across Customer, House, and Admin.
