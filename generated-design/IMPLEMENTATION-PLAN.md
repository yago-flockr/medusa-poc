# Stitch designs → storefront implementation plan

Four Stitch screens in this folder, mapped onto `apps/storefront`.

| Folder                                         | Screen                  | Existing route                      | Existing code to restyle    |
| ---------------------------------------------- | ----------------------- | ----------------------------------- | --------------------------- |
| `atelier_dition_curated_editorial_home`        | Home                    | `(main)/page.tsx`                   | `modules/home/components/*` |
| `atelier_dition_purified_editorial_catalog`    | Catalog / "The Archive" | `(main)/store/page.tsx`             | `modules/store/*`           |
| `atelier_dition_essential_editorial_pdp`       | PDP                     | `(main)/products/[handle]/page.tsx` | `modules/products/*`        |
| `atelier_dition_minimalist_about_us_manifesto` | About / manifesto       | **none — new route**                | —                           |

## Status

- **Phase 0 (foundation) — done.** Playfair Display swapped in, `--font-heading` repointed at `--font-serif` (it aliased `--font-sans`, which is why nothing rendered serif), light and dark themes retinted, `--radius: 0rem`.
- **Phase 1 (shell) — structurally done**, with three design details unmet, all traceable to Open question 1/2: nav links render sentence-case rather than uppercase micro-type, and the footer newsletter is a filled `InputGroup` box rather than an underline-only field. Search icon, footer legal links and the city list are deliberately omitted (no routes behind them).
- **Phase 2 (home) — done.** Hero, product card, curated shelf, editorial monograph, maisons registry, private salon band.
- **Phase 3 (catalog) — done.** Editorial header, filter bar (existing sheet kept), 3-up grid at 9/page with a results line.
- **Phase 4 (PDP) — done.** Breadcrumb, two-column layout, selectable gallery, maison eyebrow, hairline accordions, "More from this maison" scoped to the vendor.
- **Phase 5 (about) — done.** New `/about` route + nav link, built from the three static sections.

**All five phases are implemented.** What remains is the punch list below, not new phases.

Dev servers are Claude's to run and keep alive (backend `:9000`, storefront `:8000`); Yago does not run a second pair.

## Hard rules for this work

### 1. Use our components as they are — never override their styles

The designs are implemented with **the shadcn components already in `src/components/ui/`**. A design's visual treatment differing from ours is never a reason to build a parallel component, and never a reason to re-style an existing one at the call site.

- A component is used **as it is**, with its own variants. `<InputGroup>`, not `<InputGroup className="h-auto rounded-none border-0 border-b bg-transparent">`. Importing the right component and then rewriting its height, radius, borders or background through `className` is producing a different component at the call site — the same violation as writing a new one.
- If a component's look is wrong for the _whole app_, the fix belongs in the **token layer**, where it applies everywhere. Never in one caller's class string.
- No new `cva` variants in `components/ui/*`.
- A primitive the app genuinely **lacks** may be added, as a real wrapper around a `@base-ui/react` primitive following the convention in `agents/storefront.md`. A primitive the app **has** is reused.
- **Before proposing any new component, list `components/ui/` and find the one that already fits.** That inventory is done below and comes out clean.

### 2. Use the scale — no arbitrary values

Bracketed values are the tell-tale sign of bypassing the design system.

| Never                                               | Always                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `text-[10px]`, `sm:text-[11px]`                     | `text-xs`                                                    |
| `tracking-[0.24em]`, `tracking-[0.2em]`             | `tracking-widest`                                            |
| `mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16`     | `container` (defined in `src/styles/tailwind/utilities.css`) |
| `bg-foreground text-background` for an inverted bar | `bg-primary text-primary-foreground`                         |

Matching a Stitch mock pixel-for-pixel is explicitly **not** worth breaking the scale for. If the scale genuinely lacks a value, that is a conversation about the token layer, not a bracket at the call site.

### 3. Every element in these designs maps to a component we already own

