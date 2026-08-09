# ADR 0002: Merchant of record and multi-vendor orders

- Status: hypothesis / draft
- Date: 2026-08-06
- Updated: 2026-08-09
- Deciders: engineering

> Not an implementation mandate for the stakeholder demo. Validate with a time-boxed spike (`docs/plan.md` Now). Notes: `docs/spikes/multi-vendor-order.md`.

## Context

The chassis may target curated multi-vendor marketplaces. Commercially, the platform operator is often **merchant of record**: sells to the customer; houses (vendors) supply.

One customer basket may span many houses: **one payment and one customer-facing order**, split into per-house consignments behind the scenes. Medusa’s default model is closer to a single merchant store.

## Hypothesis (working)

1. **Customer-facing order** remains one purchase identity (payment, confirmation, account history).
2. **Fulfilment** is modeled as **one consignment (or sub-order) per house**, with independent lifecycle states.
3. A consignment’s state must not mutate another consignment’s state. Customer-visible order status is **derived** from consignments.
4. Commission is configurable per house; payouts as a scheduled batch.
5. Exact Medusa primitives are **spike-proven** before large UI or productization (`docs/plan.md` Next).

## Consequences if we adopt this

- Do not fake multi-vendor with multiple carts or checkouts.
- House portal and admin would operate on consignments (or child orders) with hard isolation.
- Shipping charge policy stays pluggable until a later ADR.
- Keep the demo path single-merchant until a complete split workflow exists.

## Spike findings

> TODO: fill after the real spike (accept / revise / park). Open choice to document: child orders (Medusa marketplace recipe) vs one order + consignments + multiple fulfillments.

## Open questions

- Shipping charge policy defaults for the chassis
- Precise status vocabulary shared across client projects
- Payout provider and ledger shape
- Final choice: child orders vs consignments on one order
