# About these documents

Reference input, not a spec for this repo. The two documents here — each kept as
both `.pdf` (for people) and `.md` (for agents) — are our first prospective
client's request for proposal and our own response to it:

- `Sensus Collective.md` / `.pdf` — Sensus Collective's RFP. Written against
  Shopify Plus as the fixed commerce core.
- `Sensus Collective - Z1 Proposal.md` / `.pdf` — our proposal back to them,
  recommending Medusa instead once Shopify proved unable to model the
  marketplace mechanics they need.

## Why they are here, and why nothing in this repo should match them exactly

This repo is a **brand-agnostic chassis**, meant to be cloned for Sensus, for
our second client (MemeTee, wanting something similar), and for whoever comes
after. Sensus is real client input worth understanding, but it is a sample of
the problem, not the problem itself: no house names, no Sensus commission
rates, no Sensus page templates, and no Shopify-specific decisions belong in
this codebase or in `docs/plan.md`.

Read these to understand *why* the chassis needs what it needs. Do not use
them as the target output. `docs/plan.md` and `docs/features/` are what this
repo actually implements — they restate what mattered from these documents in
brand-neutral language a second and third client could equally read.

## What was generalized from here into the chassis docs

- Merchant-of-record, houses-hold-stock, one-basket-many-houses,
  consignment-per-vendor order model → `docs/features/multi-vendor-marketplace.md`
- Commission, ledger, scheduled supplier payments → `docs/features/commission-and-payouts.md`
- Three separate identity domains, vendor MFA, staff RBAC → `docs/features/identity-and-access.md`
- Block-based CMS with live product embedding → `docs/features/content-and-editorial.md`
- Faceted search, taxonomy, SEO/AI-answer-engine visibility → `docs/features/search-and-discovery.md`
- Back-in-stock, waitlists, event capacity, verified reviews → `docs/features/notifications-and-capture.md`
- Geo-aware consent, propagation, audit trail → `docs/features/consent-and-privacy.md`
- Trading, curation, marketplace and operational reporting → `docs/features/analytics-and-reporting.md`
- The "prove the hard part first" bar (two vendors, one basket, split, partial
  refund, reproducible history) → **What "working" means for the marketplace**
  in `docs/plan.md`

Anything Sensus-specific that did *not* generalize (their scale, their launch
dates, their AWS cost estimates, Shopify, "houses" as a name) stays out of the
chassis on purpose. If a future client needs the actual Sensus build, that
work happens in Sensus's own repository, not here.
