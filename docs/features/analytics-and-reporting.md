# Feature: numbers the business can actually act on

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`.

**Status:** idea
**Scope:** every clone

## What we want

The business can answer, with real numbers rather than impressions, what is
selling, whether the way we've organized the catalogue actually helps
customers find things, whether vendors are performing and dispatching on
time, and which channels bring customers worth keeping. Those answers have to
be joinable across what a customer did, what they bought, what happened to
the order afterwards, and who supplied it — not four separate reports that
cannot be laid next to each other.

## Why

A marketplace has more moving parts than a single-seller store: several
vendors, split fulfilment, commission, editorial-driven discovery. Without
numbers that connect those parts, the business is guessing about exactly the
questions that matter most — whether curation drives sales, whether a vendor
is worth keeping, whether an order is profitable once fulfilment cost is
counted. Decisions get made on anecdote instead.

## How it must work

**Behaviour, transactions, fulfilment, and vendor activity are captured as
four connected domains**, not four disconnected tools. What a customer
browsed and searched, what they bought, what happened to their order after
payment, and how the vendor behind that order is performing all have to be
answerable together — a single question ("did the editorial feature convert")
routinely spans more than one of these domains.

**Trading questions are answerable at a glance**: what is selling, at what
volume and value, how that is trending, and what the margin position looks
like once fulfilment cost is counted — not just revenue in isolation.

**Curation and merchandising questions are answerable**: which vendors
perform and which do not, whether the ways we let customers cut the
catalogue actually drive discovery or get routed around, which curated
features and editorial pieces convert, and what customers search for that we
do not currently stock — because that gap is itself a signal for what to add.

**Marketplace-specific questions are answerable**: how often a basket spans
more than one vendor and what that does to order value and fulfilment cost,
how long a newly onboarded vendor takes to reach its first sale and then a
steady state, and how editorial engagement relates to purchase.

**Operational questions are answerable**: whether vendors are dispatching
within the time we've agreed with them, where orders are being lost to stock
inaccuracy or cancellation, and what is coming back as returns, from whom,
and why.

**Acquisition questions are answerable**: which channels and campaigns bring
customers who go on to be valuable, rather than customers who buy once and
never return.

## Rules we already know

- **The four domains — behavioural, transactional, fulfilment, vendor — must
  be joinable**, not siloed in separate tools that cannot answer a question
  spanning more than one.
- **Margin, not just revenue, is a trading question** — fulfilment cost has
  to be part of the picture, not tracked separately and reconciled by hand.
- **A vendor's reporting never exposes another vendor's figures or our
  overall margin** — this inherits directly from
  `docs/features/identity-and-access.md`'s isolation rule.
- **What customers search for and don't find is tracked as a curation
  signal**, not discarded once the search returns empty.
- **Reports must be trustworthy enough to act on**, which means the
  commerce and financial figures they draw from have to agree with the
  commerce engine and the ledger, not a separately maintained copy that can
  drift.
- Unknown: which analytics or business-intelligence tooling a given clone
  uses — a `docs/plan.md` "Not decided."

## What each audience sees

**Our staff** — the full picture: trading, curation, marketplace dynamics,
operations, and acquisition, joinable across domains.

**Vendors** — their own performance only: their sales, their dispatch
record, their capacity against any cap — never another vendor's figures or
the platform's overall numbers. (Vendor-facing statements of what they are
owed are `docs/features/commission-and-payouts.md`; this brief covers
performance and activity reporting, not financial statements.)

**Customer** — nothing. Analytics and reporting are entirely internal.

## When it goes wrong

- **A number in a report disagrees with the commerce engine or the ledger.**
  The commerce engine and ledger are right; the report is what needs fixing,
  and the disagreement itself should be visible rather than silently
  resolved by picking one.
- **A vendor's own numbers are somehow visible to another vendor** through a
  shared report or dashboard. This is treated as a data-isolation failure,
  not a reporting bug — see `docs/features/identity-and-access.md`.
- **Data from one domain arrives late or fails to join** (a fulfilment event
  that never reconciles with its order, for example). The gap is visible in
  the reporting itself, not silently dropped from the total.

## Open questions

- Which analytics and business-intelligence tooling this clone uses.
- How real-time these numbers need to be — same-day operational reporting
  versus next-day trading reporting may have different bars.
- How long historical data is retained for reporting once it ages out of
  operational relevance.

## How we know it works

Checked by hand: a question that spans two domains ("did this editorial
feature drive purchases from new customers") can actually be answered from
the data, not approximated by cross-referencing two separate tools by hand.
A vendor's own dashboard shows only its own figures. A trading number
(revenue, margin) matches what the commerce engine and ledger independently
say for the same period.

## Out of scope

Which specific analytics or BI tool is used. Vendor financial statements
(what they are owed): `docs/features/commission-and-payouts.md`. Real-time
alerting on operational failures: covered by the "Operations we can run
without engineers" capability in `docs/plan.md`, not this brief.

## Related

- `docs/features/commission-and-payouts.md`
- `docs/features/identity-and-access.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