| Design element                 | Screen       | Component                                               |
| ------------------------------ | ------------ | ------------------------------------------------------- |
| Nav links + dropdowns          | all          | `navigation-menu.tsx`                                   |
| Mobile menu                    | all          | `sheet.tsx`                                             |
| Newsletter capture             | footer       | `input-group.tsx`                                       |
| CTAs, "Add to bag", text links | all          | `button.tsx` (`default` / `outline` / `link`)           |
| Breadcrumb                     | PDP          | `breadcrumb.tsx`                                        |
| Size chips                     | PDP          | `toggle-group.tsx` (single-select)                      |
| Colour swatches                | PDP          | `toggle-group.tsx` or `radio-group.tsx`                 |
| Quantity stepper               | PDP          | `number-field.tsx`                                      |
| "Details & Care" / "Shipping"  | PDP          | `accordion.tsx` (already in use)                        |
| Gallery thumbnails             | PDP          | `carousel.tsx` if it needs to scroll, else plain markup |
| Stock dot / sale flag          | PDP, catalog | `badge.tsx`                                             |
| Filter dropdowns               | catalog      | `select.tsx` / `dropdown-menu.tsx`                      |
| Mobile filter drawer           | catalog      | `drawer.tsx` (already in use)                           |
| Pagination                     | catalog      | `pagination.tsx`                                        |
| Hairline rules                 | all          | `separator.tsx`                                         |
| Maison registry cards          | home         | `card.tsx`                                              |
| Curator avatar                 | home         | `avatar.tsx`                                            |
| Loading states                 | all          | `skeleton.tsx` (already in use)                         |

**Nothing in these four designs requires a component we do not already have.** If a step seems to need something new, that is the signal to re-check this table, not to build it.

The same reuse rule applies to `src/store/modules/common/components/` and `src/components/display/` — `ThumbnailCard`, `DataState`, `InfoList`. An overlay image card is `ThumbnailCard`, not a second one.

### 4. One component, one job

- A component does **one** thing. A popover is a popover — it does not also contain a list, a summary, or an empty state. The cart refactor is the reference: `CartList` (items), `CartSummary` (totals + CTA), and the popover that composes them.
- **A component that receives a collection owns its own empty state** — `CartList` gets `items`, so it renders the empty message itself. A component that receives only scalars has no basis to judge emptiness, so its caller decides whether to render it at all.
- Extract a sub-component rather than nesting a big block inside a `.map()`.

### 5. Props are explicit

- Pass the **fields a component uses**, never a whole entity for it to reach into: `subtotal={cart.subtotal} currencyCode={cart.currency_code}`, not `cart={cart}`.
- An **array/collection prop is fine** (`items={cart.items}`) — that is the component's actual subject, not an object being blindly handed over.
- The boundary: two or three fields → list them. Most of the entity → pass the object (`CartListItem` takes a whole `item`; six scalars would be worse).
- Every component's prop type **extends the `ComponentProps` of the element it renders**, and spreads the rest onto that root. `{...props}` goes **last**.
- **No prop drilling.** A component must never receive a prop it does not itself use. The component that needs data fetches it — `retrieveCart()` in `Nav`, not threaded down from the layout. Next dedupes identical fetches within a render pass, so colocated fetching costs nothing.

### 6. Placement: how many things import this?

One → it lives next to that one, as a sibling file. More than one → it moves up to the shared folder. A single-use component in a shared `components/` folder advertises reuse that does not exist.

### 7. Server-rendered, always

`store/` is server-rendered — that is fixed in `docs/plan.md` ("Discovery matters too much to ship a client-rendered store"). **No TanStack Query in `store/`**; it is client-side fetching and the opposite of SEO-friendly. Mutations go through server actions + `revalidateTag`, which `store/lib/data/*.ts` already does. TanStack Query stays in `vendor/`, which is behind auth.

A client component is a decision to justify. Any component using `useState`/`useEffect`/`usePathname` **must declare `"use client"` itself** — do not rely on a client parent, or it breaks the moment a server component imports it. (This exact bug was live in `DeleteButton` and only surfaced when `CartList` was pulled into the server nav.)

