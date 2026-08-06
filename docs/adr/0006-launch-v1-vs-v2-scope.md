# ADR 0006: Launch (v1) vs v2 scope

- Status: proposed
- Date: 2026-08-06
- Deciders: engineering (pending Sensus / AndMelo confirm)

## Context

`sensus.md` asks for a complete product at launch (all three surfaces, full curation, editorial, marketplace ops), with only the AI assistant deferred. The calendar (build ~1 Dec, public ~5 Dec) and the need to **build** multi-vendor mechanics on Medusa make that full scope unrealistic.

## Decision (proposed)

Adopt the phasing in `docs/feasibility-sensus-medusa.md`:

1. **P0 spike** before heavy UI: two houses, one multi-house order, split, pay, fulfill, partial refund, commission visible.
2. **Launch / v1**: credible UK-first marketplace (multi-house buy + thin house portal + staff admin + essential storefront). Not full RFP.
3. **v2**: CMS/Journal, advanced search, full consignment/returns matrix, automated payouts, Shopify connector, multi-market DDP, analytics warehouse, AI beyond shell, passwordless, full a11y audit matrix.

Protect items in the document’s **Importance order**. Cut from the bottom under calendar pressure.

## Consequences

- Stakeholder communication must say Launch is a **phased credible product**, not silent non-delivery of RFP lines.
- Engineering plans and AI agents use Launch checklists, not the full sitemap, as the default backlog.
- Accepting this ADR means updating commercial/timeline narrative with the client; rejecting it means revisiting date or team size.

## Confirm

- [ ] Sensus co-founders agree Launch vs v2 split
- [ ] AndMelo design sequencing aligned (domain work before final pixels)
- [ ] Shipping charge policy chosen for v1
- [ ] Status → accepted (or superseded with alternate cut list)
