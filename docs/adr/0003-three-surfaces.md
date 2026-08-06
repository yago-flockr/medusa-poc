# ADR 0003: Three surfaces, one commerce core

- Status: proposed
- Date: 2026-08-06
- Deciders: engineering (PoC)

## Context

Sensus requires three products sharing one data model (RFP section 03):

1. **Customer storefront**: discovery, editorial, purchase, post-purchase across multi-house orders.
2. **House portal**: onboarding, catalogue/stock, fulfilment (print central labels), payouts.
3. **Admin portal**: curation, applications pipeline, central orders/returns, commission ledger, CMS composition.

Design (Figma) is owned by a separate agency (AndMelo). Build implements against that system.

## Decision (working)

- **Customer storefront**: `apps/storefront` (Next.js Medusa starter), customized to Sensus information architecture.
- **Admin**: Medusa Admin at `/app`, extended via `apps/backend/src/admin`.
- **House portal**: a custom surface (Medusa auth plus APIs or dedicated routes). Do not rebrand Medusa Admin as the house experience.

All three talk to **one Medusa backend** as system of record for commercial data. CMS owns content that references products; it never owns price or stock truth (RFP 7.6).

Identity: three audiences (customer, house user, staff) with separate auth concerns and hard house data isolation (RFP 7.10).

## Consequences

- Scope is not storefront-only. House portal and admin extensions are first-class.
- WCAG 2.2 AA applies to all three surfaces.
- AI assistant behavior is Phase 2, but UI entry point and data model should be reserved at launch (RFP 7.7).
- Design arrives mid-build: domain, modules, and APIs proceed against provisional UI.
