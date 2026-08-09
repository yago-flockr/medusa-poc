# Spike notes: multi-vendor order split

> Planning only. Draft. Not set in stone.
> Feed findings into ADR 0002 when you run the spike for real.

## Question

Can one customer cart with items from two houses become **one payment / one customer-facing purchase**, with independent fulfillment per house, without multiple checkouts?

## What to learn (when you spike)

1. Tag (or model) two products as different houses.
2. Put both in one cart and complete checkout.
3. Inspect whether Medusa gives you one order, multiple fulfillments, or forces a custom complete-cart path.

## Known directions from Medusa docs (not decided)

- **A. Child orders per vendor** (official marketplace recipe): customize complete-cart; parent + child orders; strong vendor isolation.
- **B. One order + consignments + multiple fulfillments**: closer to “one customer order ID”; house lifecycle in a custom module.

## Rule for Now

Do not productize either path on the stakeholder demo. Demo stays single-merchant until a full split workflow exists.
