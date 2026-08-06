> **Repo status (2026-08):** This file remains the **product RFP / outcome source**. Engineering has moved the commerce core from Shopify Plus to **Medusa** (see `docs/adr/0001-commerce-platform-medusa.md`). Treat the "Shopify Plus … Fixed" constraint in §7.2 as superseded. Other outcomes still apply unless a newer ADR says otherwise. Nothing in this tree is permanent.

## What we're asking for.

Sensus Collective is commissioning the build of a curated multi-vendor marketplace. This document sets out the scope we are inviting agencies to tender for.

## 01 About this document

This is a request for proposal, not a specification. Requirements are written as outcomes the platform must achieve, and each group closes with a prompt asking how you would achieve it. Responses are assessed on those answers.

Any technical thinking we have already done is non-binding. Adopting it earns no credit; disagreeing with it costs none. We would rather learn early that our assumptions are wrong.

## SCOPE — A COMPLETE PRODUCT, NOT A MINIMUM VIABLE ONE

This is not a request for an MVP. The first public release is expected to be a complete, credible product: three fully functional surfaces, the whole curation taxonomy, the full editorial capability, and marketplace operations the Sensus Collective team can run from day one. A proposal that phases materially more than the single item named below is a proposal to launch something unfinished, and will be read as one.

Everything in this document is therefore required at launch, with one exception, the AI assistant at 7.7. A small number of items carry a TO CONFIRM tag: decisions we have not yet taken, where you should state your assumption and the cost sensitivity either way.

## 02 The business, in brief

Sensus Collective is a curated marketplace. Vendors, referred to throughout as houses, are hand-picked rather than self-serve, and the curation is the product. The commercial and technical consequences of that model are what make this build different from a conventional storefront.

## COMMERCIAL POSITION — MERCHANT OF RECORD

Sensus sells to the customer; houses supply. Price accuracy, tax position, consumer rights and refund liability sit with the platform, not the house.

## FULFILMENT — HOUSES HOLD AND SHIP

Stock lives with the house. Houses pick and pack, but print labels generated centrally against Sensus carrier accounts. Houses never arrange their own courier.

## THE HARD PART — ONE BASKET, MANY HOUSES

A single basket may contain items from several houses. It must remain one order, one payment and one tracked purchase to the customer, while splitting into per-house fulfilment behind the scenes.

## SCALE AT LAUNCH — ≈30 HOUSES

Small catalogue, high curation, continual rotation. Houses join and leave; products are discontinued frequently. The system must treat churn as normal, not exceptional.

MARKETS — UK · EU · US


Multi-currency and duty-inclusive presentation where achievable. Launch may be UK-first; the data model may not be.

## TIMING — 1 DECEMBER BUILD TARGET, 5 DECEMBER PUBLIC LAUNCH

The public launch is 5 December, tied to the holiday pop-up. We hold an internal delivery target of 1 December to buffer that date, and the plan should build to the 1st. TO CONFIRM Whether the public date is a hard commercial requirement or one we are asking you to assess; respond to both readings.

## IN YOUR RESPONSE

Tell us which of these characteristics you consider the largest driver of cost and risk, and how your proposed approach absorbs it.

## 03 Three surfaces, all in scope

The platform is three distinct products sharing one data model. All three must be priced. A response that scopes only the storefront is not a complete response.

The customer storefront handles discovery across several taxonomies, editorial content, purchase, and post- purchase self-service across multi-house orders. The house portal covers onboarding, catalogue and stock management, order and fulfilment handling, and payouts and statements. The Admin Portal carries curation controls, the application pipeline, central order and returns management, the commission ledger, and editorial and homepage composition.

The portal and console are internal tools, but they are held to the same accessibility standard and the same performance discipline as the storefront. The Sensus Collective team should have full visibility of daily platform operations.

## 04 Initial sitemap — the required pages

Agencies price by unique template, not by page, so the inventory below is organised that way. Instance counts indicate how many routes each template serves. Where two templates could reasonably be merged into one, we have listed them separately and expect you to tell us if you would collapse them; that judgement is informative.

