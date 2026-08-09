# ADR 0002: Merchant of record and multi-vendor orders

- Status: proposed
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

## Context

The chassis targets curated multi-vendor marketplaces. Commercially, the platform operator is typically **merchant of record**: sells to the customer; houses (vendors) supply. Houses hold stock and pick/pack; labels may be generated centrally.

One customer basket may span many houses: **one payment and one customer-facing order**, split into per-house consignments behind the scenes. This is the highest-risk domain in the chassis. Medusa's default model is closer to a single merchant store than a marketplace. We will extend it deliberately (`docs/plan.md` Phase 2).

## Decision (working)

1. **Customer-facing order** remains one purchase identity (payment, confirmation, account history).
2. **Fulfilment** is modeled as **one consignment (or sub-order) per house**, with independent lifecycle states (for example Placed, Accepted, In production, Dispatched, Delivered, Cancelled, Return paths).
3. A consignment's state must not mutate another consignment's state. Customer-visible order status is **derived** from consignments, not stored as a competing source of truth.
4. Commission is configurable per house; payouts run as a scheduled batch.
5. Exact Medusa primitives (custom modules, order edits, fulfillment sets, links) are **to be spike-proven** before large UI build.

## Consequences

- Do not implement "multiple carts" or "multiple checkouts" to fake multi-vendor.
- House portal and admin must operate on consignments and house-scoped data with hard isolation.
- Shipping charge policy (one charge vs per-house vs absorbed) stays pluggable until a later ADR.
- Early spike: two houses, one multi-house order, split, commission, partial refund. Fail that spike before investing in storefront polish.

## Open questions

- Shipping charge policy defaults for the chassis
- Precise status vocabulary shared across client projects
- Payout provider and ledger shape
