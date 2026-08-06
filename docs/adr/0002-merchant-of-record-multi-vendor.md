# ADR 0002: Merchant of record and multi-vendor orders

- Status: proposed
- Date: 2026-08-06
- Deciders: engineering (PoC)

## Context

Sensus is a curated multi-vendor marketplace (~30 houses at launch). Commercially:

- Sensus is **merchant of record**: sells to the customer; houses supply.
- Houses hold stock and pick/pack; labels are generated centrally against Sensus carrier accounts.
- One customer basket may span many houses: **one payment and one customer-facing order**, split into per-house consignments behind the scenes.

This is the highest-risk domain in the product (RFP "THE HARD PART"). Medusa's default model is closer to a single merchant store than a marketplace. We will extend it deliberately.

## Decision (working)

1. **Customer-facing order** remains one purchase identity (payment, confirmation, account history).
2. **Fulfilment** is modeled as **one consignment (or sub-order) per house**, with independent lifecycle states from the RFP table (Placed, Accepted, Unfulfillable, In production, Dispatched, Delivered, Cancelled, Return requested, Return received, Refunded).
3. A consignment's state must not mutate another consignment's state. Customer-visible order status is **derived** from consignments, not stored as a competing source of truth.
4. Commission is configurable per house; payouts run as a scheduled batch.
5. Per-house product caps are enforced in platform logic (curation model).

Exact Medusa primitives (custom modules, order edits, fulfillment sets, links) are **to be spike-proven** before large UI build (RFP 7.9 critical validation).

## Consequences

- Do not implement "multiple carts" or "multiple checkouts" to fake multi-vendor.
- House portal and admin must operate on consignments and house-scoped data with hard isolation.
- Shipping charge policy (one charge vs per-house vs absorbed) remains TO CONFIRM in the RFP; UI and pricing must stay pluggable until decided.
- Early spike: two houses, one multi-house order, split, commission, partial refund. Fail that spike before investing in storefront polish.

## Open questions

- Shipping charge policy (RFP section 10).
- Whether a consignment may split further by dispatch date without becoming a second customer order (RFP allows this).
- How far Marketplace / Medusa B2B or community marketplace modules help vs custom modules.
