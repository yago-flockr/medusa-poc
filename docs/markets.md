# Sensus markets (localization config)

Source of truth in code: `apps/backend/src/lib/sensus-markets.ts`  
RFP markets: UK · EU · US. Launch sells UK-first (`gb` / GBP).

## Regions seeded

| Medusa region | Currency | Countries (ISO2) |
| --- | --- | --- |
| United Kingdom | gbp | gb |
| European Union | eur | at, be, de, dk, es, fr, ie, it, nl, pt, se |
| United States | usd | us |

Store default currency: **gbp**. Storefront default path country: **`gb`** (`NEXT_PUBLIC_DEFAULT_REGION`).

EU list is a **core** set for early localization, not full EU-27. Expand later if product needs it.

## Apply to a fresh or reset database

The initial seed creates these regions. If your local DB was seeded with the old single “Europe” region, either:

1. Reset Postgres (destructive) and run `pnpm exec medusa db:migrate` again from `apps/backend`, then recreate the admin user and sync the publishable key, or
2. Reconfigure regions manually in Medusa Admin to match the table above.

## Related

- Feasibility Launch markets assumption: `docs/feasibility-sensus-medusa.md`
- ADR: `docs/adr/0007-sensus-markets-uk-eu-us.md`
