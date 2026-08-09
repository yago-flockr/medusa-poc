# Backend — Entity-Relationship Model

> Persistence model for `apps/backend`. Derived from custom module sources under `src/modules/`.
> Update when schemas, references, or delete behavior change.

## Overview

- **Store:** PostgreSQL
- **ORM / layer:** Medusa module data models and migrations
- **Custom entities in this package:** none yet

Commerce tables (products, carts, orders, customers, regions, etc.) are owned by Medusa core modules installed via `medusa-config.ts`. This document tracks **chassis-owned** custom models only.

## Entity-relationship diagram

```mermaid
erDiagram
  %% No custom chassis entities yet.
  %% Phase 2 (plan.md) will add house-scoped product/order fields,
  %% consignments, and commission models here.
```

## Entities

None. When Phase 2 modules land, document each custom entity (fields, refs, delete behavior) here and link from `agents/backend.md`.

## Notes

- Seed helpers and region config (`src/lib/markets.ts`) are not persistence entities.
- Do not duplicate Medusa core schema in this file; link official commerce module docs instead.