This is an initial inventory, not a final route map, but it is the working contract between the design agency and the build agency: the agreed starting list of what exists, to be fixed between the two before either begins.

## SURFACE ONE — CUSTOMER STOREFRONT

| TEMPLATE INST. NOTES Home landing 1 Modular, composed by editors from CMS blocks Editorial landing — The Journal 1 CMS-driven; articles ordered by date |
| --- |
| Individual editorial page 1 Derived from the CMS on a fixed entry format. Items mentioned in an article |
| must be addable to basket from the page itself |
| Shop 1 Carries the occasion, mood and region cuts of the curation taxonomy Product listing 1 Faceted listing serving each taxonomy cut via query state Search and search results 2 Global typeahead entry point; results share facet behaviour with the taxonomy listing, plus zero-result and did-you-mean states Individual product page 1 |


| TEMPLATE | INST. NOTES |
| --- | --- |
|   | House identity embedded as a short About the House block (name and |
|   | brief description, optional expand); origin and duty information. No separate |
|   | house profile page |
| House listing page | 1 Directory of houses as a discovery surface. With individual profiles TO CONFIRM |
|   | removed, confirm whether the directory links to a filtered product view per |
|   | house rather than a profile page |
| Pop-ups — events index and event | 2 CMS-derived; upcoming and past, with the capability to reserve a place at |
| detail | the event |
| About | 1 — |
| How Curation Works | 1 Public curation manifesto |
| Join as a House | 1 Public form feeding the operator intake pipeline |
| Contact | 1 Form |
| Basket | 1 Grouped by house |
| Checkout | 1 Highest-stakes surface in the build |
| Account dashboard | 1 — |
| Order history | 1 — |
| Order detail | 1 Per-consignment tracking, mixed statuses |
| Wishlist | 1 Heart affordance sitewide; persistence policy to define |
| Auth: login · register · password | 3 A separate identity domain from house users, see 7.10. Passwordless |
| reset | remains an open question |
| Service and legal content page | 1 One template serving terms, cookies and equivalent service content |
| Error state pages | 1 404 and empty states recur throughout and are in scope |

FAQ, returns, privacy, and shipping and duties policies are downloadable documents linked from the footer rather than page templates, and are excluded from the count above. The service and legal content template absorbs any of those four that later needs to be a page rather than a document.

## SURFACE TWO — HOUSE PORTAL

TEMPLATE

INST. NOTES

| Auth: login · password reset 2 Separate identity domain from customers Dashboard 1 KPIs and orders needing action |
| --- |
| Product list 1 — |
| Product editor / upload 1 Image standards enforced at the point of upload. Supports catalogue ingestion by connector (see 7.4) so houses on Shopify can import rather than re-key Orders list 1 — Order detail and fulfilment 1 Centrally generated label printed here |


| TEMPLATE INST. NOTES Payouts and statements 1 Commission-adjusted earnings Onboarding 1 Onboarding steps for approved houses; captures the house's public-facing fields (name, short description) used in the product-page About block SURFACE THREE — ADMIN PORTAL TEMPLATE INST. NOTES Overview 1 GMV, orders, items needing attention Central order management 1 Across all houses Central returns management 1 Reasons and rate by house Curation controls 1 Cap per house, approval queue, rotation Application pipeline 1 Plugged into a central email address |
| --- |
| Houses directory + house detail 2 — Commission ledger and payout run 1 Commission to be centrally sent by Sensus CMS composition 1 Editorial, homepage modules, newsletter draft |

## 05 Frontend scope

Build, not design. This is a build engagement. User interface and experience design — screens, component designs, tokens and motion specification — is produced by a separate agency and handed to you as a Figma package. You are not being asked to design the storefront. You are being asked to implement it faithfully against a design system you do not own, and to build the coded component library that sits underneath it. Section 06 sets out that handover in full.

Requirements below apply to the customer storefront unless stated.

## 5.1 Multi-vendor interface requirements

- Basket grouped by house, with per-house delivery estimates and lead times.

- Shipping presentation matching the adopted policy — one charge, per-house charges, or absorbed TO CONFIRM — and an interface that explains why one order arrives as several parcels.

