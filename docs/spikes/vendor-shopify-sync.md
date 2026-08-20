# Spike: syncing a vendor's Shopify store

> Experiment, not production code. **This is the one place where "how" belongs** —
> the requirement is in `docs/features/vendor-shopify-sync.md` and says nothing about
> implementation on purpose. The direction (two-way, what syncs in, what syncs out,
> the auth model) is already settled in `docs/plan.md` Decisions; this spike is about
> whether it holds up once built, not about re-deciding it.

**Status:** not started — prior art evaluated (below), no code written yet.
**Prerequisite:** `docs/features/vendor-shopify-sync.md` (the requirement),
`docs/plan.md` Decisions (already-settled direction and auth model).

## Questions

1. Does the sync-latency double-sell race actually occur at a rate that matters —
   a sale on our marketplace and a sale on the vendor's own Shopify both succeeding
   against the same last unit before either system's update reaches the other — and
   what's the cheapest fix if it does?
2. Do independent vendors' catalogues collide on Medusa's globally-unique variant
   columns (`sku`, `barcode`, `ean`, `upc` — unique across the *whole* catalogue, not
   per product) often enough in practice to need a namespacing strategy before this
   goes live?
3. Can a re-runnable, resumable sync (product/variant/price/image/inventory in,
   inventory-decrement + order out) actually be built against Shopify's real Admin
   API without drifting the two systems apart over repeated runs?

## Prior art evaluated

Before building anything, we looked at an existing Medusa integration listed on
`medusajs.com/integrations`: `@rx-ventures/medusa-plugin-shopify-sync`. Verified
directly against the npm registry and GitHub's API (not just the marketplace listing)
before drawing any conclusion from it:

- **It's real and actively maintained** — 17 published versions between 2026-04-28 and
  2026-08-12, MIT-licensed, built for Medusa v2.13.x.
- **Its claimed source is not actually public.** `package.json` points at
  `github.com/Rx-Ventures/medusa-plugin-shopify-sync`; that URL 404s, GitHub's search
  API returns zero matches for the repo, and the `Rx-Ventures` org's two actual public
  repos are unrelated. Its own `package.json` keywords include `"internal"`. Read
  together, this looks like an agency's internal tool that ended up on public npm, not
  a maintained open-source project with an auditable history — a real concern for a
  package that would hold live vendor Shopify credentials, regardless of how well it
  otherwise fits.
- **It's also the wrong shape for this project even setting trust aside**, confirmed by
  extracting and reading the published tarball's compiled source directly:
  - Its Shopify connection is a **single config row per Medusa instance** (a literal
    singleton model) — one store, not the one-connection-per-independent-vendor shape
    this project needs.
  - **One-way only: Shopify → Medusa.** No push-back of an inventory decrement or a
    created order — exactly the direction `docs/plan.md` already decided is core, and
    the half of this feature the plugin doesn't attempt.
  - **Authenticates with a manually pasted, static Admin API access token**, encrypted
    at rest — not the client-credentials OAuth exchange Shopify now requires for a new
    integration (Shopify has stopped issuing the old `shpat_`-style token to new custom
    apps), and not the private-per-vendor OAuth install `docs/plan.md` already settled
    on.
  - **Historical order import writes raw SQL directly against order tables**,
    by its own README's admission, "because Medusa has no public Admin API for
    historical order import." This project's own rule against raw SQL / "always the
    Medusa way, no workarounds" (`agents/backend.md`) already rules that out.

**Decision:** not installed. Worth reusing as *technique*, not as code, once building
starts:
- Its resumable sync-run job-tracking model — one row per manual run holding a cursor,
  running/completed/failed/stopped status, per-page counters, and a `stop_requested`
  flag the executor checks before each page — closely matches what Medusa's own
  official migration guidance independently recommends (a job-progress model is
  required because the workflow engine can tell you a run finished, not how far a
  paginated import got).
- Its variant matching (by SKU first, falling back to a stored Shopify variant id) as
  a pragmatic default before anything more deliberate is designed for the
  cross-vendor SKU-collision question above.
