# Sensus RFP vs Medusa: feasibility and delivery phasing

Living document. Product outcomes: `sensus.md`. Platform: Medusa (ADR 0001).  
**Delivery split below is proposed** (engineering recommendation for a December-constrained launch). Confirm with Sensus / AndMelo before treating as committed scope.

---

## Bottom line

Almost nothing in the RFP is physically impossible on Medusa. We **cannot** deliver the full RFP as a non-MVP by ~1–5 December. We must ship a **credible Launch (v1)** that proves the marketplace, and put the rest in **v2**.

Largest risk: **one basket, many houses**. That is P0. Everything else is secondary until the two-house spike passes.

---

## Importance order (what to protect first)

If the calendar slips, cut from the bottom of this list, never from the top.

1. **Marketplace core** — multi-house cart → one payment → per-house consignments → house can fulfill → partial refund path
2. **Sell in one market** — UK-first checkout that takes real money (test → live)
3. **House can operate** — minimal portal: see orders, update stock, mark dispatch (label print if ready)
4. **Staff can operate** — admin: houses, products, orders, basic curation (cap / approve)
5. **Customer storefront that matches brand enough to launch** — shop, PDP, basket, checkout, account, legal
6. **Discovery polish** — taxonomy, Journal, search merch, events
7. **Growth / secondary** — reviews, waitlist, Shopify import, full analytics, AI assistant, full DDP theatre

---

## Definitions

| Release | Target | Meaning |
| --- | --- | --- |
| **P0 spike** | ASAP (before heavy UI) | Two houses, one multi-house order, split, pay, fulfill, partial refund, commission calculated. Fail = wrong approach. |
| **Launch / v1** | Build to ~1 Dec, public ~5 Dec if P0 green | Credible curated marketplace for holiday pop-up: buy, multi-house fulfill, staff + house ops. Explicitly **not** full RFP. |
| **v2** | Post-launch | RFP completeness: rich CMS, advanced search, full consignment UI, payouts automation, connectors, analytics, multi-market DDP, AI, etc. |

---

## Launch / v1 — must deliver

Ship these or do not call it a Sensus marketplace launch.

### P0 gate (blockers; no “pretty storefront first”)

- [ ] House entity (vendor) linked to products
- [ ] Cart grouped by house (UX + data)
- [ ] Checkout: **one payment**, order splits into **one consignment per house**
- [ ] Consignment states for launch (minimum set): Placed → Accepted (or auto) → Dispatched → Delivered; plus Unfulfillable / Cancelled with **partial refund**
- [ ] Customer order detail shows per-consignment status (even if simple)
- [ ] Commission rate per house stored; commission **visible** on a house/admin statement (batch payout automation can be manual in v1)
- [ ] Spike written up; ADR 0002 updated to accepted or revised

### Commerce and markets

- [ ] Medusa catalogue, regions; **UK as selling market** at launch
- [ ] Payment provider (e.g. Stripe) on Medusa Cloud or staging→prod
- [ ] Customer auth: email/password (passwordless → v2)
- [ ] Tax: workable UK VAT path; full DDP for EU/US → v2 / stretch
- [ ] Shipping charge: implement **one** chosen policy (TO CONFIRM); keep code pluggable

### Surfaces (thin but real)

**Storefront (customer)**

- [ ] Home, shop / PLP, PDP (with About the House block), basket (by house), checkout
- [ ] Account: login, register, order history, order detail (multi-consignment)
- [ ] Static: About, How Curation Works, Contact, legal/service template, 404
- [ ] Join as House: form → stored lead (full pipeline UI can be admin-simple)
- [ ] Cookie banner UI + basic consent (geo-perfect CMP → v2)
- [ ] SEO basics: titles, canonical for main templates, Product JSON-LD
- [ ] WCAG AA on critical paths (checkout, auth, basket); full matrix → ongoing

**House portal (minimal)**

- [ ] Invite-only login; **structural** isolation (no cross-house data)
- [ ] Dashboard: orders needing action
- [ ] Orders list + detail; mark Unfulfillable / Dispatched; tracking number field
- [ ] Product list + stock edit (upload polish → stretch/v2)
- [ ] MFA → strongly preferred for launch if time; else hard requirement early v2
- [ ] Print **central** shipping label → stretch if carrier integration slips; must have documented manual ops fallback for v1

**Admin (staff)**

- [ ] Medusa Admin + extensions: houses CRUD, product cap per house, order overview across houses
- [ ] Application leads list (from Join form)
- [ ] Returns: basic (initiate / mark received) even if not full RFP matrix
- [ ] Homepage: editable enough to launch (CMS-lite or admin-managed modules; full block CMS → v2)

