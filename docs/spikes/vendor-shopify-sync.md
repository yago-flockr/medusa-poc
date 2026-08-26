# Spike: syncing a vendor's Shopify store

> Experiment, not production code. **This is the one place where "how" belongs** —
> the requirement is in `docs/features/vendor-shopify-sync.md` and says nothing about
> implementation on purpose. The direction (two-way, what syncs in, what syncs out,
> the auth model) is already settled in `docs/plan.md` Decisions; this spike is about
> whether it holds up once built, not about re-deciding it.

**Status:** in progress — read side proven against a real store (Sensus test store)
**through the actual decided auth model** (private custom-distribution OAuth app,
client-credentials grant), and now actually **writes into Medusa** too (create-only,
idempotent on `external_id`). Still untested: double-sell race, write-back direction,
pagination/resumability beyond one small page, image re-hosting.
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

**Pull direction, first read against a real store — done, via Shopify CLI rather than
custom code.** `shopify store auth --store sensus-en0h00hi.myshopify.com --scopes
read_products,read_inventory` followed by `shopify store execute` running the same
GraphQL shape `test-shopify-products-pull.ts` uses, against the actual "Sensus" test
store (org `yago-teste`). No custom app / client-credentials setup needed for this —
the CLI's own store-scoped session was enough to prove the read side. The throwaway
script and this CLI path both work; the CLI path is faster for iterating on the query
itself, the script is what will actually grow into the module once the pull is wired
into Medusa.

What the real data showed, evidence for Questions 2 and 3:

- Store currently has **3 products**, all `ACTIVE`, in USD.
- **Every variant's `sku` and `barcode` is `null`.** Question 2 (cross-vendor SKU
  collision) is moot for this specific store today — there's nothing to collide on
  yet — but that also means the importer must handle a null SKU gracefully rather
  than assuming one exists (already anticipated: `sku: v.sku || null` in the plugin
  technique borrowed above). Revisit Question 2 once a vendor's store actually has
  SKUs populated.
- `productType` and `tags` are empty on every product — the type/tag-id resolution
  step (create-or-find by name before writing the product) needs to handle "nothing
  to resolve" as the common case here, not the exception.
- Each product's `totalInventory` matched the sum of its variants'
  `inventoryQuantity` exactly (70 = 20+25+25, 15 = 5+5+5, 135 = 45+45+45) — a cheap
  sanity check worth keeping as an automated assertion once real writes happen.
- Images resolve to ordinary `cdn.shopify.com` URLs via the `media` connection as
  expected — nothing unusual to design around for the re-host-through-File-Module
  step.

Not yet exercised: the double-sell race (Question 1), and the write-back direction
(inventory decrement + order push) entirely.

**Writing into Medusa — done, first cut.** `src/workflows/sync-shopify-products/`
(pull → resolve prerequisites → filter-already-imported → `createProductsWorkflow`),
triggered by both the exec script and the admin button. Verified against the real
Sensus data:

- All 3 products created with `status: proposed` — staff approval applies exactly
  as it does for a manually entered product, no special-casing needed.
- `external_id` set to Shopify's product `gid` — confirmed idempotent by running
  twice: first run created 3/skipped 0, second run created 0/skipped 3, no
  duplicates.
- Variant prices matched the source exactly (50/55/60 USD) — confirms the
  "don't multiply by 100" caveat was handled correctly, and the shop's currency
  (`usd`) was accepted since it's one of the store's supported currencies.
- `shipping_profile` and `sales_channels` both correctly attached — the two fields
  that break a product silently (unfulfillable / invisible) if skipped.

**Known gap, deliberate for this pass:** product images point directly at
Shopify's `cdn.shopify.com` URLs rather than being re-hosted through Medusa's File
Module. Every official guidance on this (Medusa's own migration docs, the
evaluated plugin) treats re-hosting as required — a vendor's Shopify CDN URL isn't
guaranteed stable long-term, and Medusa's own image pipeline (thumbnails, etc.)
assumes files it hosts. Skipped here purely for speed; do it before this leaves
spike status.

**Credentials are per-call now, not a shared env config.** Caught mid-spike: the
first cut read `SHOPIFY_STORE_DOMAIN`/`SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET`
from env inside the shared lib itself — exactly the "one config row per app
instance" shape the evaluated plugin got flagged for above, wrong for the same
reason: each vendor gets its own connection, not one shared one. Fixed by making
`pullShopifyTestProducts`/the workflow take credentials as an explicit parameter;
the exec script now takes them as CLI args (`medusa exec ...
test-shopify-products-pull.ts <store-domain> <client-id> <client-secret>`),
falling back to env only as a local convenience. Nothing Shopify-specific is in
`.env`/`.env.template` anymore. Where credentials come from long-term (the Vendor
module, presumably) is still the open question tracked in `docs/plan.md`.

