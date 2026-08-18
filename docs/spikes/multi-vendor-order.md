# Spike: splitting one order across vendors

> Experiment, not production code. **This is the one place where "how" belongs** —
> the requirement is in `docs/features/multi-vendor-marketplace.md` and says nothing
> about implementation on purpose. The bar to clear is **What "working" means for
> the marketplace** in `docs/plan.md`.

**Status:** in progress — proof #1, #2 pass; #6 fixed; all three anticipated friction
points stress-tested with evidence (one turned out to be a non-issue, two confirmed).
Evidence leans toward consignment records for the payment/refund friction, but the
comparison hasn't actually been built to check that lean. Proof #3, #4, #5 still open.
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
as-is, directly on `main` — this is a POC, not a team repo with parallel
work to protect, so a branch buys nothing. Do not refactor it into the
chassis while spiking — the point is to find where it hurts, and we already
expect three places:

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

Implemented the recipe as-is: `src/links/vendor-order.ts`,
`src/workflows/create-vendor-orders.ts` (a group-vendor-items step, and a
create-vendor-orders step using `promiseAll`, `StepResponse.permanentFailure`,
and a cancel-on-compensation rollback, orchestrated with `acquireLockStep`,
`completeCartWorkflow.runAsStep`, `getOrderDetailWorkflow.runAsStep`, and
`releaseLockStep`), a `POST /store/carts/:id/complete-vendor` route replacing
the store's own complete-cart call, and `GET /vendors/orders`.

Verified by hand against a real two-vendor cart (region, published products
from two different test vendors, shipping method, `pp_system_default`
payment session):

- **Proof #1 — pass.** One payment collection (`status: authorized`, single
  amount), one parent order, and two child orders — each holding exactly one
  vendor's line item and tagged with that vendor via the `vendor-order` link.
- **Proof #2 — pass** (verified at the query layer the routes rely on).
  Each vendor's `vendor.orders` link resolves only its own child orders; no
  cross-vendor bleed.
- **Proof #6 — fails as documented.** Calling `complete-vendor` twice on the
  same cart returns the _same_ parent order (Medusa's own
  `completeCartWorkflow` is already idempotent there) but creates a **second,
  distinct pair of child orders** — confirmed by inspecting `vendor.orders`
  before and after: each vendor went from one order to two. Root cause: the
  recipe's own idempotency guard queries the `vendor-order` link filtered by
  `order_id: <parent order id>`. That only ever matches in the _single-vendor_
  branch of `createVendorOrdersStep`, where the parent order itself is linked
  to the vendor. In the multi-vendor branch, every link points at a _child_
  order's id, never the parent's — so the guard's `existingLinks` is always
  empty and the child-order creation step always re-runs. This is a real gap
  in the official recipe as published, not a mistake introduced here.
- Proof #3, #4, #5 (partial refund isolation, derived customer status, and
  forced-failure rollback) not yet exercised — the compensation path
  (`cancelOrderWorkflow` on `StepResponse.permanentFailure`) is wired per the
  recipe but not yet forced to fire.

### Idempotency fix (proof #6)

Replaced the single `vendor-order`-link check with two independent checks —
skip creating vendor orders if _either_ an existing `vendor-order` link points
at the parent order (the single-vendor branch's marker) _or_ an existing
`order` has `metadata.parent_order_id` equal to the parent's id (the
multi-vendor branch's marker, which the original check never looked at).
Re-verified on a fresh two-vendor cart: identical child order ids after
calling `complete-vendor` twice (2 child orders, not 4). Re-verified the
single-vendor path separately too — still one order both times, no error from
attempting to recreate an existing link. The response's `vendor_orders` field
is `null` on a skipped retry rather than echoing the existing orders — a
smaller, pre-existing gap in the recipe, not touched here.

### The three anticipated friction points, stress-tested with evidence

**#1 — derived status: confirmed, and worse than "must remember to compute it."**
Created a real partial fulfillment on vendor A's child order via
`createOrderFulfillmentWorkflow`. The child's `fulfillments` list correctly
shows it; the **parent order's `fulfillments` list stays empty** — the parent
has zero built-in awareness that any of its children changed state. Nothing
Medusa provides rolls a child's fulfillment/return/status up to the parent
automatically. Whatever shows the customer "one part shipped, one part still
being made" must explicitly query every child and compute the view — there is
no shortcut through the parent's own fields. (A separate attempt to force a
child's `status` directly via `orderModuleService.updateOrders` was itself
malformed — that service takes a `UpdateOrderDTO[]` with a selector, not
`{id, status}` — and silently updated nothing, so that specific probe is
inconclusive on its own. The fulfillment-based evidence above is real and
stands independently.)

**#2 — split-again on differing dispatch dates: not a friction point at all.**
Gave vendor A's child order two line items, then fulfilled only one via
`createOrderFulfillmentWorkflow`. Result: one order row throughout, a single
new `Fulfillment` record covering just that item, and per-item fulfilled
quantity correctly showing 1/1 fulfilled and 0/1 pending on the other. This is
Medusa's native partial-fulfillment support, entirely unrelated to the vendor
split — a vendor's order can already dispatch in waves without ever becoming
a second order. This removes one of the three original reasons to expect
consignment records would be necessary.

**#3 — we are the seller, not the vendor: confirmed.**
Queried `payment_collections` on the parent and both children after a real
checkout: the parent has one (`status: authorized`, the actual charged
amount); **both child orders have `payment_collections: []`** — empty. All
the money lives on the parent. Medusa's standard per-order refund/return
tooling operates on an order's own payment collection, so it cannot act on a
child order directly — there's nothing there to refund. Refunding "just
vendor A's line" would need custom logic reading the parent's payment
collection while scoping the actual money movement to that vendor's items,
not Medusa's built-in per-order return flow used as-is.

### What this evidence suggests about the real question

Friction #2 turning out to be a non-issue removes one argument for
consignment records. Friction #1 (status must be computed, never stored) is
true regardless of which shape wins, so it doesn't discriminate between them.
Friction #3 is the one that actually points somewhere: with child orders, a
per-vendor refund needs bespoke code specifically because the payment was
deliberately separated from the thing being refunded. A consignment shape —
one order, one payment collection, consignment records marking which line
items belong to which vendor — keeps the payment and the refundable line
items in the _same_ order, which is exactly the shape Medusa's own
return/claim workflows already expect. That's a real, evidence-backed lean
toward consignment records, but it is a lean, not a conclusion: nobody has
actually built the consignment-record alternative here to confirm a partial
refund is genuinely simpler that way, or forced proof #5 (mid-split failure)
against either shape. Treat this as the next comparison to run, not as the
answer recorded and closed.