- Order confirmation and order detail expressing consignments: multiple tracking numbers, mixed statuses, partial dispatch, partial cancellation, partial refund.

- House attribution on listing cards and the product page, surfaced as a short About the House block on the product page (name and brief description, optional expand) rather than a separate profile page. Category attribution is optional; tag by occasion where a category label is not needed.

- Returns against a multi-house order: per-consignment initiation, differing windows by house, partial refunds against a single order.

## IN YOUR RESPONSE

Walk us through a basket spanning five houses, from listing to a partially dispatched order with one consignment returned.


## 5.2 Content and CMS integration

Editors need a block-based system they can build pages with, and a clear shared understanding of what they can rearrange freely and what stays fixed. Draft and preview should work through authenticated preview deployments, and blocks must be able to mix authored content with live commerce data: products mentioned in an editorial article have to be addable to basket from within the article. Product copy needs a single stated home: commerce core, product information manager, or CMS.

## 5.3 Performance

Catalogue and editorial should be cached and statically served; basket, account and availability must be live.

- A stated stock-freshness policy, with verification at add-to-basket and again at checkout, and a defined failure path.

- Faceted listings crawlable and responsive, with the URL as the source of filter state and working back-button and scroll restoration.

- Core Web Vitals budgets committed for product and listing pages specifically.

- An image pipeline normalising house-supplied imagery: responsive sizing, modern formats, CDN transforms, and a consistent crop and aspect policy.

## 5.4 Search

Typeahead, a results page, and considered zero-result and did-you-mean states. Multi-select facets with counts, range filters, applied-filter chips, a mobile filter drawer and sorting. The merchandising hooks matter as much as the search itself: curated collections, pinned products, and editorial-driven product rails.

## 5.5 SEO and LLM visibility

Discovery here is curation-led and editorial-led, so house profiles and Journal articles are ranking surfaces in their own right, not only product pages. They increasingly need to be legible to machines as well as to people: a growing share of discovery now happens through AI answer engines and shopping agents rather than a results page.

- Metadata and canonical strategy, especially for faceted and paginated URLs, and for products listed under multiple categories.

- Structured data: Product, Offer, BreadcrumbList, Organization, AggregateRating.

- Dynamically generated, index-split sitemaps that scale with catalogue size.

- Page performance and mobile parity treated as visibility requirements, not only user-experience ones.

- Discoverability by AI answer engines and shopping agents, not only by search crawlers: complete structured product data, and machine-readable delivery, duty and returns terms, so an agent can compare us without interpretation.

## IN YOUR RESPONSE

Describe canonical handling for a product reachable through occasion, category, region and mood simultaneously, and state your indexing rules for faceted listing URLs. Set out separately what you would do to make the catalogue and the editorial content discoverable and citable by AI answer engines and shopping agents.

## 5.6 Accessibility and responsiveness

WCAG 2.2 AA across all three surfaces — focus management in drawers and modals, announced basket updates, accessible form errors, reduced-motion support. Responsive behaviour is expected across the full breakpoint range; the browser, device and minimum-viewport matrix is to be confirmed before issue TO CONFIRM . Responsibility is split: the design agency owns contrast, target sizes, focus visibility and motion, and the build agency owns semantics, focus management, announcements and keyboard paths.


## 5.7 Capture and notifications

Back-in-stock and waitlist capture, including coming-soon houses. Newsletter and form capture, the cookie consent banner, and the size guide. Event reservation from a pop-up detail page, with capacity handling and confirmation. Reviews on product pages, carrying verified-purchase status.

## 06 The design interface

Visual design, including the component library and motion specification, is produced by a separate agency and delivered as a Figma package. The build agency implements it.

## WHAT ARRIVES — FIGMA PACKAGE

Component designs, tokens, motion specification and a handoff pack. Whether tokens arrive machine-readable or are derived from the file is a live question with real effort attached; state your assumption.

## COVERAGE — STATES AND BREAKPOINTS

Loading, empty, error, disabled, focus and validation states across all breakpoints may not be exhaustively designed. Gap-filling is normal and is in scope; it needs a named decision route so it does not become a change request each time.

