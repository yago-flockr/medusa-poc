## Sensus Collective

## Executive, Technical, and Commercial Proposal

Date: 10 August 2026

## A curated multi-house commerce platform built with Medusa Status: Initial discussion draft


## 1. Executive summary

Sensus Collective is a curated marketplace in which customers can purchase products from several independent houses through one basket, one checkout, and one payment.

Behind that simple customer experience, each house must retain control of its own products and stock, prepare its own part of the order, and receive payment according to its commercial agreement with Sensus. Sensus must maintain central control of curation, customer service, pricing, payments, refunds, commissions, supplier payments, and overall order visibility.

We propose building the platform from the ground up using Medusa version 2 as the commerce foundation. Medusa provides established capabilities for products, pricing, baskets, orders, inventory, payments, and fulfillment while allowing the marketplace model to be developed around Sensus’s specific operational requirements.

The solution will consist of three connected experiences:

- 1. A customer storefront.

- 2. A private portal for houses.

- 3. An administration and operations environment for Sensus.

The engagement would be ideally divided into two commercial phases:

- \- Phase 0 — Discovery and technical validation: to define the operating model, validate the critical multi-house transaction through a focused proof of concept, and produce a detailed scope and estimate for the full implementation.

- \- Phase 1 — Full platform implementation: currently estimated at 1,200 hours, with an initial confidence range of ±20 percent, resulting in an indicative range of 1,000 to 1,400 hours. This estimate will be refined at the end of Phase 0.

Sensus could contract Phase 0 independently and will not be required to commit to Phase 1 until the findings, scope, schedule, and commercial proposal have been reviewed.

The current expected duration is approximately six months, including Phase 0.


## 2. Our understanding of the opportunity

Sensus intends to create a highly curated international commerce platform bringing together approximately 30 houses at launch. The initial commercial markets are expected to include the United Kingdom, the European Union, and the United States.

Sensus will act as the merchant of record: the legal seller to the customer and the party responsible for collecting payment, applying the correct taxes and duties, managing customer rights, and issuing refunds.

The houses are expected to hold and manage their own stock and prepare their own shipments. The customer should nevertheless experience Sensus as one coherent retailer rather than a collection of disconnected sellers.

This creates several important requirements:

- \- One basket and one payment across several houses.

- \- One customer order divided internally into separate consignments.

- \- Independent acceptance, production, dispatch, delivery, cancellation, and return states for each house.

- \- Accurate stock across independently operated suppliers.

- \- Central shipping rules and customer communication.

- \- Configurable commissions and controlled supplier payments.

- \- Partial refunds and returns without incorrectly affecting the rest of an order.

- \- Strict separation of private data between houses.

- \- International tax and import-duty calculations.

- \- Editorial curation connected to live product information.

The principal challenge is therefore not the visual storefront. It is the operating and financial model behind the marketplace. The proposed approach places that model at the center of discovery and technical validation.


## 3. Recommended platform approach

## 3.1 Medusa as the e-commerce foundation

Medusa is a modular, open-source commerce framework. It provides the standard foundations of an online store while allowing custom business models to be built around them. This is a strong fit for Sensus because the platform needs familiar commerce capabilities together with a marketplace model that does not fit neatly into a standard hosted store.

Medusa will provide the foundation for:

- \- Products and variants.

- \- Market-specific prices.

- \- Baskets and checkout.

- \- Customers and orders.

- \- Inventory and stock reservations.

- \- Payments and refunds.

- \- Fulfillment and returns.

- \- Authentication and administrative access.

The Sensus-specific marketplace capabilities will be developed around this foundation, including houses, house users, product ownership, consignments, commission rules, financial statements, supplier payments, and operational exception handling.

Medusa should not be understood as a complete marketplace product. Its value is that it provides the commerce building blocks while allowing Sensus to own and evolve the distinctive parts of its business model.

## 3.2 Why Shopify is not proposed as the core platform

The Sensus platform will be built from the ground up. There is no existing Sensus store to migrate, and Shopify will not be part of the proposed core architecture.

Shopify can support a separate storefront, but it does not natively provide the main marketplace concepts required by Sensus: structural ownership by house, independent consignments, a commission ledger, controlled supplier payments, or coordinated refunds across several houses.

Those capabilities would require a separate marketplace and order-management layer alongside Shopify. Critical information would then be distributed between several systems, increasing synchronization and reconciliation risk without removing the need for substantial custom development.

Medusa also requires custom work, but it allows the critical marketplace rules to remain within an architecture controlled by Sensus.


## 3.3 No migration or Shopify integration is assumed

The base scope assumes a new platform and a new catalog. Houses will create products through the portal or use controlled spreadsheet templates for their initial upload.

