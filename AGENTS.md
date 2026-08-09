# Agent context

> AI agents: read `agents/` for full project context. This file is a router only.

## What this repo is

Medusa v2 monorepo **chassis**: a reusable commerce foundation for multi-vendor marketplace projects (clone, configure brand, ship). Roadmap: `docs/plan.md`.

## Where to find context

- **Repo-wide:** `agents/overview.md` (start here)
- **Backend:** `agents/backend.md` (when working under `apps/backend/`)
- **Storefront:** `agents/storefront.md` (when working under `apps/storefront/`)
- **Medusa learning map:** `agents/medusa-learning-map.md`
- **Roadmap:** `docs/plan.md`
- **ADRs:** `docs/adr/`

## Human onboarding

`README.md`. Local Postgres and Redis: `docker-compose.yml`.

## Maintaining documentation

Update `agents/*.md` and `docs/adr/` as decisions change. Follow **Maintaining project documentation** in `agents/overview.md`. Change this router only when agent files are added or renamed. Cursor users: keep local `.cursor/rules/` routers in sync when paths or globs change (`.cursor/` is gitignored).
