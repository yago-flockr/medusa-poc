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
- Scope, fixed constraints, and decisions → `docs/plan.md`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa mental model → `agents/medusa-learning-map.md`
- Medusa study stages → `docs/study/README.md`
- What a feature should do (business intent) → `docs/features/<slug>.md`. **Behaviour only** — no technology, file paths or primitives; those go in this file or `agents/backend.md`. Shape: `docs/features/_template.md`
- Experiment protocol and results → `docs/spikes/<slug>.md`
- Backend ER model → `apps/backend/docs/ER_MODEL.md`
- `AGENTS.md` → only when agent files are added or renamed

## Overview

Medusa v2 monorepo chassis (still close to the DTC starter). Brand-agnostic foundation to specialize per client.

Scope and fixed constraints: `docs/plan.md`. **Read its Fixed and Not decided sections before choosing any technology** — several choices are deliberately still open, and picking one silently is a mistake.

## Medusa engineering rules

Always implement the Medusa way. No workarounds.

1. Prefer modules, workflows, steps, links, subscribers, jobs, and file-based API routes.
2. Prefer core-flows (`@medusajs/medusa/core-flows`) with `runAsStep` / custom steps.
3. Routes stay thin: auth/body → workflow → response.
4. Never invent a second path that leaves the first broken.

## Architecture and flow

1. Customer uses `apps/storefront` (Next.js).
2. Storefront calls Medusa Store API with a publishable API key.
3. `apps/backend` is system of record for products, cart, checkout, orders, customers.
4. Staff use Medusa Admin at `/app`.
5. Local DB and Redis: Docker Compose.

## Core technologies

Fixed (no substitute — `docs/plan.md`):

- **Medusa v2**: `apps/backend`
- **Next.js, server-rendered**: `apps/storefront`
- **Postgres**, and **Redis** for events, queues, cache and locks in production: `docker-compose.yml` locally
- **TypeScript** everywhere; separate web and worker processes in production

Current but replaceable:

- **pnpm + Turborepo**: root workspace
- **Tailwind** from the starter; component library not chosen
- **Seed markets**: `apps/backend/src/lib/markets.ts`

## Module / directory breakdown

- `apps/backend/` → `agents/backend.md`
- `apps/storefront/` → `agents/storefront.md`
- `docs/plan.md`: what the product must do, what is **Fixed**, and what is **Not decided** — read the latter before assuming a host or a provider
- `docs/study/`: Medusa study stages with done criteria; notes per stage
- `docs/features/`: intent briefs (what we want + likely Medusa primitives); `_template.md` is the shape
- `docs/spikes/`: experiments that prove a direction before productizing
- `bruno/`: Bruno `.bru` collection at repo root (admin JWT via `admin/folder.bru` pre-request)
- `docker-compose.yml`: local Postgres and Redis

## Conventions

- Package manager: **pnpm only**
- Lint today: ESLint + Prettier from the starter (decision: migrate to Biome, `docs/plan.md`)
- Code artifacts in English
- No secrets in git; document new vars in `.env.template`

## Environment variables

- Backend: `apps/backend/.env` from `.env.template`
- Storefront: `apps/storefront/.env.local`
- Never print secret values in chat or commits

## Scripts

- `pnpm run setup`
- `pnpm run backend:dev` → http://localhost:9000 (admin `/app`)
- `pnpm run storefront:dev` → http://localhost:8000
- `docker compose up -d`

From `apps/backend`: `pnpm exec medusa db:migrate`, `pnpm exec medusa user -e ... -p ...`

## Gotchas

- pnpm 11: `trustLockfile` / `allowBuilds` in `pnpm-workspace.yaml`
- Storefront without publishable key fails opaquely
- Redis may fall back to in-memory fake Redis locally