If a house needs to synchronize catalog or stock with Shopify or another external system, that connector can be assessed separately. Continuous multi-channel synchronization is not included in the current estimate.


## 4. Proposed solution

## 4.1 Customer storefront

The storefront will present Sensus as one premium, curated destination. It will include:

- \- Modular homepage and curated navigation.

- \- Product categories, collections, filtering, and search.

- \- Product pages with house information and delivery expectations.

- \- Editorial content connected to purchasable products.

- \- Events and informational pages.

- \- Wishlist and customer account.

- \- Multi-house basket and checkout.

- \- One order view showing each delivery clearly.

- \- Cancellation and return requests where permitted.

- \- Search engine optimization, accessibility, and consent management.

We recommend using Next.js for the storefront and a dedicated content management system for editorial content.

## 4.2 House portal

Each house will have a secure private portal containing only its own information. The portal will support:

- \- Onboarding and house users.

- \- Product creation and initial catalog upload.

- \- Product submission and approval status.

- \- Stock management.

- \- Consignment acceptance and fulfillment.

- \- Shipping labels and tracking.

- \- Return actions where required.

- \- Statements, commissions, adjustments, and supplier payment status.

- \- Basic operational performance information.

Multi-factor authentication and server-side data separation will protect house access.

## 4.3 Sensus administration and operations

Sensus will have central tools for:

- \- House applications and onboarding.

- \- Product review, curation, and publication.

- \- Categories, collections, editorial content, and merchandising.

- \- Customer orders and individual consignments.

- \- Shipping, exceptions, cancellations, and returns.

- \- Commission rules and financial adjustments.

- \- Supplier payment approval and reconciliation.


- \- Operational and commercial reporting.

- \- User permissions and audit history.

The administration environment will prioritize visibility and recovery. Sensus staff must be able to understand what happened, identify an exception, and take an authorized corrective action without relying on engineering support for routine cases.

## 4.4 Core order model

The customer will see one order. Internally, the platform will create one consignment for each house represented in that order.

Each consignment can progress independently. One house may dispatch immediately while another has a production lead time. One item may be unavailable or returned without canceling or refunding the entire order.

The overall order status will be calculated from the status of its consignments. This model will form the center of the Phase 0 proof of concept.


## 5. Key operating areas

## 5.1 Catalog governance

Houses will be able to create and maintain their products, but we recommend that Sensus retains publication control.

A typical process will be:

- 1. The house creates or uploads a product.

- 2. The platform validates the required information.

- 3. The house submits it for review.

- 4. Sensus approves it or requests changes.

- 5. The approved product is published.

Sensitive changes—such as price, materials, dimensions, customs information, or country of origin—may require renewed approval. Routine stock updates should not require editorial review.

Accurate product data is important not only for presentation but also for shipping, import duties, tax, accessibility, search, and returns.

## 5.2 Inventory and fulfillment

The current assumption is that each house holds its own stock. Medusa will maintain the quantity available to Sensus and reserve it when an order is placed.

If houses also sell the same stock through other channels, an additional stock synchronization solution may be required. This should be confirmed during Phase 0 because it can materially affect cost and operational risk.

Each house will receive its own consignment, prepare the shipment, and use the agreed shipping service. Sensus will maintain central visibility and communicate progress to the customer.

## 5.3 Shipping and international duties

A multi-house basket may produce several physical shipments. Sensus must decide how much of that cost is shown to the customer and how any subsidy is distributed.

The main options are:

- \- Charging the sum of the individual shipments.

- \- Charging one simple rate and subsidizing the difference.

- \- Applying a rule based on destination and basket value.

- \- Offering free shipping above a threshold.


The Request for Proposal also requires customer pricing to include applicable taxes and import duties for the United Kingdom, European Union, and United States. This is commonly described as Delivered Duty Paid pricing.

We recommend using a specialist provider to calculate taxes and import duties. Sensus will need legal and customs advice to confirm the importer of record, supported products, shipping routes, and responsibilities.

## 5.4 Payments, commissions, and supplier payments

Sensus will charge the customer once. The platform will then calculate the amount attributable to each house, the Sensus commission, shipping allocation, taxes, discounts, refunds, and other adjustments.

These movements will be recorded in a financial ledger so that historical balances can always be explained and reproduced.

Stripe Connect is a likely option for supplier onboarding and payments. The final choice must be validated against the countries, legal entities, currencies, and payment timetable involved.

We recommend scheduled supplier payments rather than transferring money immediately at checkout. This allows Sensus to account for unavailable products, refunds, returns, and chargebacks before funds are released.

## 5.5 Returns and customer service

The customer should be able to request a return against an individual item. The platform will determine whether the item is eligible, where it should be sent, who must inspect it, and when the refund can be issued.

