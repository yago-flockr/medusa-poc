# ADR 0001: Commerce platform is Medusa

- Status: accepted
- Date: 2026-08-06
- Deciders: engineering (PoC)

## Context

`sensus.md` (RFP v5.4) originally fixed Shopify Plus as the commerce core, driven by timeline. The engagement later moved away from that assumption. This repository is the technical exploration and implementation base for Sensus Collective on Medusa instead.

Medusa is open source, TypeScript-first, module-based, and deployable on Medusa Cloud or self-hosted (for example AWS). It owns catalogue, cart, checkout, orders, payments integration points, and admin extensibility. Multi-vendor marketplace mechanics will be built or composed on top of Medusa rather than buying a separate Shopify marketplace layer.

## Decision

Use **Medusa v2** (this monorepo: `apps/backend` + `apps/storefront`) as the commerce system of record for Sensus.

Shopify Plus is **not** a requirement for this codebase. Where `sensus.md` says "Shopify Plus as the commerce core (Fixed)", treat that line as historical RFP text superseded by this ADR.

## Consequences

- Product outcomes in `sensus.md` (MoR, multi-house basket, three surfaces, DDP, curation) still apply unless a later ADR changes them.
- House catalogue ingestion "from Shopify" (RFP 7.4) becomes an **optional connector** for houses that already sell on Shopify, not a dependency on Shopify as our commerce core.
- Timeline risk shifts: we own more of the marketplace orchestration than a Plus + marketplace app stack would. We must de-risk multi-vendor order split early (RFP 7.9).
- Prefer Medusa modules, workflows, and links over inventing a parallel commerce domain.

## References

- Product source: `sensus.md`
- Stack entry: `agents/overview.md`
- Learning path: `agents/medusa-learning-map.md`
