# Pre-start checklist (local)

Simple configs before feature work.

1. Docker Desktop running, then: `docker compose up -d` (Postgres + Redis)
2. Backend `.env` from `.env.template` if missing (`DATABASE_URL`, `REDIS_URL`)
3. Storefront `.env.local` from `.env.template` if missing (publishable key after seed)
4. Migrate + admin user + sync publishable key (if DB is fresh or reset)
5. `pnpm run backend:dev` and `pnpm run storefront:dev`

Not needed to boot locally: payment keys, deployment, CMS, search provider, component library, i18n, vendor portal. Several of those are deliberately unchosen — see `docs/plan.md`.
