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
- Roadmap → `docs/plan.md`
- Human onboarding → `README.md`
- Backend → `agents/backend.md`
- Storefront → `agents/storefront.md`
- Medusa study path → `agents/medusa-learning-map.md`
- Backend ER model → `apps/backend/docs/ER_MODEL.md`
- `AGENTS.md` → only when agent files are added or renamed

## Overview

Medusa v2 monorepo chassis (still close to the DTC starter). Brand-agnostic foundation to specialize per client.

Roadmap: `docs/plan.md`.

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

- **Medusa v2**: `apps/backend`
- **Next.js**: `apps/storefront`
- **pnpm + Turborepo**: root workspace
- **Postgres + Redis**: `docker-compose.yml`
- **Seed markets**: `apps/backend/src/lib/markets.ts`

## Module / directory breakdown

- `apps/backend/` → `agents/backend.md`
- `apps/storefront/` → `agents/storefront.md`
- `docs/plan.md`: roadmap
- `docker-compose.yml`: local Postgres and Redis

## Conventions

- Package manager: **pnpm only**
- Lint today: ESLint + Prettier from the starter
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
