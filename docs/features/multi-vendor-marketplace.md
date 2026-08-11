# Feature: vendors selling through our store

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. Money: `docs/features/commission-and-payouts.md`.

**Status:** agreed in principle, unproven
**Scope:** optional per clone — the base boots without it

## What we want

Several independent brands sell their products through one storefront. Each brand
manages its own catalogue and stock and sees only its own sales, while the customer
experiences a single shop: one basket, one payment, one order to follow. Behind
that, the order divides into one part per brand, and each part can be accepted,
made, shipped, cancelled or returned on its own without disturbing the rest.

Throughout, we call those brands **vendors**, and each per-vendor part of an order
a **consignment**.

## Why

It lets one deployment serve many vendors instead of standing up a store per brand,
and it is the part no commerce platform gives us for free. It is also where the
money and the customer promise live, so if it is wrong, nothing else matters.

## How it must work

**Onboarding.** A vendor applies or is invited. We review and approve — vendors are
selected, never self-serve. Once approved, the vendor completes its own details,
including the public-facing name and description customers will see next to its
products.

**Vendor users.** People are invited into a vendor's account by us or by the vendor,
never by signing themselves up. Because they can see customer names and delivery
addresses, they authenticate more strictly than a shopper does.

**Listing products.** The vendor creates its products, or brings them across from a
store it already runs elsewhere rather than re-typing everything. The system refuses
incomplete products: whatever we need for shipping, duties, accessibility and
returns is required before a product can even be submitted.

**Approval.** The vendor submits; we approve or send it back with a reason. Only
approved products reach customers. Afterwards, a change to something we promised the
customer — price, materials, dimensions, origin, customs information — goes back for
review. Changing stock does not.

**Limits.** A vendor may be capped on how many products it can have live at once.
The cap is enforced, and both we and the vendor can see how close it is.

**Stock.** Each vendor's stock is counted separately. Placing an order holds the
stock; cancelling releases it. The customer is told the truth about availability
when adding to the basket and again at checkout, and there is a defined path for
when the answer changes in between.

**Shopping and paying.** The customer fills one basket, which may span several
vendors, and pays once. The basket makes clear which items come from which vendor
and what that means for delivery.

**Splitting.** On payment, the order divides into one consignment per vendor. The
customer keeps one order; internally each consignment is worked separately. Where
dispatch dates differ inside a single consignment, it may split again — and still
does not become a second order.

**Fulfilling.** The vendor accepts its consignment, confirming the dispatch window.
It packs and ships using a label we generate on our own carrier account. Vendors
never book their own couriers, so we keep control of cost, tracking and the
customer's experience.

**Following the order.** The customer sees one order containing several deliveries,
each with its own status and tracking. Mixed states are normal and must read
clearly: one part delivered, one in production, one cancelled, on the same page.

**Returns.** The customer returns an individual item, not an order. We decide
whether it is eligible, where it goes, who inspects it and when the money goes back.
Return windows may differ by vendor. We stay the customer's point of contact even
when a vendor handles the physical return.

## Rules we already know

- **We are the seller.** We take the payment, own the customer relationship, apply
  the taxes and issue the refunds. Vendors supply.
- **Vendors hold and ship their own stock**, but do not arrange their own couriers.
- **A vendor sees only its own data.** Isolation is a hard requirement, not a
  filter someone remembers to apply. A vendor must never reach another vendor's
  orders, customers or performance.
- **Nothing reaches customers unapproved.**
- **The status a customer sees is worked out from the parts**, never stored beside
  them, so it can never contradict them.
- **One consignment's state never changes another's.**
- **The customer never pays twice or is charged per vendor.** One payment, always.
- Vendors join and leave, and products are discontinued often. Churn is normal
  operation, not an exception to handle later.
- Unknown: whether vendors also sell the same stock elsewhere. If they do, someone
  has to be right when two systems disagree.

## The consignment lifecycle

The minimum set of states, and what the customer is told at each. Add to it if a
clone needs more; do not collapse it.

| State | Moved by | What the customer sees |
| --- | --- | --- |
| Placed | System, on payment | One confirmation listing every part with its expected dispatch window |
| Accepted | Vendor | Nothing — the window is confirmed, not changed |
| Unfulfillable | Vendor | That part cannot be supplied; that line refunded, rest of the order unaffected |
| In production | Vendor | A lead time, shown against that part only |
| Dispatched | Vendor | Dispatch notice and tracking for that part alone |
| Delivered | Carrier | Delivery confirmation for that part |
| Cancelled | Customer or staff, before dispatch | Cancellation confirmed, partial refund against the original order |
| Return requested | Customer | Instructions and the window that applies to that vendor |
| Return received | Vendor, on inspection | Confirmation the return is being processed |
| Refunded | System | Refund confirmed, partial against the original order |

## What each audience sees

**Customer** — one shop, one basket grouped by vendor, one payment, one order with
several deliveries. Enough about each vendor to trust it, and a clear explanation of
why one order arrives as several parcels.

**Vendor** — its own dashboard: what needs action today, its catalogue and approval
status, its stock, its consignments, its labels, its returns, its statements. Its own
performance. Nothing belonging to anyone else.

**Our staff** — everything. All orders across all vendors, every consignment,
approvals waiting, exceptions to fix, vendor records, and the ability to intervene
on a customer's behalf without asking an engineer.

## When it goes wrong

- **A vendor accepts and then cannot supply.** That consignment becomes
  unfulfillable, that line is refunded, the rest of the order continues untouched,
  and the customer is told what happened to which part.
- **Stock is gone between basket and checkout.** The customer finds out before
  paying, not after.
- **The customer pays and something fails mid-split.** Either the whole order forms
  correctly or none of it does. A half-created order is never acceptable.
- **The customer pays twice, or retries.** One payment, one order, no duplicates.
- **A vendor goes quiet.** We can see it, chase it against an agreed response time,
  and cancel or reassign on the customer's behalf.
- **A vendor leaves.** Its products come down without breaking the orders it already
  has, or the history of what it sold.

## Open questions

- **Blocking — is one consignment always one vendor?** A consignment that can split
  again on differing dispatch dates says the answer is no, and that changes how
  everything downstream is counted.
- What does the customer pay for shipping when one basket becomes several parcels,
  and do we absorb the difference?
- How does a vendor's catalogue arrive: by hand, by upload, or by connecting a store
  it already runs?
- Do vendors share stock with other channels?
- Does a vendor get its own pricing, or does it sell at our prices?
- Which awkward product types must work on day one — one-of-a-kind items, made to
  order, personalised?

## How we know it works

The bar is set in `docs/plan.md`. The short version someone could check by hand: two
vendors that cannot see each other, one basket across both, one payment, two
consignments moving independently, one of them failing without harming the other,
one refund that touches only its own part — and a readable history of all of it
afterwards.

Feasibility is not yet established. The experiment: `docs/spikes/multi-vendor-order.md`.

## Out of scope

Commission, statements and paying vendors (own brief). Tax and duty calculation.
Content, search and storefront design. Anything about how a vendor's own systems
work.

## Related

- `docs/features/commission-and-payouts.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
