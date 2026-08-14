# Feature: staying in touch when a customer isn't ready yet

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`.

**Status:** idea
**Scope:** optional per clone

## What we want

A customer who wants something we cannot sell them right now — an item that
is out of stock, a vendor that hasn't launched yet, a spot at an event with
limited capacity — can leave their interest with us instead of leaving the
store, and gets told the moment that changes. A customer who bought something
can tell other customers what they thought of it, in a way that is honestly
labelled as coming from someone who actually bought it.

## Why

The moment a customer wants something we cannot currently give them is the
moment we are most likely to lose them for good, unless we give them a way to
wait that costs them nothing and rewards them for it. And a customer deciding
whether to trust an unfamiliar product benefits more from another customer's
honest word than from more of our own copy.

## How it must work

**A customer signs up to be told when something becomes available** — an
out-of-stock product, or a vendor whose first products haven't launched yet.
That interest is checked against real stock and real launch state as it
changes, not on a fixed schedule that might miss the moment, and the customer
is told promptly when it does.

**A customer reserves a place at an event with limited capacity.** The
platform tracks how many places are left in real time, refuses a reservation
once capacity is reached, and confirms the ones that succeed.

**A customer who bought a product can leave a review of it**, and that review
visibly carries whether it came from a verified purchase. A review is not
just free text appended to a product page — it is something a future customer
can trust more than anonymous copy precisely because we can back up that the
reviewer actually bought the thing.

**Newsletter and general contact-form capture** happen the same way as the
above: a customer hands over a small amount of information in exchange for
something specific (updates, a reply, an answer), and that handoff respects
whatever consent rules apply at the moment of capture.

## Rules we already know

- **A waitlist signup is checked against real, current stock or launch
  state** — never a cached or delayed answer.
- **Event capacity is enforced, not advisory** — a reservation past capacity
  is refused, not silently accepted and sorted out later.
- **A review's verified-purchase status is derived from an actual order**,
  never self-declared by the reviewer.
- **All capture (waitlist, newsletter, contact, reservation) is subject to
  the same consent rules as anything else that stores a customer's
  information.**
- **Public capture forms need abuse protection** — a form open to the
  internet without it becomes a spam or scraping vector, not a feature.
- Unknown: whether waitlist and back-in-stock notifications are sent by an
  external messaging platform or handled here — a `docs/plan.md`
  "Not decided" (who sends email).

## What each audience sees

**Customer** — a way to wait for something instead of losing interest, a
clear confirmation when a reservation succeeds or a waitlist signup is
recorded, and reviews they can weigh by whether the reviewer actually bought
the thing.

**Vendor** (where relevant) — visibility into demand for its own out-of-stock
products, since a long waitlist is itself useful information about what to
restock.

**Our staff** — visibility into capture volume and event capacity, and the
ability to moderate a review if it needs it.

## When it goes wrong

- **A waitlisted product comes back in limited quantity.** Notified
  customers are not all guaranteed a unit just by being told — the
  notification is an invitation to buy, not a hold on stock, unless a clone
  explicitly decides otherwise.
- **An event fills up while someone is mid-reservation.** They are told the
  event is full before payment or confirmation, not after.
- **A review is left for a product the reviewer never bought.** It cannot
  carry verified-purchase status, and should be distinguishable from ones
  that can.
- **A capture form is targeted by abuse (spam signups, scraping).** It
  degrades gracefully — rate-limited or challenged — without needing to be
  taken down.

## Open questions

- Does a back-in-stock notification reserve stock for the notified customer,
  or is it first-come-first-served once notified?
- Is review moderation required before a review is visible, or does it
  publish immediately and get removed only on report?
- Which messaging platform actually sends these notifications — a
  `docs/plan.md` "Not decided."

## How we know it works

Checked by hand: signing up for a back-in-stock alert on an out-of-stock
product and then restocking it triggers a notification without manual
intervention. Reserving the last place at an event succeeds, and the next
attempt is refused. A review left by someone who bought the product is
visibly marked verified; one left by someone who didn't, is not.

## Out of scope

Which messaging or email platform sends notifications. Review moderation
tooling design. Loyalty or rewards programs.

## Related

- `docs/features/consent-and-privacy.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
