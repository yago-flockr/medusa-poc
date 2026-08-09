# ADR 0003: Three surfaces, one commerce core

- Status: hypothesis / draft
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

> Not an implementation mandate for the stakeholder demo. Now focuses on customer storefront + Medusa Admin. House portal is Later/Next.

## Context

Marketplace clients built from this chassis may eventually need three products sharing one data model:

1. **Customer storefront**: discovery, purchase, post-purchase.
2. **House portal**: onboarding, catalogue/stock, fulfilment, payouts.
3. **Admin portal**: ops, central orders/returns, commission ledger, CMS hooks.

## Hypothesis (working)

- **Customer storefront**: `apps/storefront` (Next.js); brand via a config/theme layer when we reach Later.
- **Admin**: Medusa Admin at `/app`, extended via `apps/backend/src/admin`.
- **House portal**: a custom surface (not rebranded Medusa Admin).

All surfaces talk to **one Medusa backend** as system of record. CMS may reference products; it never owns price or stock truth.

## Consequences if we adopt this

- Scope is not storefront-only long term, but house portal is out of scope for Now.
- Brand styling must not tangle into auth or order orchestration.
- Domain work can proceed against provisional UI.
