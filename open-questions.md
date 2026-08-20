### How we understand the sync (correct us if this is off)

```mermaid
flowchart TB
  DA[Vendor A's own customers<br/>direct sales, ongoing] -.-> A1
  DB[Vendor B's own customers<br/>direct sales, ongoing] -.-> B1

  subgraph SGA[VENDOR A - already trading]
    A1[Their Shopify store<br/>normal, unchanged]
  end
  subgraph SGB[VENDOR B - new to Shopify]
    B1[Sets up their own<br/>Shopify store]
  end

  A1 -->|product, stock, order| API[Shopify Admin API<br/>app installed per vendor]
  B1 -->|product, stock, order| API

  API --> MED[Medusa<br/>our sync + order engine<br/>not a storefront, not a Shopify app]
  MED --> STORE[sensus.com - our own storefront<br/>one catalogue, one basket, one checkout]
  STORE --> SALE((A customer<br/>buys something))
  SALE -->|we ping the vendor| A1
  SALE -->|we ping the vendor| B1
```

Basically: each vendor keeps their own normal Shopify store — nothing changes for
them. We just read their catalogue and stock in, group everyone's products on our
own site, and ping the vendor when something of theirs sells. Does that match what
you're picturing?

One more thing on this — both vendors above keep selling directly on their own
Shopify too, right? That's the reason this needs to be a live two-way sync, not a
one-off import.

### The doubts we actually have

- **Medusa vs. Shopify Plus itself** — your answer (Q13) says the RFP mandates
  "Shopify Plus core plus a marketplace app." We've been assuming that's about
  each vendor's own store, not our platform. If it actually means our own
  marketplace has to run on Shopify Plus, that's a completely different build —
  let us know which one you meant.
- **Payments** — Shopify Payments (Q8) seems to only work through Shopify's own
  checkout, not as a standalone gateway. Can we just collect the payment ourselves
  and pay vendors out on schedule instead? Same result, way less work for us.
