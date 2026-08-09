# Architecture Decision Records

Living decisions for the **medusa-poc chassis**. Nothing is set in stone: supersede with a new ADR when evidence changes.

## How to use

1. Near-term focus: `docs/plan.md` (Now / Next / Later).
2. Local boot: `docs/pre-start.md`.
3. Day-to-day AI / eng context: `agents/` (start at `agents/overview.md`).
4. Decisions that bind the codebase: ADRs below.
5. Hard-problem notes before productizing: `docs/spikes/`.

## Reading order

1. **Now facts:** ADR 0001 (platform) → 0004 (Docker) → 0005 (pnpm)
2. **Draft hypotheses (not demo mandates):** ADR 0002 (multi-vendor) → 0003 (surfaces)
3. Roadmap buckets: `docs/plan.md`

## Index

- [0001](./0001-commerce-platform-medusa.md) — Commerce platform is Medusa — **accepted** — Medusa v2 is the commerce core.
- [0002](./0002-merchant-of-record-multi-vendor.md) — Merchant of record and multi-vendor orders — **hypothesis / draft** — Spike before productizing.
- [0003](./0003-three-surfaces.md) — Three surfaces, one commerce core — **hypothesis / draft** — Storefront + admin now; house portal later.
- [0004](./0004-local-postgres-docker.md) — Local Postgres and Redis via Docker Compose — **accepted** — `docker compose` for DB + Redis.
- [0005](./0005-package-manager-pnpm.md) — Package manager is pnpm — **accepted** — pnpm only; workspace settings in `pnpm-workspace.yaml`.

## Status legend

- **accepted**: current working decision for this repo
- **hypothesis / draft**: direction to validate; not an implementation mandate
- **proposed**: intended direction, still open to challenge
- **superseded**: replaced by a newer ADR (link both ways)
- **deprecated**: no longer followed; kept for history

## Adding an ADR

1. Copy the next number: `docs/adr/00NN-kebab-title.md`.
2. Include: Status, Date, Context, Decision (or Hypothesis), Consequences.
3. Add a bullet to the index above.
4. If it changes near-term focus, update `docs/plan.md` and `agents/overview.md` in the same change.