- Its "structural option drift" handling — when a vendor adds a new option axis
  (e.g. a new "Quantity" variant dimension) on Shopify *after* the initial sync, it
  updates the Medusa product's options first, then backfills existing variants' option
  values from Shopify's own `selectedOptions`, falling back to skipping just that
  variant if the structural change is rejected. This is a real edge case worth
  planning for from the start rather than discovering it live.

## Approach to try first

Follow Medusa's own official Shopify-import guidance (available via the Medusa MCP
server's import-guide tool) as the base shape, adapted for our two directions and
per-vendor multiplicity:

**In (Shopify → Medusa), per connected vendor:**
- A module owning: a per-vendor connection record (store domain, encrypted
  credentials, last-synced cursor/timestamp) instead of the plugin's singleton config;
  a job-progress model (status, cursor, created/updated/failed counters, resumable);
  an image-URL → Medusa-file-record map so re-imports don't re-upload every image.
- A "start import" workflow (per vendor) that creates the job row and emits an event,
  and an "import one page" workflow that fetches, transforms and writes through
  Medusa's batch product workflow, keyed on the vendor's Shopify product id stored in
  `external_id` for idempotency.
- A subscriber that loops pages (workflow composition can't contain loops), advancing
  the saved cursor only once a page succeeds so a failed job resumes where it broke.
- Trigger: webhooks (`products/update`, `inventory_levels/update`) per connected
  vendor's store, registered at connection time — this is ongoing sync, not a one-off
  cutover, so polling or a manual button is the wrong default here.

**Out (Medusa → Shopify), on sale:** `inventoryAdjustQuantities` against the specific
vendor's store to decrement stock, plus `orderCreate`/`draftOrderCreate` so the sale
lands in that vendor's own fulfilment queue. This has no equivalent in the evaluated
plugin and needs its own workflow.

**Known gotchas to design around from the start** (confirmed against Shopify's Admin
API and Medusa's product-import DTOs, current as of this evaluation):
- Shopify prices are decimal *strings* in the shop's own default currency — never
  multiply by 100, and don't assume it matches our store's default currency.
- Medusa's batch-product input wants tag/category/type **ids**, not the
  `{ value: "x" }` shape — the latter silently drops the field rather than erroring.
- A product with no shipping-profile link or no sales-channel link breaks silently
  (unfulfillable / invisible) rather than raising an error — always resolve and attach
  both.
- Re-import should update product-level fields conservatively and avoid blindly
  pushing a variants array through the update path, since Medusa's update input
  treats an omitted variant as "delete this variant."
- `sku` / `barcode` / `ean` / `upc` are unique across the *entire* Medusa catalogue,
  not per product — this is Question 2 above, and needs a real answer (reject on
  collision, or namespace per vendor) before two independent vendors' stores can both
  connect safely.

## What counts as proof

- A vendor's real Shopify catalogue syncs in without anyone typing it, awaiting the
  same approval every manually entered product goes through.
- Running the same import twice reports zero duplicates — no repeated products,
  categories, tags or files.
- A vendor's Shopify stock and a deliberately induced webhook failure both leave the
  system in a state a human can read and resume from, not a silent drift.
- A sale placed through our marketplace visibly decrements the specific vendor's
  Shopify stock and creates an order there, without touching any other vendor's store.
- Two vendors' catalogues, synced independently, do not corrupt or block each other —
  including when their SKUs or barcodes happen to collide.
- A forced near-simultaneous sale on both sides of the same last unit produces a
  known, handled outcome (a rejected second sale, or an accepted double sale with a
  defined resolution) rather than an unhandled error or a silently wrong stock count.

## What to record here afterwards

- Whether the double-sell race actually reproduces, at what rate, and which
  mitigation was chosen.
- Whether SKU/barcode collisions across independent vendors turned out to be a real
  problem in practice, and what resolved it.
- Which parts of the evaluated plugin's technique held up once built against a real
  store, and which didn't.
- The order-container decision this depends on (`docs/spikes/multi-vendor-order.md` —
  child orders vs. consignment records) needs to land before "push a sale out as an
  order" can be wired to our own order model; note here whether that turned out to
  matter for this spike specifically.

## Results

Not started.