### Ops

- [ ] ~30 houses supportable by process (invite, onboard fields for About block)
- [ ] Deploy: Medusa Cloud (or agreed host); env secrets; monitoring on order/payment failures
- [ ] Hypercare plan (people/process), even if short

---

## Launch / v1 — stretch (only if P0 green and calendar allows)

Do not start these before P0. Drop first under pressure.

- Central label API (EasyPost / ShipStation) in house portal
- House MFA
- EU and/or US selling with clearer duty messaging (still not full DDP theatre)
- Occasion / mood / region **filters** on PLP (URL state) without full CMS landings
- House directory → filtered PLP
- Wishlist (simple)
- Newsletter capture wired to ESP
- Image CDN transforms
- Richer admin curation queue
- Design-system fidelity after Figma mid-stream (gap-fill allowed)

---

## v2 — explicitly post-launch

These need more time. They stay in the RFP vision; they are **not** Launch commitments.

### Marketplace depth

- Full consignment state machine UI (In production, Return requested/received, etc. as in RFP table)
- Consignment split by dispatch date inside one house
- Automated payout batch + statements UX
- Per-house capacity / cap enforcement with strong UX
- Returns windows differing by house, full partial-refund matrix polished
- Stock freshness policy hardened (add-to-cart + checkout) with defined failure UX

### Content and discovery

- Block CMS: Journal, modular home, preview deployments, **live product embeds** add-to-basket
- Full occasion / mood / region landing pages as CMS + commerce
- Search: typeahead, facet counts, zero-result, did-you-mean, pinned rails (Algolia/Typesense/…)
- Pop-up events: reservation + capacity
- Reviews with verified purchase
- Back-in-stock / waitlist + lifecycle messaging
- Advanced SEO: facet canonical rules, index-split sitemaps at scale, LLM/agent-oriented terms pages

### Integrations and growth

- Shopify catalogue **import connector** for houses
- Full DDP presentation UK + EU + US where achievable
- Consent: granular, auditable, geo opt-in/opt-out, propagated to server and third parties
- Analytics warehouse answering RFP §08 (trading, curation, marketplace dynamics, ops, acquisition)
- AI assistant beyond shell (RFP already Phase 2)
- Passwordless auth
- House profile pages if product decides they exist

### Quality bar

- WCAG 2.2 AA audit across all three surfaces and breakpoints matrix
- Design motion spec fully implemented
- Year-two run-cost optimisation / bring-in-house path

---

## Feasibility buckets (platform reality)

### CAN (path clear on Medusa + normal providers)

- Catalogue, regions/currencies, cart, checkout, payments, customers, admin extensions, Next storefront, Cloud/self-host
- Invite-only houses, churny catalogue
- Most single-merchant storefront templates; SEO/a11y as build work
- AI assistant **shell** only at launch

### MAYBE (custom marketplace / providers; spike required)

- Multi-house order split, consignments, commission, payouts, house portal isolation, central labels
- CMS + live embeds, advanced search, DDP, reviews, waitlist, Shopify connector, full analytics, consent mesh

### CAN'T (as written without cut or delay)

- Entire RFP complete by December
- Out-of-the-box Medusa marketplace equal to RFP “marketplace layer”
- CMS owning price/stock; custom code on raw cards; isolation only in the UI
- Shopify Plus as commerce core (superseded by ADR 0001)

---

## Decision log for this phasing

| Topic | Launch / v1 assumption | Revisit |
| --- | --- | --- |
| Markets | UK-first (`gb` / GBP); EU + US regions seeded for localization | See `docs/markets.md` / ADR 0007 |
| Shipping charge | One policy, pluggable | RFP TO CONFIRM |
| Payouts | Visible commission; payout may be ops-assisted | Automate in v2 |
| Labels | Manual fallback allowed if API late | Stretch → v2 |
| CMS / Journal | Lite or deferred | v2 |
| Search | Basic listing filters OK; Algolia-class later | v2 |
| AI | Shell / placeholder only | v2 (RFP) |

When stakeholders confirm this split, accept **ADR 0006** and tick items in Launch checklists during delivery.

---

## How to use this doc

1. Plan sprints from **Importance order** and **Launch must deliver**, not from raw `sensus.md` length.
2. After the P0 spike, move MAYBE items to CAN or slip them to v2 with a date note.
3. Do not pull v2 into Launch without explicitly dropping something of equal size.

Related: `docs/adr/0002-merchant-of-record-multi-vendor.md`, `docs/adr/0006-launch-v1-vs-v2-scope.md`, `agents/overview.md`.