Sensus should remain in control of the customer relationship, even when a house performs part of the physical return process.

The return destination, inspection responsibility, refund timing, and recovery of funds from a house must be agreed during Phase 0.


## 6. High-level architecture

The platform will use a modular architecture so that each service has a clear responsibility.

The main principles are:

- \- Medusa is the source of truth for products, stock, baskets, and orders.

- \- The financial ledger is the source of truth for amounts owed to houses.

- \- The content management system owns editorial content but never controls price or stock.

- \- The search service improves discovery but is not trusted for final price or availability.

- \- External integrations use controlled background processing, safe retries, and reconciliation.

- \- Every house is structurally isolated from every other house.

- \- Important operational and financial actions are auditable.

## Proposed Amazon Web Services foundation

We recommend hosting the application in Amazon Web Services, initially in its Ireland region, with global content delivery.

The proposed foundation includes:

- \- Managed application containers.

- \- A highly available PostgreSQL database.

- \- Managed cache and background queues.

- \- Private file and image storage.

- \- Global content delivery and web firewall.

- \- Central logging, monitoring, backups, encryption, and secret management.

- \- Separate production and non-production environments.


For planning purposes, the current audience scenarios are:

| Scenario | Monthly active users | Estimated Amazon Web |
| --- | --- | --- |
|   |   | Services cost per month |
| Controlled pilot | 1,000 | $600–$1,100 |
| Planning baseline | 25,000 | $1,040–$2,270 |
| Growth | 100,000 | $1,565–$3,530 |

We recommend using \$1,500 per month as the initial planning figure for 25,000 monthly active users.

These figures exclude payment fees, shipping labels, carriers, tax and duty services, content management, search, email, analytics, and other external software.


## 7. Commercial structure

## 7.1 Phase 0 — Discovery and technical validation

| Commercial model | Fixed price |
| --- | --- |
| Included effort | Up to 200 hours |
| Expected duration | 4 weeks |

Phase 0 will establish whether the most important business and technical assumptions are valid before Sensus commits to the complete implementation.

## Main activities

- \- Stakeholder workshops covering catalog, inventory, orders, shipping, returns, finance, customer service, and international operations.

- \- Definition of responsibilities between Sensus, houses, and external providers.

- \- Confirmation of the order, consignment, refund, commission, and supplier payment models.

- \- Review of the proposed architecture, security, and infrastructure.

- \- Evaluation of the main external provider options.

- \- A focused technical proof of concept.

- \- Creation of the detailed Phase 1 backlog, delivery plan, and estimate.

## Proof-of-concept scope

The proof of concept will use minimal interfaces and test data. It will demonstrate:

- \- Two isolated houses.

- \- Two products with independent stock.

- \- One basket and one sandbox customer payment.

- \- One order divided into two consignments.

- \- Independent acceptance and an unavailable-item scenario.

- \- Correct stock reservation and release.

- \- A partial refund.

- \- Basic commission and financial-ledger entries.

- \- A test or simulated supplier payment.

- \- Audit history and safe handling of repeated external events.

The proof of concept is technical validation, not production-ready software.

## Phase 0 deliverables

- \- Discovery findings and decision log.

- \- Agreed operating model and responsibilities.

- \- Updated architecture and data model.


- \- Working proof of concept and demonstration.

- \- Technical findings and risk report.

- \- Prioritized Phase 1 backlog.

- \- Recommended providers and integration assumptions.

- \- Phase 1 schedule, team, acceptance criteria, and detailed estimate.

## 7.2 Phase 1 — Full platform implementation

Phase 1 covers the production storefront, house portal, Sensus administration, marketplace operations, payments, fulfillment, returns, content, search, infrastructure, testing, launch, and stabilization.

|   | Current estimate |
| --- | --- |
| Development effort | 1,000 hours |
| Current confidence | ±20 percent |
| Indicative hours range | 800–1,200 |

The estimate is intentionally presented as a range. Phase 0 will replace assumptions with confirmed operating rules, provider requirements, delivery priorities, and evidence from the proof of concept.

At the end of Phase 0, Sensus can:

- \- Approve the full Phase 1 proposal.

- \- Reduce or sequence the first release.

- \- Request alternative delivery options.

- \- Stop without making a further commitment.


## 8. Indicative delivery approach

## Phase 0 — Discovery and validation

Four weeks covering the work described above.

## Phase 1A — Marketplace and operational foundation

- \- Production infrastructure and security.

- \- Houses, users, catalog, and inventory.

- \- Orders, consignments, fulfillment, returns, and customer-service tools.

- \- Commission ledger, supplier payments, and reconciliation.

## Phase 1B — Customer experience and content

- \- Implementation of the approved designs.

