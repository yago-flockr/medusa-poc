# ADR 0003: Three surfaces, one commerce core

- Status: proposed
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

## Context

Marketplace clients built from this chassis typically need three products sharing one data model:

1. **Customer storefront**: discovery, purchase, post-purchase across multi-house orders.
2. **House portal**: onboarding, catalogue/stock, fulfilment, payouts.
3. **Admin portal**: curation/ops, central orders/returns, commission ledger, CMS composition hooks.

## Decision (working)

- **Customer storefront**: `apps/storefront` (Next.js), customized per brand via a config/theme layer (`docs/plan.md` Phase 4).
- **Admin**: Medusa Admin at `/app`, extended via `apps/backend/src/admin`.
- **House portal**: a custom surface (Medusa auth plus APIs or dedicated routes). Do not rebrand Medusa Admin as the house experience.

All three talk to **one Medusa backend** as system of record for commercial data. CMS owns content that references products; it never owns price or stock truth.

Identity: three audiences (customer, house user, staff) with separate auth concerns and hard house data isolation (`docs/plan.md` Phase 3).

## Consequences

- Scope is not storefront-only. House portal and admin extensions are first-class chassis concerns.
- Brand styling must not be tangled into auth or order orchestration.
- Domain, modules, and APIs can proceed against provisional UI while client design arrives.
