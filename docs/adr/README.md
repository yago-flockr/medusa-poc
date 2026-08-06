# Architecture Decision Records

Living decisions for the Sensus Collective marketplace PoC. Nothing here is permanent: supersede with a new ADR when we change course.

## How to use

1. Read `sensus.md` for product outcomes (RFP source).
2. Read `docs/feasibility-sensus-medusa.md` for CAN / MAYBE / CAN'T vs Medusa.
3. Read ADRs below for choices that diverge from or interpret the RFP.
4. Read `agents/` for day-to-day AI and engineering context.

## Index

- [ADR 0001: Commerce platform is Medusa](./0001-commerce-platform-medusa.md) — accepted
- [ADR 0002: Merchant of record and multi-vendor orders](./0002-merchant-of-record-multi-vendor.md) — proposed
- [ADR 0003: Three surfaces, one commerce core](./0003-three-surfaces.md) — proposed
- [ADR 0004: Local Postgres via Docker Compose](./0004-local-postgres-docker.md) — accepted
- [ADR 0005: Package manager is pnpm](./0005-package-manager-pnpm.md) — accepted
- [ADR 0006: Launch (v1) vs v2 scope](./0006-launch-v1-vs-v2-scope.md) — proposed

## Status legend

- **proposed**: direction we intend; still open to challenge
- **accepted**: current working decision for this repo
- **superseded**: replaced by a newer ADR (link both ways)
- **deprecated**: no longer followed; kept for history