- \- Storefront, checkout, customer account, wishlist, and events.

- \- Content management and editorial commerce.

- \- Search, merchandising, analytics, and consent.

- \- International tax, duty, and shipping experience.

## Phase 1C — Quality and launch

- \- Automated, integration, performance, accessibility, and security testing.

- \- Client acceptance testing with Sensus and pilot houses.

- \- Initial catalog and content loading.

- \- Training and operational procedures.

- \- Launch rehearsal, production release, and stabilization.

Some Phase 1 activities can run in parallel once the core interfaces and operating rules are stable. The final sequencing will be proposed at the end of Phase 0.


## 9. Main assumptions and exclusions

## Assumptions

- \- Approximately 30 houses at general launch.

- \- One initial language and three commercial regions.

- \- Sensus is the merchant of record.

- \- Houses hold and fulfill their own stock.

- \- Medusa is the main source of catalog and inventory data.

- \- Customer service is operated by Sensus.

- \- Supplier payments are scheduled rather than immediate.

- \- One main provider is selected for each critical external capability.

- \- Final designs and principal reusable components are supplied by the appointed design agency.

- \- There is no existing Sensus platform or historical order data to migrate.

## Exclusions

- \- Legal, tax, customs, accounting, and privacy advice.

- \- Acting as importer of record or performing customs classification.

- \- Brand identity, original user-experience design, photography, copywriting, and translation.

- \- Physical warehousing, packing, shipping, and return inspection.

- \- Native mobile applications.

- \- Continuous integration with systems used by individual houses.

- \- The artificial-intelligence assistant identified as a later phase.

- \- Independent certification and ongoing support after launch stabilization.

External transaction and software fees are also excluded from the development estimate.


## 10. Principal risks

| Risk | Proposed response |
| --- | --- |
| The operating model is not fully defined | Resolve the main rules and responsibilities |
|   | during fixed-price Phase 0 |
| Multi-house order logic is more complex | Validate the critical transaction through the |
| than expected | proof of concept |
| Houses share stock with other sales | Confirm the authoritative source and |
| channels | estimate synchronization separately |
| Product customs information is incomplete Require validated information before |   |
|   | publication |
| Shipping subsidies affect margin | Model customer charges and house |
|   | allocation during discovery |
| Refunds occur after supplier payment | Use delayed release, reserves, and |
|   | financial-ledger adjustments |
| Payment or shipping providers do not | Validate pilot countries and legal entities |
| support every country | early |
| Distributed returns create inconsistent | Agree routing, inspection, responsibility, |
| service | and timing before implementation |
| External providers fail temporarily | Use safe retries, monitoring, reconciliation, |
|   | and manual recovery tools |
| One house gains access to another house’s | Enforce server-side isolation and include |
| data | dedicated security tests |
| Designs, content, or decisions arrive late | Agree dependencies and delivery dates |
|   | during Phase 0 |
| The operational team is not ready for | Use pilot houses, training, procedures, and |
| launch | launch rehearsals |


## 11. Decisions required to establish the foundation

The following questions are the most important for the initial conversation. More detailed questions can be addressed during Phase 0.

- 1. Which entity will be the merchant of record and importer of record in each launch market?

- 2. Will houses always store and ship their own products, or will Sensus use a central logistics provider?

- 3. How should shipping be charged when one basket produces several parcels?

- 4. Which countries, currencies, and languages are required for the first release?

- 5. Will Medusa be the only stock system, or will some houses share stock with other channels?

- 6. Must Sensus approve every new product before publication?

- 7. Which complex product types—such as unique items, made-to-order goods, or personalization—are required at launch?

- 8. Where will returns be sent, who will inspect them, and when will customers be refunded?

- 9. When does a house become eligible for payment, and how often will supplier payments be made?

- 10. How are commission, shipping, discounts, payment fees, refunds, and chargebacks allocated?

- 11. Have preferred payment, tax and duty, shipping, content, and search providers already been identified?

- 12. What is the revised target launch window, and will there be a limited pilot before general launch?

Answers are not required before entering Phase 0.

Resolving them is a key Phase 0 outcome.


## 12. Recommended next steps

- 1. Review this proposal with Sensus commercial, operations, finance, and customer-service stakeholders.

- 2. Confirm that the two-phase commercial model is acceptable.

- 3. Identify the stakeholders and pilot houses required for Phase 0.

- 4. Confirm availability of existing policies, designs, and provider conversations.

- 5. Agree the Phase 0 start date and payment schedule.

- 6. Begin the four-week discovery and technical-validation engagement.

At the end of Phase 0, Sensus will have a validated technical direction, a clearer operating model, a demonstrated critical transaction, and a detailed commercial basis for deciding whether and how to proceed with the complete platform.