### 8. One step at a time

Each step below is sized to be written, looked at in the browser, and only then followed by the next. Do not batch. Verify each against the matching `screen.png` before moving on.

### 9. Content is data, not JSX

Any vendor/collection/category name, description or hero image comes from the `storefront_content` linked module — never hardcoded, never read off a core entity's native field.

### 10. No comments

Default to zero. If a WHY genuinely cannot be recovered from the code, it gets 1–2 lines maximum.

## Design system extracted from the four files

All four Stitch configs agree on the core palette, so it is one theme, not four.

**Fonts:** Playfair Display (serif, display/headings) + Inter (sans, body/UI). The app currently ships Inter + **Instrument Serif** — the serif has to change.

**Palette** (hex from Stitch → oklch for our tokens):

| Token                      | oklch                         | hex       |
| -------------------------- | ----------------------------- | --------- |
| `--background`             | `oklch(0.9825 0.0057 84.57)`  | `#FBF9F5` |
| `--foreground`             | `oklch(0.2074 0.0062 56.02)`  | `#1A1715` |
| `--card`                   | `oklch(0.9615 0.0098 87.47)`  | `#F5F2EB` |
| `--secondary` / `--muted`  | `oklch(0.9432 0.0111 89.72)`  | `#EFECE4` |
| `--muted-foreground`       | `oklch(0.5550 0.0142 75.28)`  | `#78726A` |
| `--border` / `--input`     | `oklch(0.9048 0.0145 84.58)`  | `#E4DFD5` |
| `--accent`                 | `oklch(0.9106 0.0157 86.43)`  | `#E6E1D6` |
| `--ring` (ochre champagne) | `oklch(0.6079 0.0676 67.55)`  | `#9E7B56` |
| `--success`                | `oklch(0.4299 0.0459 149.04)` | `#3E5742` |
| `--destructive`            | `oklch(0.4587 0.1084 27.98)`  | `#8A3C34` |
| `--warning`                | `oklch(0.5937 0.1032 68.90)`  | `#A67232` |

The ochre accent (eyebrow labels, the italic half of the logo, dark-section CTAs) has no dedicated slot and doesn't get one — Stitch's own config already maps it to `ring`, so `--ring` carries it.

**Recurring type/layout idioms across all four screens:**

- Eyebrow label: `text-[10px] uppercase tracking-[0.2em]` sans, in `muted-foreground` or ochre.
- Headings: Playfair, regular weight, generous leading — never bold.
- Radius is effectively **0** on cards, images, inputs and buttons. `--radius` is `0.375rem` today; the whole look depends on squaring it off.
- Product images are a tall portrait crop (~3:4), edge to edge, no rounding, no shadow.
- Section rhythm is wide vertical padding on a `max-w-[1600px]` container with `px-16` desktop gutters — wider than the current `container`.

## Order of work, and why

Tokens first (one file, changes all four screens at once), then the shell (nav/footer appear on every screen), then **home → catalog → PDP → about**.

Home leads because it sets the brand and is the page most worth looking at early. The **product card** is the one cross-phase dependency — the home shelf, the catalog grid and the PDP related row all render it — so it is built as Step 2.2, inside the home phase, before its first consumer, and the later phases just use it. About is last: a brand-new route with no existing code and no dependency on anything else.

---

## Phase 0 — Foundation ✅ done

### Step 0.1 — Swap the serif font

`src/app/layout.tsx`: replace `Instrument_Serif` with `Playfair_Display` (weights 400/500/600, normal + italic), keeping the `--font-serif` variable name.
`src/styles/tailwind/configs.css`: point `--font-heading` at `var(--font-serif)` — today it aliases `--font-sans`, which is why nothing currently renders as a serif despite `font-heading` being used all over.
**Verify:** any existing `font-heading` heading (home hero, catalog hero) renders in Playfair.

### Step 0.2 — Retint the light theme

`src/styles/theme/colors.css`, `:root` block only. Apply the table above and set `--radius: 0rem`.
**Verify:** whole store turns warm parchment, corners go square. Nothing else touched yet, so some spacing will look wrong — expected.

