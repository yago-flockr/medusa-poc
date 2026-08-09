# ADR 0001: Commerce platform is Medusa

- Status: accepted
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

## Context

This repository is a reusable Medusa chassis for multi-vendor marketplace clients. We need an open, TypeScript-first commerce core that we can extend with modules, workflows, and admin UI, and deploy on Medusa Cloud or self-host.

Medusa owns catalogue, cart, checkout, orders, payment integration points, and admin extensibility. Multi-vendor marketplace mechanics (consignments, commission, house isolation) are built on top of Medusa rather than buying a separate marketplace platform.

## Decision

Use **Medusa v2** (this monorepo: `apps/backend` + `apps/storefront`) as the commerce system of record for every project spun from this chassis.

## Consequences

- Prefer Medusa modules, workflows, and links over inventing a parallel commerce domain.
- Timeline risk: we own marketplace orchestration. De-risk multi-vendor order split early (ADR 0002).
- Client projects clone this repo and specialize brand/config (`plan.md` Phase 4); they do not fork a different commerce core.

## References

- Roadmap: `plan.md`
- Stack entry: `agents/overview.md`
- Learning path: `agents/medusa-learning-map.md`
