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
├── migration-scripts/   # Seed / one-off scripts
└── scripts/             # medusa exec helpers
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
pnpm exec medusa user -e admin@example.com -p supersecret
```

4. Run this package:

```bash
pnpm run dev
```

Admin: http://localhost:9000/app