### Step 0.3 — Dark theme

**Decided: retinted `.dark` to espresso** (`oklch(0.1747 0.0052 67.47)` ground, parchment text) rather than forcing light-only, so a system-dark visitor doesn't get stock neutral grey next to the warm light theme. One block in `colors.css` to revert if you'd rather go light-only.

> Housekeeping: `src/app/layout.tsx:28-32` loads the tweakcn live-preview script. Useful while iterating tokens in 0.2/0.3 — remove it once the palette is committed.

---

## Phase 1 — Shell (nav + footer, visible on every screen) ✅ done

### Step 1.1 — Announcement bar

New, above the nav in `(main)/layout.tsx`: full-width `foreground` bar, centred uppercase micro-copy, `tracking-[0.24em]`. Static copy for now.
**Verify:** bar sits above the sticky nav and does not scroll with it.

### Step 1.2 — Nav (done — see Decisions)

`modules/layout/templates/nav/index.tsx`. Current nav is left-menu / centre-logo / right-actions at `h-16`. Target is **left logo, centre nav links, right icons** at `h-20`, on `background/95` with `backdrop-blur`, one hairline bottom border.

- Logo: "ATELIER" in Playfair + the second word in Playfair italic ochre — plain text, not the Stitch inline SVG.
- Centre links: uppercase `tracking-[0.15em]` sans; the active section carries a thin underline.
- Keep the existing `NavigationMenu` dropdowns for Categories/Collections/Vendors and the existing mobile `Sheet` — restyle only.
- Right: search, account, bag-with-count. Keep `CartDropdownServer` in its `Suspense`.
  **Verify:** desktop and mobile (≤400px) against the home screenshot; dropdowns and the cart sheet still open.

### Step 1.3 — Footer

`modules/layout/templates/footer/index.tsx`. Target: brand blurb + newsletter input on the left, then three link columns, then a bottom bar with legal links and city list. The current 2/4-column grid and the `FooterSection`/`FooterLink` helpers survive; the newsletter input and bottom bar are new.
Column headings are ochre eyebrows. The newsletter field is `input-group.tsx` — the existing input styled underline-only (border-bottom, no box) with an inline "Subscribe" `Button variant="link"`. Not a new component.
**Verify:** all four screenshots show the same footer — it should now match each.

---

## Phase 2 — Home (`curated_editorial_home`) ✅ done

Most bespoke of the four: five sections, three with no equivalent today. Built first because it is the page that sets the brand, and because the product card it needs is reused by every later phase.

### Step 2.1 — Hero ✅ done

`modules/home/components/hero`. Full-bleed editorial image (`/editorial/hero-banner.png`) with a scrim, ochre eyebrow, large serif headline, two CTAs.

**How inverted sections are done, and the pattern for every dark band after this:** put `dark` on the section's root. `colors.css` already defines `.dark { --background: … }`, so the whole subtree resolves to the dark palette and `Button` needs no props at all to come out light-on-dark. No `className` overrides, no new variants — the inversion is pure token resolution. The second CTA is `variant="secondary"` (a filled dark button), not `outline`, which washes out over a photo.

### Step 2.2 — Product card

`modules/products/components/product-preview/index.tsx` + `thumbnail.tsx`. **The most reused piece in the whole design** — the home shelf, the catalog grid and the PDP related row all render it, so it is built here, before its first consumer.
Target, top to bottom: tall portrait image (no radius, subtle zoom on hover), ochre uppercase **maison/vendor eyebrow**, serif product title, price with strikethrough original when on sale.
`PreviewPrice` already handles the sale strikethrough. The vendor eyebrow does **not** have data yet — see Data gaps.

### Step 2.3 — Curated shelf

`modules/home/components/featured-collections`. Header is a curator `avatar.tsx` (`/editorial/curator-portrait.png`) + name, a serif collection title, a pull-quote, and a "VIEW ALL n EDITS →" link; below it a four-up row of Step 2.2 product cards. Today it renders `ThumbnailCard` collection tiles — the curator attribution is new.

