# Pre-start checklist (local)

Simple configs before feature work.

1. Docker: `docker compose up -d` (Postgres + Redis)
2. Backend `.env` from `.env.template` (especially `DATABASE_URL`, `REDIS_URL`)
3. Storefront `.env.local` from `.env.template` (publishable key after seed)
4. Migrate + admin user + sync publishable key (if DB is fresh or reset)
5. `pnpm run backend:dev` and `pnpm run storefront:dev`

Skip for now (need accounts or product choices): Stripe keys, Medusa Cloud login, CMS, search provider, Biome swap (`docs/plan.md` Phase 1).
