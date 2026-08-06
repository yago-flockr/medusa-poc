# Sensus Collective × Medusa PoC

> Context for AI agents. Keep accurate; future sessions trust this file.

## Maintaining project documentation

Update **in the same session** when you discover:

- User preference (style, tooling, workflow)
- Recurring bug or gotcha
- Non-obvious architecture or wiring
- New module, package, folder, or script not mapped here
- Schema or persistence change → `apps/backend/docs/ER_MODEL.md` when that file exists
- Useful command missing from Scripts

Do not record generic facts, obvious code, or duplicates.

**Where to update:**

- Repo-wide → `agents/overview.md`
- Product outcomes / RFP → `sensus.md` (historical + product intent); decisions that diverge → `docs/adr/`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa study path → `agents/medusa-learning-map.md`
- `AGENTS.md` → only when agent files are added or renamed

## Overview

This repo is a **Medusa v2 monorepo PoC** for **Sensus Collective**: a curated multi-vendor marketplace (houses are hand-picked; curation is the product).

Product outcomes live in `sensus.md` (RFP). Platform choice and engineering decisions live in `docs/adr/`. **Medusa is the commerce core** (ADR 0001), not Shopify Plus.

Launch markets: UK, EU, US. Scale at launch: about 30 houses. Target window in the RFP: early December (treat dates as commercial intent, not code constraints).

## Architecture and flow

1. Customer browses curated catalogue and editorial on `apps/storefront` (Next.js).
2. Storefront calls Medusa Store API with a publishable API key.
3. `apps/backend` (Medusa) is system of record for products, cart, checkout, orders, customers.
4. Staff use Medusa Admin (`http://localhost:9000/app`) plus custom admin UI extensions.
5. Houses will use a dedicated house portal (not Medusa Admin); see ADR 0003.
6. Local DB: Docker Compose Postgres (ADR 0004).

Hard product problem: **one basket, many houses** → one payment, per-house consignments (ADR 0002). De-risk with a two-house spike before large UI work.

**Delivery:** December cannot take the full RFP. Launch vs v2 split lives in `docs/feasibility-sensus-medusa.md` and ADR 0006 (proposed until stakeholders confirm).

## Core technologies and where they live

- **Medusa v2 backend**: `apps/backend`
- **Next.js storefront**: `apps/storefront`
- **pnpm + Turborepo**: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- **Postgres**: `docker-compose.yml`
- **ADRs**: `docs/adr/`
- **Feasibility (CAN / MAYBE / CAN'T)**: `docs/feasibility-sensus-medusa.md`
- **RFP / product**: `sensus.md`

## Module / directory breakdown

- `apps/backend/`: Medusa application. Detail → `agents/backend.md`
- `apps/storefront/`: customer storefront. Detail → `agents/storefront.md`
- `docs/adr/`: architecture decisions
- `sensus.md`: product RFP (Shopify line superseded by ADR 0001)
- `docker-compose.yml`: local Postgres only

## Patterns to follow when extending

1. Prefer Medusa modules, workflows, links, and subscribers over ad hoc services.
2. Routes stay thin; business logic in workflows.
3. Content/CMS may reference products; never duplicate price or stock.
4. House isolation is structural (module filters / ownership), not "remember to check house_id in each handler".
5. Buy vs build: justify custom code against an off-the-shelf Medusa module or provider (RFP 7.1 intent still applies with Medusa as core).

## Conventions and standards

- Package manager: **pnpm only** (ADR 0005).
- Lint today: ESLint + Prettier from the starter (`@medusajs/eslint-plugin`). Biome swap is allowed later as a dedicated change; do not mix both.
- Code artifacts in English.
- No secrets in git: `.env` / `.env.local` gitignored; document new vars in `.env.template`.

## Environment variables

- Backend: `apps/backend/.env` from `.env.template` (`DATABASE_URL`, CORS, JWT/cookie secrets).
- Storefront: `apps/storefront/.env.local` (`NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`).
- Never print secret values in chat or commits.

## Scripts / commands

From repo root (pnpm):

- `pnpm run backend:dev`: Medusa on http://localhost:9000 (admin `/app`)
- `pnpm run storefront:dev`: storefront on http://localhost:8000
- `pnpm run dev`: all workspace apps
- `docker compose up -d`: local Postgres

Backend DB (from `apps/backend`):

- `pnpm exec medusa db:migrate`
- `pnpm exec medusa user -e <email> -p <password>`

## Gotchas and notes

- `.cursor/` should stay gitignored; local Cursor routers point at `agents/`, they do not duplicate it.
- pnpm 11: `trustLockfile` and `allowBuilds` live in `pnpm-workspace.yaml`. Install may fail with `ERR_PNPM_IGNORED_BUILDS` until builds are approved.
- create-medusa-app may leave publishable key unset if interrupted; sync via admin or a Medusa exec script (see `apps/backend/src/scripts/sync-publishable-key.ts` if present).
- Redis URL may be unset locally; Medusa uses an in-memory fake Redis (not for production).
- Storefront without publishable key fails in confusing ways; check `.env.local` first.

## Open product decisions (from RFP, still open)

- Shipping charge policy (one vs per-house vs absorbed).
- Browser/device support matrix.
- Whether 5 December is a hard commercial date (build still plans to an earlier buffer).
- House listing: directory → filtered products vs future profile pages.
- Passwordless customer auth.
- CMS and search provider choices.