### Step 2.4 — Editorial monograph

New section: image left (`/editorial/monograph-detail.png`), text right — eyebrow, serif heading, two paragraphs, a three-up stat row (`14.8 µm` / `480 gsm` / `100%`) and an underlined "read more" link. Entirely new; no data model backs the stats.

### Step 2.5 — Maisons registry

`modules/home/components/featured-vendors`. Four numbered `card.tsx` cards (`01`–`04`) with city label, serif vendor name, ochre eyebrow, a short description and a "COLLECTION 2026 →" link. `Vendor` + its `storefront_content` (name, description) covers most of this; **city and the numbered ordering have no field**.

### Step 2.6 — Private salon band

New dark band above the footer (same `dark`-subtree technique as Step 2.1): ochre eyebrow, serif heading, copy, and an email capture (`input-group.tsx` + `Button`, same pair as the footer) with a "REQUEST SALON ENTRY" action, over a large ghosted watermark word. Static copy; the form posts nowhere for now — say so rather than wiring a fake success.

`FeaturedCategories` has no home in this design — confirm whether it is dropped or moves elsewhere.

---

## Phase 3 — Catalog (`purified_editorial_catalog`) ✅ done

The product card already exists by now (Step 2.2) — this phase is the page around it.

### Step 3.1 — Catalog header

`modules/store/components/catalog-hero`. The design drops the image hero entirely: eyebrow "COLLECTION FOLIO", large serif title, one line of description, and a right-aligned piece count. Existing `CatalogHero` takes `imageUrl` and renders a dark gradient block — for `/store` it should render the flat editorial variant.
Category and collection pages reuse this component **and do have hero images** in `storefront_content`. Decide whether the image hero stays for those two routes or the flat header applies everywhere. **See Open questions.**

### Step 3.2 — Filter bar ✅ (drawer kept — see Decisions)

`modules/store/components/catalog-filter-bar`. Target is a single hairline row: left-aligned dropdown triggers (`MAISON: ALL`, `SIZE`, `PALETTE`, `PRICE`), right-aligned `SORT: FEATURED`. Today it is category pills + a "Filters" drawer button + sort.
Keep the existing `drawer.tsx` for mobile; on desktop surface the option pickers as inline dropdown triggers using `select.tsx` (or `dropdown-menu.tsx` for the multi-select facets). Both already exist — nothing new here.
The "MAISON" filter needs vendor faceting the API doesn't expose yet — ship the row with the filters that do exist and leave maison out rather than faking it.
The sort trigger currently renders the raw column name `created_at` — give it a human label while here.

### Step 3.3 — Grid and pagination

`modules/store/templates/paginated-products.tsx` + `components/pagination`. 3 columns desktop / 2 tablet / 1 mobile, wide gutters. Pagination becomes "SHOWING 1–9 OF 24" on the left and numbered pages + "NEXT →" on the right, built with `components/ui/pagination.tsx` (`PaginationContent` / `PaginationLink` / `PaginationNext`) — the current `modules/store/components/pagination` should compose it rather than re-implement it. The design shows **9 per page**; `PRODUCT_LIMIT` is 12 — match the grid to a multiple of 3.

### Step 3.4 — Bespoke-inquiry band — **dropped**

Built, then removed at Yago's request to simplify the page. The design shows it; we don't ship it.

---

## Phase 4 — PDP (`essential_editorial_pdp`) ✅ done

### Step 4.1 — Two-column layout

`modules/products/templates/index.tsx`. Today it is a three-column split (info | gallery | actions) with two sticky rails. The design is **two columns**: gallery left (~60%), one continuous info+actions rail right (~40%), sticky. Restructure the template first, before touching what's inside it.
**Verify:** columns and sticky behaviour correct with the current unstyled contents.

### Step 4.2 — Breadcrumb

`STORE / OUTERWEAR / PRODUCT` above the columns, uppercase micro-type, using `components/ui/breadcrumb.tsx`. Derive the trail from the product's category — no new data needed.

