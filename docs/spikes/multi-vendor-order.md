# Spike: splitting one order across vendors

> Experiment, not production code. **This is the one place where "how" belongs** —
> the requirement is in `docs/features/multi-vendor-marketplace.md` and says nothing
> about implementation on purpose. The bar to clear is **What "working" means for
> the marketplace** in `docs/plan.md`.

**Status:** not started
**Prerequisite:** study plan blocks A and B (`docs/study/README.md`)

## Question

Can one basket holding items from two vendors become a single customer payment with
independent per-vendor parts, without a second checkout — and what should hold those
parts: child orders, or consignment records against one order?

The second half is the point. It is the decision everything downstream inherits:
payouts, returns, the vendor portal, and what the customer sees.

## Approach to try first

Follow the official
[marketplace recipe](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors)
as-is on a branch. Do not refactor it into the chassis while spiking — the point is
to find where it hurts, and we already expect three places:

1. Order status must be **derived** from the parts, and the recipe stores orders.
2. A part may **split again** on differing dispatch dates without becoming a second
   order.
3. **We are the seller**, not the vendor, so we hold the money and issue refunds. The
   recipe assumes the opposite direction.

If those three fight the recipe hard enough, the answer is consignment records, and
the spike has done its job by finding that out cheaply.

## What counts as proof

The full bar is in `docs/plan.md`. The subset that must pass before productizing:

1. A two-vendor basket produces one customer payment and two parts, each attributable
   to its vendor.
2. A signed-in vendor sees only its own part.
3. One part goes unfulfillable: that line is refunded, the other part untouched.
4. The status shown to the customer can be computed from the parts.
5. Forcing a failure part-way through leaves no half-created order.
6. Completing the same basket twice does not duplicate anything.

## What to record here afterwards

- **The answer, with evidence:** child orders or consignment records. Not a
  preference — what actually happened when the three friction points were tried.
- Which lifecycle states Medusa's own fulfilment and return machinery already
  carries, and which needed a state of our own.
- What it would take to turn this into something we keep.

## Results

_Not run yet._
