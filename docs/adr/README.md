# Architecture Decision Records

Living decisions for the **medusa-poc chassis** (reusable Medusa foundation for multi-vendor marketplaces).  
Nothing here is permanent: supersede with a new ADR when we change course.

## How to use

1. Roadmap and phasing: `docs/plan.md`.
2. Local boot: `docs/pre-start.md`.
3. Day-to-day AI / eng context: `agents/` (start at `agents/overview.md`).
4. Decisions that bind the codebase: ADRs below.

## Reading order (new session)

1. ADR 0001 (platform) → ADR 0002 (multi-vendor) → ADR 0003 (surfaces)
2. ADR 0004 + 0005 for local tooling

## Index

- [0001](./0001-commerce-platform-medusa.md) — Commerce platform is Medusa — **accepted** — Medusa v2 is the commerce core.
- [0002](./0002-merchant-of-record-multi-vendor.md) — Merchant of record and multi-vendor orders — **proposed** — One payment, per-house consignments; spike before UI.
- [0003](./0003-three-surfaces.md) — Three surfaces, one commerce core — **proposed** — Storefront + house portal + admin; one Medusa backend.
- [0004](./0004-local-postgres-docker.md) — Local Postgres and Redis via Docker Compose — **accepted** — `docker compose` for DB + Redis.
- [0005](./0005-package-manager-pnpm.md) — Package manager is pnpm — **accepted** — pnpm only; workspace settings in `pnpm-workspace.yaml`.

## Status legend

- **proposed**: direction we intend; still open to challenge (needs spike or confirm)
- **accepted**: current working decision for this repo
- **superseded**: replaced by a newer ADR (link both ways)
- **deprecated**: no longer followed; kept for history

## Adding an ADR

1. Copy the next number: `docs/adr/00NN-kebab-title.md`.
2. Include: Status, Date, Context, Decision, Consequences.
3. Add a bullet to the index above.
4. If it changes chassis direction, update `docs/plan.md` and `agents/overview.md` in the same change.
