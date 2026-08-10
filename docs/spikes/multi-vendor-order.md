# Spike: multi-vendor order split

> Experiment, not production code. Intent and design questions live in
> `docs/features/multi-vendor-marketplace.md`.

**Status:** not started
**Prerequisite:** study plan blocks A and B (`docs/study/README.md`)

## Question

Can one cart holding items from two brands become a single customer payment with
independent per-brand orders, without a second checkout, and does it roll back
cleanly when something fails?

## Approach to try first

Follow the official
[marketplace recipe](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors)
as-is on a branch: marketplace module, vendor↔product and vendor↔order links, a
`create-vendor-orders` workflow that runs `completeCartWorkflow.runAsStep`, and a
custom `POST /store/carts/:id/complete-vendor` route the storefront calls.

Do not refactor it into the chassis while spiking. The point is to learn where it
hurts.

## What counts as proof

1. A cart with items from two vendors produces one parent order and two child
   orders, each linked to its vendor.
2. A vendor token reading `/vendors/orders` sees only its own child order.
3. Forcing an error after the first child order is created cancels the child
   orders that were already created (compensation works).
4. Calling the complete endpoint twice for the same cart does not duplicate child
   orders.

## What to record here afterwards

- Which of the two blocking questions in the feature brief the spike answered.
- Where the recipe was awkward for "we ship everything" (shipping methods,
  fulfilment, refunds).
- Whether the parent/child order model or a single-order-plus-consignment model
  fits us better, with the evidence.
- Estimated work to turn it into an optional module.

## Results

_Not run yet._