## OWNERSHIP — THE CODED LIBRARY IS YOURS

The design agency ships design components. Building, documenting and testing the code equivalents sits with the build agency. Bids vary widely on this line, so we are stating it rather than implying it.

## SEQUENCING — DESIGN LANDS MID-BUILD

The design package is expected early-to-mid September, after the build must begin. What is frozen when, and what a post-freeze design change costs, both need stating.

## DEPENDENCY RISK — WORKING BEFORE PIXELS

Architecture, integrations, order orchestration, payouts and the data model can all progress against a provisional interface. We expect a plan that does not idle waiting for design.

## COLLABORATION — DESIGNS ARE A STARTING POINT

The Figma package is what you build to, but it is not sacred. Where a design does not survive contact with real data or real content, tell us and propose an alternative.

## MOTION — MOVEMENT, FLOW AND LOADING

The design package includes a motion specification, and we expect the build team to be fluent in it: transitions, the flow between states, and loading behaviour that complements the design rather than sitting on top of it. Where you have recommendations, or limitations that would constrain what the specification asks for, raise them early rather than at build.

## IN YOUR RESPONSE

Set out how you would structure the engagement so that the design dependency does not sit on the critical path, and what you need from the design agency, by when, to hold that plan.

## 07 Backend and platform

## 7.1 Guiding principle

The intent is buy, not build. A proven commerce platform should own commerce, a proven marketplace layer should own multi-vendor mechanics, and custom code should exist only where nothing off-the-shelf fits the curation model.


Any bespoke component should be justified against an off-the-shelf alternative. This trades flexibility for delivery speed; if that trade-off is wrong for any part of the scope, say so at tender stage rather than at handover.

## 7.2 Fixed constraints

|   | CONSTRAINT STATUS Shopify Plus as the commerce core Fixed — driven by the timeline Duty-paid (DDP) pricing shown at checkout for UK, EU and US Fixed |
| --- | --- |

Everything else is open: the multi-vendor layer, content management, payouts, tax calculation, lifecycle messaging, reviews and search. Where earlier discovery identified candidate services, those are illustrative and should not be read as requirements.

## 7.3 Commerce core

Owns catalogue, inventory, basket, checkout, payments, tax, orders and customer accounts. It is the system of record for anything commercial, and custom services must read from it rather than duplicate it.

## 7.4 Multi-vendor layer

- House accounts, with a portal foundation that can be themed to brand.

- Order splitting: one consolidated customer order resolving into per-house sub-orders with independent fulfilment lifecycles.

- Commission handling: a take rate configurable per house, with the ability to vary it.

- Payout processing: a scheduled batch run.

- Per-house capacity limits: houses are subject to a product cap that must be enforced and visible.

- Catalogue ingestion by connector. Houses already on Shopify must be able to connect their store and select products to import — imagery, packshot, title, description, price and variants — rather than re-entering each product manually. Being on Shopify is a practical prerequisite to onboard.

## IN YOUR RESPONSE

State which of these your chosen layer provides natively, which require configuration, and which need custom work.

## 7.5 Order lifecycle

A consolidated order resolves into one consignment per house, and each consignment moves through its own lifecycle independently. The states below are the minimum the platform must express. Add to them if your approach requires it; do not collapse them.

| CONSIGNMENT STATE | MOVED BY | WHAT THE CUSTOMER SEES |
| --- | --- | --- |
| Placed | Platform, on payment One order confirmation listing every consignment with its |   |
|   |   | expected dispatch window |
| Accepted | House | Nothing; the dispatch window is confirmed rather than |
|   |   | changed |
| Unfulfillable | House | Notification that one consignment cannot be supplied, that |
|   |   | line refunded, the rest of the order unaffected |
| In production | House | Made-to-order lead time shown against that consignment |
|   |   | only |
| Dispatched | House | Dispatch notice and tracking for that consignment alone |


