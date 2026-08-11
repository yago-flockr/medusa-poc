# Feature: commission, statements and paying vendors

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. The order model this sits on:
> `docs/features/multi-vendor-marketplace.md`.

**Status:** idea
**Scope:** optional per clone — ships with marketplace support

## What we want

When a customer pays once for an order spanning several vendors, we have to work out
how much of that money belongs to each vendor, keep our own commission, and pay the
vendors later — after refunds, returns and unavailable items have settled. Any
balance we ever showed a vendor must still be explainable months afterwards.

## Why

This is the half of a marketplace that cannot be worked around or added later.
Without it we get numbers nobody can reproduce, disputes nobody can settle, and
money paid out for goods that were never shipped.

## How it must work

**When the order is placed**, we work out and record what each vendor has earned,
what we keep as commission, and how shipping, discounts and fees are shared. This is
recorded as a fact at that moment. We never work it out again later from prices that
may have changed since.

**As the order progresses**, anything that moves money is recorded as a new entry
against that vendor: a refund, a return, an unavailable item, a correction someone
made by hand. Nothing is ever edited or deleted — history is added to, so the same
question always gets the same answer.

**Vendors become payable** when an agreed condition is met, not the moment the
customer checks out. We hold the money long enough for unavailable items, refunds,
returns and disputes to surface first.

**Payment runs happen on a schedule.** Each run gathers everything a vendor is owed,
subtracts anything owed back to us, and pays the difference. If a refund lands after
a vendor was already paid, it comes out of what they are owed next rather than being
clawed back.

**A vendor can see its own statement** at any time: what it earned, what commission
was taken, what was adjusted and why, what has been paid and what is still coming.

**Our staff can correct things.** Someone can make a manual adjustment with a reason
attached, approve or hold a payment run, and see why any figure is what it is —
without asking an engineer to read the data.

## Rules we already know

- **We charge the customer once**, and we hold the money.
- **Commission is a rate per vendor**, and it can differ between vendors and be
  changed over time.
- **The split is recorded when the order is placed**, as a stored fact.
- **Payments to vendors are scheduled, never immediate at checkout.**
- **A refund against one part of an order only affects that part's balance.**
- **Nothing is ever overwritten.** A correction is a new entry.
- **Every figure is reproducible and every money action is attributable** to whoever
  or whatever caused it.
- Unknown: exactly when a vendor becomes eligible — on dispatch, on delivery, or
  after the return window closes.
- Unknown: how shipping, discounts, payment fees and chargebacks are divided between
  us and the vendor. This is the specification this feature needs before it can be
  finished, and it is a commercial decision, not a technical one.

## What each audience sees

**Vendor** — its own statement and payment history, in terms it can reconcile
against its own books. Every adjustment carries a reason. It never sees another
vendor's figures, or our overall margin.

**Our staff** — the full picture per vendor and across all of them: what is owed,
what is held and why, what each payment run will pay, and the history behind any
number.

**Customer** — nothing. Commission and payouts are invisible to the customer.

## When it goes wrong

- **A refund arrives after the vendor was paid.** It reduces what they are owed next.
  If that leaves a negative balance, we can see it and decide what to do.
- **A payment run fails halfway.** No vendor is paid twice, and re-running it settles
  only what is still outstanding.
- **A chargeback lands weeks later.** It is recorded like any other movement, against
  the order it belongs to.
- **Somebody disputes a figure.** We can reconstruct exactly how it was reached, from
  the original order to the last adjustment.
- **A vendor leaves owing us money, or owed money.** Its balance and history survive
  its departure.

## Open questions

- **Blocking — how is everything divided?** Commission, shipping, discounts, payment
  fees, refunds and chargebacks each have to be attributed to someone. Until this is
  stated, this can only be built as far as a flat rate.
- **Blocking — when does a vendor become payable, and how long do we hold?**
- Do we hold back a reserve against expected returns?
- How often do payment runs happen, and does someone approve each one?
- Do vendors need documents they can hand to an accountant, or is a statement enough?
- Do vendors ever get paid in a different currency from the one the customer paid in?

## How we know it works

Part of the bar set in `docs/plan.md`. Checked by hand: place an order across two
vendors and see each one's earnings recorded immediately; run a payment cycle and see
it settle; then refund part of the order and see only that vendor's balance change,
with the original figures still visible and the reason for the change readable.

A simulated payment is enough to prove this. The point is that the numbers are right
and reproducible, not that money actually moved.

## Out of scope

Real onboarding with whoever moves the money, tax treatment of the split, invoicing,
accounting integration, and vendor statement design.

## Related

- `docs/features/multi-vendor-marketplace.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
