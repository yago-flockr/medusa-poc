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
- Roadmap / phased work → `docs/plan.md` (Now / Next / Later; draft)
- Decisions that bind the codebase → `docs/adr/`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa study path → `agents/medusa-learning-map.md`
- Backend ER model → `apps/backend/docs/ER_MODEL.md`
- `AGENTS.md` → only when agent files are added or renamed
- Local IDE adapter (Cursor: `.cursor/rules/*.mdc`, gitignored) → when router paths or globs change

## Overview

This repo is a **Medusa v2 monorepo chassis**: a brand-agnostic commerce foundation to clone and specialize for client marketplaces. The codebase is still close to the Medusa DTC starter.

**Now** (see `docs/plan.md`): stakeholder-ready single-merchant vertical slice (browse → cart → checkout → admin), one small learning extension, and an isolated multi-vendor spike that must not break the demo.

**Next / Later:** productized multi-vendor, DX hardening, factory/brand config. Those are not current implementation mandates.

## Product bar (non-negotiable)

See ADR 0006. This is a serious commerce chassis, not a toy that excuses broken flows.

- Never treat nonsense UX as "common", "normal Medusa", or "fine for a PoC" when we claim client-ready work.
- One customer per email: guest checkout then register/login with the same email must attach to the same customer and their orders. Manual order-ID transfer is recovery only, not the happy path.
- Logged-in checkout must pre-fill from the customer (and saved addresses in region).
- Framework **product** defaults can be wrong for us; we still fix them using Medusa’s **extension patterns** only (below).
- Agents: do not document workarounds as the product path. Flag defects, fix them, or park them explicitly as defects in `docs/plan.md`.

## Medusa engineering rules (non-negotiable)

Always implement the Medusa way. No workarounds. No parallel “simpler” stacks.

1. Prefer **modules, workflows, steps, links, subscribers, jobs, and file-based API routes** as documented.
2. Prefer **core-flows** (`@medusajs/medusa/core-flows`) and compose them with `runAsStep` / custom steps; do not reimplement commerce in raw SQL or ad hoc services in routes.
3. Routes stay thin: validate auth/body, run a workflow, return the result.
4. Auth for custom register routes follows the official pattern: registration/login JWT + `authenticate(..., { allowUnregistered: true })` + `setAuthAppMetadataStep` (see Medusa “create actor type” / register guides).
5. If core behavior fails ADR 0006, **replace the happy path** with our workflow/route; do not tell users to transfer orders or keep dual customers as the product story.
6. Never invent a second path that leaves the first broken.

## Architecture and flow

1. Customer browses and checks out on `apps/storefront` (Next.js).
2. Storefront calls Medusa Store API with a publishable API key.
3. `apps/backend` (Medusa) is system of record for products, cart, checkout, orders, customers.
4. Staff use Medusa Admin (`http://localhost:9000/app`) plus custom admin UI extensions.
5. Vendor ("house") portal is a draft hypothesis (ADR 0003), not in Now scope.
6. Local DB and Redis: Docker Compose (ADR 0004).

Hard scale problem (hypothesis ADR 0002): **one basket, many houses** → one payment, per-house consignments. De-risk with a time-boxed spike; keep the demo path single-merchant until then.

## Core technologies and where they live

- **Medusa v2 backend**: `apps/backend`
- **Next.js storefront**: `apps/storefront`
- **pnpm + Turborepo**: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- **Postgres + Redis**: `docker-compose.yml`
- **Roadmap**: `docs/plan.md`
- **ADRs**: `docs/adr/`
- **Default seed markets**: `apps/backend/src/lib/markets.ts`

## Module / directory breakdown

- `apps/backend/`: Medusa application. Detail → `agents/backend.md`
- `apps/storefront/`: customer storefront. Detail → `agents/storefront.md`
- `docs/adr/`: architecture decisions (accepted vs hypothesis)
- `docs/plan.md`: Now / Next / Later roadmap (draft)
- `docker-compose.yml`: local Postgres and Redis only

## Patterns to follow when extending

1. Prefer Medusa modules, workflows, links, and subscribers over ad hoc services.
2. Routes stay thin; business logic in workflows.
3. Content/CMS may reference products; never duplicate price or stock.
4. Do not productize multi-vendor on the demo path until the spike succeeds.
5. Keep core logic separate from brand styling when a config layer appears (Later).
6. Buy vs build: justify custom code against an off-the-shelf Medusa module or provider.

## Conventions and standards

- Package manager: **pnpm only** (ADR 0005).
- Lint today: ESLint + Prettier from the starter (`@medusajs/eslint-plugin`). Biome is Next, not Now; do not mix both.
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
- Multi-vendor planning notes: `docs/spikes/multi-vendor-order.md` (not productized for Now).

## Open decisions (Next / Later)

- Multi-vendor model: spike findings in ADR 0002
- Shipping charge policy for multi-house orders
- API contract: Medusa GraphQL vs REST + BFF
- Auth standard across Customer, House, and Admin
- CMS and search provider defaults