| CONSIGNMENT STATE MOVED BY WHAT THE CUSTOMER SEES Delivered Carrier feed Delivery confirmation per consignment Cancelled Customer or operator, Cancellation confirmation and a partial refund against the pre-dispatch original order Return requested Customer Return instructions and the window applying to that house Return received House, on inspection Confirmation the return is being processed Refunded Platform Refund confirmation, partial against the original order |
| --- |

Three rules govern the table. A consignment's state never changes another consignment's state. Order-level status shown to the customer is derived from consignment states rather than stored alongside them. And a consignment may itself split where dispatch dates differ within it, without becoming a second order.

## IN YOUR RESPONSE

State which of these transitions your proposed marketplace layer provides natively and which need building, and describe the path for a house that accepts an order and then cannot fulfil it.

## 7.6 Content management

Content must drive the storefront modularly: composable homepage and landing modules, editorial articles, house content, and the occasion, mood and region landing pages that carry the curation taxonomy. The boundary is firm. Content references products; it never owns price, stock or product truth. Editorial must be able to embed live product references that resolve against the commerce core at render time.

## 7.7 Further services

The first is house application intake: a public form feeding a pipeline the team can review, with each applicant tracked through the curation process from enquiry to approval. The second is back-in-stock and waitlist capture, sign-up from the product page, checked against stock as it changes, with the emails themselves sent by the messaging platform. The third is the AI assistant, and it is the one item not required at launch PHASE 2 . What we do need at launch is its

entry point in the interface and the data model behind it, so the assistant can be added later without rework.

## 7.8 Peripheral capabilities

Provider choice is open for payments, house payouts, tax and duty calculation supporting DDP display, lifecycle and transactional messaging covering newsletter, abandoned basket, back-in-stock and order notifications, and product reviews with verified-purchase status. Search and discovery requirements are at 5.4.

## 7.9 Critical validation

Before significant build effort is committed, we expect the multi-vendor layer to be proven end to end against a single scenario: two houses onboarded, one customer order spanning both, order split correctly, payout calculated and split, refunds. If that loop works, the marketplace model is de-risked. If it does not, the platform choice is wrong and we need to know early.

## IN YOUR RESPONSE

Confirm you will validate this before building any customer-facing interface, and identify the part of it you expect to be most difficult.

## 7.10 Identity and access

Three audiences with materially different requirements. Customers need account creation, order history and addresses, with session handling that works across a headless storefront and a platform-hosted checkout without the customer noticing a seam. House users are invited rather than self-registered. Because these accounts see customer


names and delivery addresses, multi-factor authentication is expected. Internal staff need role-based access. Data isolation between houses is a hard requirement: a house must never be able to reach another house's orders, customers or performance data.

## IN YOUR RESPONSE

Describe how isolation is enforced structurally rather than endpoint by endpoint, and how it is tested.

## 7.11 Security and compliance

PCI scope stays with the hosted checkout, and no custom component should touch raw card data. Data protection requires data-subject request tooling and defined retention, with data shared with houses limited to what fulfilment requires. Public endpoints, the application intake form in particular, need rate limiting and abuse protection.

## 7.12 Consent and cookies

Consent spans the storefront, the backend and the measurement layer, so we treat it as a first-class requirement rather than a component of analytics. State clearly which party owns it and how it is priced. Nothing beyond what is strictly necessary to operate the site may be set or fired before the customer has actively consented. Consent must be granular and withdrawable by category, with a persistent preference centre, and refusal made as straightforward as acceptance. It has to persist across the whole journey, including the transition between the headless storefront and the hosted checkout. It must propagate downstream, so third-party services behave according to the customer's choice, and server-side collection must respect the same state as client-side. Configuration needs to be geo-aware: the UK and EU operate opt-in regimes, while several US jurisdictions operate opt-out with a data-sale signal. Consent records must be auditable. The banner and preference centre are part of the accessible interface, held to the standard set in 5.6.

## 7.13 Operational requirements

Monitoring and alerting should focus on the failure modes that matter here: order splitting, payout runs, stock synchronisation and integration failures. Each house record stores a named operational contact and a committed response time (target 24 to 48 hours) for order issues, surfaced to the Sensus admin team and enforced via the house agreement. We also expect documented handover and a stated position on ongoing support.

