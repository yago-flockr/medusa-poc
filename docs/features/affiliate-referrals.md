# Feature: influencers referring sales

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. The order model this sits on:
> `docs/features/multi-vendor-marketplace.md`. Money:
> `docs/features/commission-and-payouts.md`.

**Status:** agreed
**Scope:** optional per clone — ships with marketplace support

## What we want

People with an audience — we call them **affiliates** — pick products from our
vendors, share them, and earn a share of whatever their audience buys. Each
affiliate has one code of their own. When an order arrives through that code, we
record permanently that it came from them, so we can show them what they sold and
pay them for it later.

An affiliate never owns a product, holds stock or ships anything. They bring
customers to products that belong to a vendor.

## Why

It is the cheapest way to bring customers to a marketplace that nobody has heard
of yet, and it costs nothing until it works. Vendors get reach they could not buy
on their own, and we only pay for sales that actually happened.

It has to be right from the first order, not added later: an order whose origin was
never recorded cannot have it reconstructed afterwards, and an affiliate who cannot
see what they sold will not keep selling.

## How it must work

**Onboarding.** An affiliate is invited and approved by us — never self-serve, the
same as vendors. Once approved they choose their own code, which has to be
unique across all affiliates and readable enough to say out loud.

**Choosing what to promote.** The affiliate browses the products vendors have live
on the storefront and marks the ones they want to promote. That choice is kept: it
is the list they work from, and the list their results are reported against. They
can stop promoting a product at any time, which changes nothing about sales already
made.

**Sharing.** For any product they promote, the affiliate gets a shareable address
carrying their code. They can also hand out the code by itself, for an audience
that types it rather than clicks.

**The customer arrives.** A customer following that address, or arriving with that
code, is remembered as having come from that affiliate. This is remembered for a
set period, not only for that visit — people browse now and buy days later, often
on a different device.

**The customer buys.** At the moment the order is placed, we record as a permanent
fact which affiliate it came from, which code was used, and what rate they were on
at the time. That record never changes afterwards, even if the affiliate later
changes their rate, changes their code, or leaves. Recording which product the
customer was originally sent to is wanted, but deliberately not in the first
version.

**The affiliate sees their results.** They see the orders they brought, which
products sold, and how much they earned. Those figures always reflect the current
truth of each order — an item that was refunded or never dispatched is not a sale.

**Paying them** is deliberately not part of this. It is the same problem as paying
vendors, and it is solved once for both.

## Rules we already know

- **An affiliate is a person, not a company.** There are no teams, no seats and no
  agency above them.
- **One code per affiliate**, chosen by them, unique, and usable anywhere on the
  storefront — not one code per product.
- **Attribution is recorded when the order is placed**, as a stored fact, with the
  rate that applied at that moment. It is never worked out again later.
- **One affiliate per order.** If a customer arrives through two affiliates before
  buying, the most recent one wins.
- **A code we do not recognise never blocks an order.** The customer buys, and no
  affiliate is credited.
- **Deactivating an affiliate stops new attributions** and changes nothing about
  orders already attributed to them.
- **Every figure an affiliate is shown is derived from the orders themselves**, so a
  refund, cancellation or unavailable item is reflected without anyone correcting
  anything by hand.
- **The rate is per affiliate** and can differ between them and change over time.
- Unknown — **whether the affiliate earns on the whole order or only on the products
  they promoted.** A customer sent to one product often buys three.
- Unknown — **how long we remember where a customer came from.**
- Unknown — **whose money the commission comes out of**, ours or the vendor's.

## What each audience sees

**Affiliate** — their own code, the products they promote, the orders they brought
and what they earned. They never see customer names or addresses, another
affiliate's figures, what the vendor earned, or our margin.

**Vendor** — their consignments as they always did. Whether a vendor is told that a
sale came from an affiliate, or which one, is an open question below.

**Our staff** — every affiliate, their codes, what each has brought in, and the
origin of any individual order.

**Customer** — nothing beyond whatever the affiliate chose to tell them. Following
an affiliate's link changes nothing about the price, the products or the checkout
unless we deliberately attach an offer to it.

## When it goes wrong

- **The code no longer exists** by the time the customer buys — the order completes
  normally and nobody is credited.
- **The affiliate was deactivated** while the customer had a basket — same: the
  order completes, no attribution.
- **The customer arrives through one affiliate and buys something unrelated.** Still
  attributed, subject to the open question about scope above.
- **The customer never arrives through anyone.** The overwhelmingly normal case;
  nothing about the order changes.
- **The order is refunded or partly cancelled.** The attribution stands — the order
  still came from that affiliate — but the figures the affiliate sees follow the
  order down.
- **The affiliate changes their code.** Old orders still show the code that was
  actually used, not the new one.
- **Two people claim the same code.** Codes are unique and taken permanently; a
  departed affiliate's code is never reissued.

## Open questions

- **Blocking — does the affiliate earn on the whole order or only on what they
  promoted?** This decides the figures and what we can honestly promise them.
- **Blocking — whose margin pays the commission, ours or the vendor's?** The
  same record either way, but a completely different consequence for vendors, who
  did not choose the affiliate.
- How long do we remember where a customer came from?
- Does an affiliate's code also give the customer something — a discount, free
  delivery — or is it invisible to the customer?
- Do vendors get any say in who promotes their products, or see which affiliate
  drove a sale?
- Can an affiliate promote a product that is later unpublished or sold out, and what
  are they told?

## How we know it works

Part of the bar set in `docs/plan.md`. Checked by hand: approve an affiliate, have
them mark a product, follow their shared address as a customer, buy that product,
and see that order appear as theirs. Then refund it and see their figures follow,
with the attribution itself untouched. Then buy the same product with no code at
all and see nobody credited.

## Out of scope

Paying affiliates — that is `docs/features/commission-and-payouts.md`, solved once
for vendors and affiliates together. Also out: clicks, conversion rates and any
analytics beyond what sold; discounts attached to a code; per-campaign or
per-channel breakdowns; affiliates applying for themselves; vendors recruiting their
own affiliates.

## Related

- `docs/features/multi-vendor-marketplace.md` — the order and consignment model
- `docs/features/commission-and-payouts.md` — how anyone gets paid
- `docs/features/identity-and-access.md` — affiliates are a new actor with a panel
- `docs/plan.md` — the settled architecture decisions behind this