### Step 4.3 — Gallery

`modules/products/components/image-gallery`. Target: one large square-cornered primary image with a row of four thumbnails beneath, the active one ringed. Currently a stacked scroll of all images. Client component, thumbnail click swaps the primary. Plain markup if the four thumbnails always fit; `carousel.tsx` if they need to scroll — don't hand-roll scrolling.

### Step 4.4 — Info rail

`modules/products/templates/product-info` + `components/product-actions`.
Order: ochre maison eyebrow → serif title → price + stock `Badge` → description → colour swatches → size chips with a "Size Guide" link → quantity stepper + full-width `ADD TO BAG — $X` → "Sold and shipped by {maison}".
Components, all existing: size chips and colour swatches are both `toggle-group.tsx` in single-select mode (round vs rectangular is a `className`, not a second component); the quantity stepper is `number-field.tsx`; "Size Guide" is `Button variant="link"`; add-to-bag is `Button` full-width.
Option selection today is a generic button list; the design distinguishes **colour (round swatch) from size (rectangular chip)**. That needs a rule for which option renders as which — safest is matching on the option title, falling back to chips.
The maison line and the swatch colour values both need data — see Data gaps.

### Step 4.5 — Accordions

`modules/products/components/product-tabs` already uses the shadcn `Accordion` with the right two sections ("Product Information" / "Shipping & Returns"). Restyle to hairline rows with a `+` affordance and rename to "Details & Care" / "Shipping & Returns". Smallest step in this phase.

### Step 4.6 — "More from {maison}"

`modules/products/components/related-products`. The design scopes this row to the **same vendor**, with a "VIEW MAISON ARCHIVE →" link. Related products are currently scoped by collection/tags. Blocked on the same vendor data — until then, restyle the row in place and keep the existing scoping.

---

## Phase 5 — About / manifesto (`minimalist_about_us_manifesto`) ✅ done

New route at `(main)/about/page.tsx` (+ a nav link). No data, no interactivity — static, and the simplest of the four.

### Step 5.1 — Header + hero image

Centred ochre eyebrow, large serif title, a centred lede paragraph, then a wide landscape image (`/editorial/atelier-studio.png`) with small captions flush left and right beneath it.

### Step 5.2 — Three-pillar row

`01 / PROVENANCE`, `02 / RESTRAINT`, `03 / PERMANENCE` — numbered ochre eyebrow, serif heading, short paragraph, hairline rule above.

### Step 5.3 — Quote block

Portrait image left (`/editorial/artisan-portrait.png`) with a caption, large serif italic pull-quote right, a paragraph, then an "INQUIRE WITH SALON CONCIERGE →" link and a city list.

---

## Data gaps

Things the design shows that the backend does not currently provide. Each blocks a specific step.

| #   | Gap                                                                                                                                                                                                                       | Blocks                                                                                 | Shape of the fix                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Product → vendor is not exposed on the store product API.** The `product-vendor` link exists in `apps/backend/src/links/`, but `store/lib/data/products.ts` never requests it, so no product response carries a vendor. | 2.1 eyebrow, 3.4 maison + "sold and shipped by", 3.6 maison archive, 2.3 maison filter | Expose the linked vendor on the store product query and thread it through `listProducts`. Backend change — do it as its own step, verified with a plain log of one product, before any component consumes it. |
| 2   | **No colour value per option.** 3.4 needs a real swatch colour per colour-option value; only a label exists.                                                                                                              | 3.4 swatches                                                                           | Either a metadata convention on option values, or render colour as labelled chips like size.                                                                                                                  |
| 3   | **Home editorial copy has no model** — monograph text and stats (4.3), curator attribution (4.2), salon band (4.5).                                                                                                       | 4.2, 4.3, 4.5                                                                          | Decide: static in-component copy for the POC, or extend `storefront_content`.                                                                                                                                 |
| 4   | **Vendor city and ordering** for the maisons registry.                                                                                                                                                                    | 4.4                                                                                    | Add to vendor `storefront_content`, or drop the city label.                                                                                                                                                   |
| 5   | **No home hero image source.**                                                                                                                                                                                            | 4.1                                                                                    | `storefront_content.hero_image_url` on some entity, or a static asset.                                                                                                                                        |

