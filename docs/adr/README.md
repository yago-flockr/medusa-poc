# Architecture Decision Records

Living decisions for the **Sensus Collective** marketplace PoC on **Medusa**.  
Nothing here is permanent: supersede with a new ADR when we change course.

## How to use

1. Product outcomes (RFP): `sensus.md` (Shopify Plus line superseded by ADR 0001).
2. What to ship when: `docs/feasibility-sensus-medusa.md` (CAN / MAYBE / CAN'T + Launch vs v2).
3. Markets list: `docs/markets.md` (code: `apps/backend/src/lib/sensus-markets.ts`).
4. Local boot: `docs/pre-start.md`.
5. Day-to-day AI / eng context: `agents/` (start at `agents/overview.md`).
6. Decisions that bind the codebase: ADRs below.

## Reading order (new session)

1. ADR 0001 (platform) → ADR 0006 (Launch vs v2) → ADR 0007 (markets)  
2. ADR 0002 + 0003 when touching marketplace or portals  
3. ADR 0004 + 0005 for local tooling  

## Index

| ID | Title | Status | One-liner |
| --- | --- | --- | --- |
| [0001](./0001-commerce-platform-medusa.md) | Commerce platform is Medusa | accepted | Medusa v2 is the commerce core; not Shopify Plus. |
| [0002](./0002-merchant-of-record-multi-vendor.md) | Merchant of record and multi-vendor orders | proposed | One payment, per-house consignments; spike before UI. |
| [0003](./0003-three-surfaces.md) | Three surfaces, one commerce core | proposed | Storefront + house portal + admin; one Medusa backend. |
| [0004](./0004-local-postgres-docker.md) | Local Postgres and Redis via Docker Compose | accepted | `docker compose` for DB + Redis; Cloud/self-host later. |
| [0005](./0005-package-manager-pnpm.md) | Package manager is pnpm | accepted | pnpm only; workspace settings in `pnpm-workspace.yaml`. |
| [0006](./0006-launch-v1-vs-v2-scope.md) | Launch (v1) vs v2 scope | proposed | December ships phased Launch; full RFP is v2. |
| [0007](./0007-sensus-markets-uk-eu-us.md) | Sensus markets UK · EU · US | accepted | Three regions; UK (`gb` / GBP) is Launch default. |

## Status legend

- **proposed**: direction we intend; still open to challenge (needs stakeholder or spike confirm)
- **accepted**: current working decision for this repo
- **superseded**: replaced by a newer ADR (link both ways)
- **deprecated**: no longer followed; kept for history

## Adding an ADR

1. Copy the next number: `docs/adr/00NN-kebab-title.md`.
2. Include: Status, Date, Context, Decision, Consequences.
3. Add a row to the index above.
4. If it changes product phasing or markets, update `docs/feasibility-sensus-medusa.md` and/or `docs/markets.md` in the same change.
5. Point `agents/overview.md` at it when agents must follow it by default.
