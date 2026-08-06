# Agent context

> AI agents: read `agents/` for full project context. This file is a router only.

## What this repo is

Medusa v2 monorepo PoC for **Sensus Collective**, a curated multi-vendor marketplace. Product intent: `sensus.md`. Platform decision: Medusa (see `docs/adr/0001-commerce-platform-medusa.md`).

## Where to find context

- **Repo-wide:** `agents/overview.md` (start here)
- **Backend:** `agents/backend.md` (when working under `apps/backend/`)
- **Storefront:** `agents/storefront.md` (when working under `apps/storefront/`)
- **Medusa learning map:** `agents/medusa-learning-map.md`
- **ADRs:** `docs/adr/`
- **Feasibility:** `docs/feasibility-sensus-medusa.md`

## Human onboarding

`README.md`. Local Postgres: `docker-compose.yml`.

## Maintaining documentation

Update `agents/*.md` and `docs/adr/` as decisions change. Follow **Maintaining project documentation** in `agents/overview.md`. Change this router only when agent files are added or renamed.