Gap 1 is the one worth doing properly — it is a genuine modelling gap, it unblocks four separate steps across two phases, and the maison attribution is the core idea of this whole design. Gaps 3–5 are copy, and static copy is a reasonable POC answer if you say so.

## Open questions

1. **Nav link case, and the footer newsletter field** — the design wants uppercase micro-type nav and an underline-only email input; both currently render with the component defaults, because restyling `NavigationMenuTrigger`/`InputGroup` via `className` is exactly what Rule 1 forbids. If these are brand decisions, the honest fix is the token/theme layer, not per-call-site classes. This is the same question as 2.
2. **The eyebrow type scale** — the design's label style is 10px / 0.24em tracking; the nearest scale tokens are `text-xs` / `tracking-widest` (12px / 0.1em), which reads heavier and less airy. Either accept the scale, or add **one** type-scale token in the token layer that every eyebrow uses. Settle before Phase 2 — every screen uses this style.
3. **Category/collection heroes** (Step 2.2) — those routes have real `hero_image_url` data. Keep the image hero there and use the flat header only on `/store`, or go flat everywhere?
4. **Home editorial copy** (Gap 3) — static for the POC, or model it?
5. **`FeaturedCategories`** — drop it from the home page, or find it a place?
6. **Brand name** — the app says "Vitrine" in nav, footer and copy; the designs say "Atelier Édition". Real name, or keep Vitrine? The design's two-tone logo (second word italic ochre) needs a two-word name.
7. **Mini-cart auto-open** — the popover used to open for 5s when the item count changed. That needed client state, so it was dropped when the popover moved inline into the server-rendered nav. Restore it (costs one small client component) or leave it out?

## Decisions taken during Phases 0–3

- **Nav labels stay functional** (Categories / Collections / Store / Vendors) rather than the design's vocabulary (Curations / Maisons / Editorial) — renaming Vendors → Maisons is a product decision, not a restyle. Blocked on the brand question.
- **Search icon and footer legal links omitted** — no search route, no privacy/terms pages. Not shipping dead links to match a screenshot.
- **Footer gained a Vendors column** alongside Categories and Collections.
- **The tweakcn live-preview script** in `app/layout.tsx` is still loaded; remove it now the palette is committed.
- **Vendor is exposed on store products** via `apps/backend/src/api/store/products/middlewares.ts`, which appends `vendor.{id,name,handle}` to `req.queryConfig.fields`. It must _not_ re-run `validateAndTransformQuery` — custom middlewares append, so that runs after Medusa's pricing middleware and re-injects `region_id` as a product filter (500s). This unblocked the card's maison eyebrow; the PDP maison line and "More from this maison" can now use it too.
- **The catalog keeps its existing Filters sheet**, not the design's inline dropdown row: the sheet scales to any number of product options, the dropdown row broke at seven and pushed sort onto a second line. Restyling a pattern is in scope; replacing the interaction is a product decision.
- **The catalog header has no piece count.** The design shows "24 PIECES"; the count only exists inside the products Suspense boundary, so the same information lands in the "SHOWING 1–9 OF 26" results line instead of firing a second query.
- **`Eyebrow` and `Thumbnail` are now `components/ui` components** with `cva` variants, and `Button` gained an `xl` size. New variants are the right way to add a pattern; per-call-site `className` is not.
- **`Divider` and `ProductListingLayout.Hero` were deleted** — both were pass-through wrappers adding nothing (`Divider` even dropped every prop but `className`). Use `Separator` and container `gap`.

## Known duplication, not yet addressed

`cart/components/item` + `cart/templates/items.tsx` still render cart line items as a table for the cart page, with their own `EmptyCartMessage` (which bakes in `py-48` page padding — the layout-chrome problem Rule 4 exists to prevent). `CartList`/`CartSummary` now do this job everywhere else. Unifying them is the next cleanup.