**Other simplifications, also deliberate:** create-only (an already-imported
product is skipped, never updated — safe but means a price/stock change on
Shopify won't reach an already-synced product yet); no vendor link (nothing in
the Vendor module ties these products to a Vendor record, since no vendor
onboarding happened for this test store); each product's options are created
fresh rather than resolved against the shared/filterable option rows
`create-vendor-product` uses (a step can't loop over N products inside workflow
composition, so sharing options across a whole paginated pull needs a different
shape — worth solving once pagination itself is built, not before).

**Update: create-only and no-vendor-link are resolved for real vendor-triggered
use, not just this spike workflow.** A separate, real workflow —
`src/workflows/import-vendor-shopify-products/`, triggered from the vendor
panel's own "Import products" checklist (`agents/backend.md` has the full
shape) — creates new products (linked to the vendor via
`additional_data.vendor_id`) and updates already-imported ones (matched by
`external_id`), forcing `status: proposed` on either path so staff re-approves
a re-synced product exactly like a new one. This workflow above
(`sync-shopify-products/`) stays as it was — create-only, no vendor link — 
since it's now only what the Admin debug widget calls, not a real trigger.
Variant handling on update is a full replace (Shopify's current variant set
wins entirely), not a preserve-by-identity merge — deliberate, since no
per-variant Shopify id is tracked and this store's own real variants have
null SKUs (see "What the real data showed" above), so there's no key to match
an old Medusa variant against its Shopify counterpart on a second sync.
Image re-hosting through the File Module is still deferred, same as
originally here — carried forward deliberately again, not forgotten.

## Trigger surface — corrected mid-spike

**Superseded — file paths below are stale, kept for the reasoning only.**
`src/lib/shopify-test-pull.ts` is now `src/lib/shopify-products.ts`, and the
exec script this section describes was later removed entirely in favor of a
debug-only Admin widget on the Products list page (see `agents/backend.md`).

The pull briefly had a staff-facing Admin button (`product.list.before` widget +
an `/admin/shopify-sync/test-pull` route) purely to prove the mechanics fast.
Removed once the mechanics were proven: **a staff member clicking a button to
pull a specific vendor's Shopify catalogue is the wrong long-term shape** — the
trigger belongs wherever a vendor manages *its own* Shopify connection, not on a
page staff use for every vendor's products at once. The workflow itself
(`src/workflows/sync-shopify-products/`) and its underlying pull were
unaffected and stayed — only the staff-facing front door was removed at the
time. The only remaining trigger at the time was the exec script, a developer
convenience, not a real UI.

**Resolved.** `docs/plan.md` Decisions now records the split this section
predicted: staff invites and approves the vendor; the vendor connects and
manages their own Shopify connection afterward, through a vendor panel that's
back in scope (`docs/features/vendor-shopify-sync.md` "Connecting"). Per-vendor
credentials live on the Vendor module, not a global env-var set, matching what
this spike already moved to below ("Credentials are per-call now"). Also
decided alongside it: the ongoing sync itself stays pull-triggered (vendor
login, a scheduled backstop job, and a live check at checkout) rather than
webhook-push for v1 — see `docs/plan.md` Decisions for the full shape and why.
That last piece doubles as the answer to Question 1 above: the live
checkout-time check is the actual mitigation for the double-sell race, not a
still-open question.

**Partly resolved, not by choice but by a hard constraint:** a client-credentials
custom app only installs on stores in its own Shopify organization. A real
vendor's store is never in ours, so staff cannot create the app on a vendor's
behalf — the app-creation steps have to happen vendor-side. Wrote up exactly
those steps for a vendor to follow: `docs/vendor-shopify-connection-guide.md`.

**Confirmed the real auth model end-to-end, not just the CLI shortcut above.**
Created an actual custom-distribution OAuth app (via `shopify app init` +
`shopify app deploy`, since the Dev Dashboard's plain "create app" form now
funnels into the CLI rather than offering a static-token form — matches the
Medusa import guide's caveat that Shopify has removed that path entirely), scoped
to `read_products,read_inventory`, `access.admin.direct_api_mode = "offline"`
(required since this is a server-to-server sync with no online merchant session).
One real gate worth remembering for the per-vendor rollout: a brand-new
CLI-created app has **no distribution method set**, and Shopify refuses to even
show the install-consent screen until a human sets it to **Custom distribution**
in the Dev Dashboard — a one-time, dashboard-only decision with no CLI flag.
After that, `client_credentials` token exchange returned a real `200` with a
working access token, and the exec script pulled the same real product data
through it as the earlier CLI-session test. Full step-by-step trail (useful if
this needs repeating per vendor): `SHOPIFY_SPIKE_SETUP.md` at the repo root.
