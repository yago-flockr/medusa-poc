# Backend (`@dtc/backend`)

Medusa v2 application for the commerce chassis: Store API, Admin API, workflows, modules, and Admin UI at `/app`.

## Tech stack

- **Medusa v2**: commerce engine and Admin dashboard
- **PostgreSQL / Redis**: via root `docker-compose.yml`
- **TypeScript**: package sources under `src/`

## Project structure

```text
src/
├── api/                 # Store and admin HTTP routes
├── modules/             # Custom domain modules
├── workflows/           # Business orchestration
├── links/               # Module links
├── subscribers/         # Event handlers
├── jobs/                # Scheduled work
├── admin/               # Admin UI extensions
└── migration-scripts/   # One-off DB data-migration scripts (Medusa-managed, run via db:migrate)

seeds/                   # medusa exec helpers for demo/test data — not app source, kept outside src/
```

Persistence notes for custom models: [`docs/ER_MODEL.md`](./docs/ER_MODEL.md).

## Requirements

- Node.js 20+
- pnpm (from repo root)
- Docker Compose Postgres (and Redis recommended)

## Getting started

1. Install dependencies (from repo root):

```bash
pnpm install
```

2. Configure env:

```bash
cp .env.template .env
```

3. Migrate and create a user:

```bash
pnpm exec medusa db:migrate
pnpm exec medusa user -e qwe@flockr.com -p qwe
```

4. Seed demo data (regions, a store, sample products — safe to skip, but re-running it duplicates data rather than updating it):

```bash
pnpm run seed
```

5. Run this package:

```bash
pnpm run dev
```

Admin: http://localhost:9000/app
