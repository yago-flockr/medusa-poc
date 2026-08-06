# ADR 0007: Sensus markets UK · EU · US

- Status: accepted
- Date: 2026-08-06
- Deciders: engineering (PoC)

## Context

The RFP lists markets UK, EU, and US. The Medusa starter seeded a single Europe region (including `gb`) with EUR default and storefront default `dk`. Launch phasing is UK-first (feasibility doc).

## Decision

Configure three Medusa regions up front for localization and routing:

1. **United Kingdom** — `gb`, currency `gbp` (Launch default)
2. **European Union** — core EU country set, currency `eur`
3. **United States** — `us`, currency `usd`

Canonical list: `apps/backend/src/lib/sensus-markets.ts`. Storefront `NEXT_PUBLIC_DEFAULT_REGION=gb`.

This is localization / commerce region config only. It does not implement DDP, translations, or per-market content.

## Consequences

- Fresh seeds create the three regions and GBP/EUR/USD catalogue prices.
- Existing DBs seeded with the starter Europe region need a reset or manual Admin reconfiguration (`docs/markets.md`).
- Expanding EU-27 or adding locales (en-GB copy vs en-US) is a later change; keep the module as the single list to edit.
