# Sensus Questions & Answers

The questions we sent the client, grouped by theme instead of send-order, each
paired directly with their answer. Original send-order numbers are kept in
parentheses for cross-referencing the original email thread.

## 1. Shopify Integration & Data Ownership

**1. (Q1) What exact Shopify integration scope should be estimated:** product
import only, stock sync, order sync, fulfillment status sync, returns sync,
payouts sync, or full two-way synchronization?

> Assume two-way sync as the target: product import, stock sync, order sync
> and fulfilment-status sync. This is the single most-requested feature from
> the brands, so treat it as core, not optional. Returns and payouts are
> handled Sensus-side, not synced back into each brand's Shopify.

**2. (Q2) For Shopify-connected brands, which system is the source of truth**
for product data, pricing, stock, imagery, variants, and fulfillment status?

> The brand's Shopify is source of truth for product data, imagery, variants
> and stock. Sensus owns the customer order once placed, plus curation and
> commission. Whether Sensus can override display pricing vs. inheriting the
> brand's price is one to confirm — default assumption is brand sets base
> price, Sensus curates.

**3. (Q3) Do any brands use 3PLs or external fulfillment centers,** and if
so, will the platform need to integrate with them directly?

> Yes, some brands use them (e.g. one launch brand fulfils via a 3PL
> warehouse). They generally operate through the brand's own Shopify, so
> integration is via that Shopify connection rather than direct to the 3PL.
> No direct 3PL integration assumed at launch; confirm per-brand in Phase 0.

## 2. Geography, Currency & Tax

**4. (Q6) Which countries, currencies, tax regimes, and duty-paid checkout
flows** must be supported at launch?

> UK, EU and US. GBP, EUR, USD. DDP (duties paid) shown at checkout across
> all three regions.

**5. (Q7) Is launch UK-only with EU/US-ready architecture,** or must UK, EU,
and US transactions be fully operational on day one?

> Founders to confirm. Working assumption: launch prioritises the UK, with
> EU and US as fast-follow, but architecture must be multi-region from day
> one. Please estimate on that basis.

## 3. Payments & Commissions

**6. (Q8) Which payment and payout model should be estimated:** Shopify
Payments, Stripe Connect, another marketplace payout provider, or a custom
payout ledger with manual payments?

> Customer-side via Shopify Payments (Shopify Plus is the mandated core).
> Brand payouts via a commission/payout ledger with scheduled (delayed)
> payments, so returns, refunds and chargebacks can be accounted for before
> funds are released. Exact payout timing to firm up in Phase 0.

**7. (Q9) What exact commission logic must the system support at launch:**
one global rate, per-brand rates, category-specific rates, promotional
rates, fee deductions, refunds, chargebacks, and manual adjustments?

> At launch, per-brand rates (some brands on a Launch tier, others
> Standard), applied at line level, net of refunds and chargebacks, with
> manual adjustment capability. Category-specific and promotional rates are
> later phases. Whether commission is inclusive of processing/FX fees is
> being finalised commercially. Final numbers are the founders' call.

**8. (Q10) What level of financial ledger is required:** basic payout
statements, auditable transaction ledger, reconciliation workflows,
exportable accounting reports, or full finance operations tooling?

> Auditable transaction ledger + payout statements + exportable accounting
> reports, with a per-order breakdown (sale price, commission, delivery, net
> payout) as the hero view for brands. Full finance-ops tooling and deeper
> reconciliation are later.

## 4. Shipping & Order Splitting

**9. (Q11) What shipping model should be implemented:** centrally generated
labels only, carrier-rate calculation, per-brand shipment labels,
free-shipping thresholds, absorbed shipping, or customer-paid split
shipping?

> Multi-brand basket produces multiple shipments; each brand generates its
> own label via their own Shopify/carrier. What the customer is charged
> (blended flat rate, free over a threshold, or summed parcels) is a
> commercial decision the founders will confirm — assume a simple blended
> rate with free shipping over a threshold for estimating.

**10. (Q12) Which shipping/carrier providers must be integrated at launch,**
and in which regions?

> Brands ship on their own existing carrier accounts via their Shopify. No
> central carrier mandated. If the founders later want central label
> generation we'll flag it, but don't assume it for launch.

**11. (Q13) How should multi-brand order splitting work technically:** one
Shopify order with sub-orders, marketplace-layer consignments, custom order
orchestration, or another model?

> One customer order on Sensus, split into per-brand consignments, each
> progressing independently. The RFP mandates Shopify Plus core plus a
> marketplace app, so the split runs through that layer, but the exact
> technical model is yours to propose — that's your architecture call, not
> ours.

## 5. Returns

**12. (Q14) What return flows must be supported at launch:**
customer-initiated returns, per-consignment returns, different return
windows by brand, reason-based responsibility, inspection workflows,
partial refunds, exchanges, or store credit?

> Customer-initiated, per-item / per-consignment returns, reason-based
> responsibility (fault/quality = brand or marketplace; change-of-mind =
> customer), brand-configurable windows (e.g. 14 days), and partial refunds.
> Exchanges and store credit are fast-follow, not launch.

## 6. Admin Operations & Customer Service

**13. (Q15) What operational admin tooling is required for exceptions:**
unfulfillable items, oversells, delayed dispatch, failed payments, failed
payouts, failed tax/duty calculation, failed carrier label generation, and
failed Shopify sync?

> Yes, Sensus staff must resolve routine exceptions without engineering —
> prioritise oversells, unfulfillable items, delayed dispatch, failed sync,
> and refund/payout adjustments at launch. Depth to be scoped in Phase 0,
> but the principle is no dev needed for routine cases.

**14. (Q16) What customer service actions must be available** in the admin
portal without engineering support?

> Refunds (full and partial), cancellations, return authorisation,
> order/address edits, resending notifications and manual adjustments, all
> without engineering support.

## 7. Migration & Content

**15. (Q17) What migration or initial data-loading work is required:**
initial product catalogue, brand profiles, editorial content, legal
documents, event pages, and existing mailing lists?

> No existing platform or historical orders to migrate. Initial load is:
> product catalogue (~30 brands, via the connector or spreadsheet
> templates), editorial content, legal documents and event pages at launch,
> plus importing the existing mailing list into the email platform. Note
> there are no dedicated brand-profile pages, so brand data is light
> (product-page brand block + editorial features).

## 8. Design Handoff

**16. (Q18) What exact design handoff should be assumed:** complete Figma
screens, component library, tokens, motion specs, responsive states,
empty/error/loading states, or partial coverage requiring build-side
decisions?

> On the design side, we'd be open to working with you directly. You can
> expect a complete Figma package: full screens, a component library,
> design tokens, responsive states, empty/error/loading states and a motion
> spec, roughly 14 customer-facing templates plus the house-portal and admin
> templates, handed over early-to-mid September. No build-side design
> decisions required.