## 08 Data and analytics

## 8.1 The questions it must answer

## TRADING

What are we selling, at what volume and value, and how is that trending? What is our margin position, before and after fulfilment costs? How do new and returning customers differ in value and behaviour?

## CURATION AND MERCHANDISING

Which houses are performing, and which are not? Do the occasion, mood and region cuts genuinely drive discovery and conversion, or are customers routing around them? Which curated collections and editorial features convert? And what are customers searching for that we do not stock, that is, where should curation go next?

## MARKETPLACE DYNAMICS

How often do baskets span several houses, and what does that do to order value, fulfilment cost and customer satisfaction? What is the relationship between editorial engagement and purchase? How long does a newly onboarded house take to reach its first sale, and to reach steady state?

## OPERATIONS

Are houses dispatching within agreed service levels? Where are we losing orders to stock inaccuracy, cancellation or oversell? What is being returned, by whom, and why?


## ACQUISITION

Which channels and campaigns bring customers who go on to have value, rather than customers who convert once?

## 8.2 Measurement scope

Four data domains. Behavioural — on-site browsing, search, discovery, funnel progression, editorial engagement. Transactional — orders, order composition, payments, refunds, discounts. Fulfilment and operational — dispatch, delivery, cancellations, stock events, returns. And vendor — onboarding, catalogue activity, sell-through, service levels, and capacity against agreed product caps. Set out how each is captured, joined and made available.

## 09 What we're asking you to tender for

You are tendering for implementation of all three surfaces to the scope in this document, integration with the commerce, marketplace, content, payment, shipping, tax and messaging layers you propose, launch support with a defined hypercare period, and ongoing maintenance and support priced separately from delivery.

## RESPONSE FORMAT — WHAT A SUBMISSION SHOULD CONTAIN

- Your approach, and the proposed architecture with its justification.

- Answers to the response prompts throughout this document.

- Team shape and named leads, with their availability across the delivery window.

- A phased plan set against the launch date, and what you would cut to hold it.

- Which requirements the proposed stack meets natively, which need configuration, and which need custom development.

- The division of responsibility between agency and client, at launch and ongoing.

- Anything in this document you disagree with.

- Assumptions, dependencies and explicit exclusions.

- Commercials broken down by surface and by phase.

- References from comparable multi-vendor builds, ideally ones you can let us speak to.

## MAINTENANCE AND RUN COST — WHAT IT COSTS TO KEEP RUNNING

We are as interested in the cost of year two as the cost of the build. Please estimate annual platform, licence and transaction costs at launch volume, itemised by service rather than given as a single figure, alongside hosting and infrastructure and whether those scale with traffic and order volume. Model the same figures at a stated growth multiple, so the cost of scaling is visible before we commit to it. Set out your support and maintenance offer — tiers, response times, hours included, and what sits outside them — the routine maintenance you assume each year and who carries it, and how work beyond support is priced. Tell us what Sensus would need to hold in-house to bring this cost down over time, and a realistic path to it.

## 10 Open decisions

Stated plainly, because a tender written as though everything is settled produces bids that quietly assume different things. Three remain, each tagged where it appears. Whether the 5 December public date is a hard commercial requirement or a date we are asking you to assess, which changes phasing, team size and what gets cut (we build to an internal 1 December target regardless). The shipping charge policy, which shapes basket and checkout work directly. And the browser and device support matrix, stated now to prevent scope creep later.

## 11 Contacts


AndMelo · Design liaison · hello@andmelo.com

Matilde Mourinho · Sensus Collective · Co-founder and communications lead (agency bridge)

Scarlett Reuben · Sensus Collective · Co-founder

Emily Symonds Willmott · Sensus Collective · Co-founder

The client contracts the build partner directly. AndMelo remains the design, brand and technical liaison across the engagement.

PREPARED BY ANDMELO · SENSUS COLLECTIVE · REQUEST FOR PROPOSAL · VERSION 5.4 · ALL SCOPES COMPLETE · COMPLETE PRODUCT AT LAUNCH · OPEN DECISIONS AT SECTION 10
