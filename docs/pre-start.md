# Pre-start checklist (local)

Simple configs before feature work.

1. Docker: `docker compose up -d` (Postgres + Redis)
2. Backend `.env` from `.env.template` (especially `DATABASE_URL`, `REDIS_URL`)
3. Storefront `.env.local` from `.env.template` (`NEXT_PUBLIC_DEFAULT_REGION=gb`, publishable key after seed)
4. Markets: `apps/backend/src/lib/sensus-markets.ts` (UK / EU / US) — already set
5. Migrate + admin user + sync publishable key (if DB is fresh or reset)
6. `pnpm run backend:dev` and `pnpm run storefront:dev`

Skip for now (need accounts or product choices): Stripe keys, Medusa Cloud login, CMS, search provider, Biome swap.
