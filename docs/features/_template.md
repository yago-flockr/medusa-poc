# Feature: <name>

> Intent brief. Plain language first, Medusa mechanics second. Not a
> specification and not binding architecture — it exists so we start from the
> framework's own patterns instead of inventing a parallel one.
>
> Copy this file to `docs/features/<slug>.md`. Delete the guidance in angle
> brackets as you fill it in.

**Status:** idea | studying | spiked | building | shipped
**Scope:** base chassis | optional module | this store only

## What we want

<Two or three sentences in business language. No Medusa terms. A non-technical
person should agree or disagree with this paragraph.>

## Why

<Who benefits and what breaks today without it.>

## Rules we already know

<Bullet list of decided business rules: percentages, who pays, who ships, what
happens on refund. Write "unknown" where it is unknown — that is useful too.>

## Medusa building blocks we probably need

<For each one: the primitive, what it would hold or do, and a few lines of
illustrative code. Keep the snippets tiny; they are pointers, not the
implementation. Common primitives:>

| Need | Medusa primitive |
| --- | --- |
| Own new tables | custom module + data models |
| Relate to core data (product, order) | module link + Query |
| Business logic and rollback | workflow + steps + compensation |
| Reuse Medusa behaviour | core flow with `runAsStep` or a workflow hook |
| React to something that happened | subscriber on an event |
| Recurring work | scheduled job |
| Expose it | file-based API route + Zod validation + middleware |
| Non-admin, non-customer users | custom actor type |
| Show it to staff | admin widget or UI route |

## Open questions

<The things that decide the design. One line each. Mark the blocking ones.>

## How we prove it

<The smallest experiment that answers the open questions, and what result would
count as proof. Link to `docs/spikes/<slug>.md` when it exists.>

## Out of scope

<Explicitly what this feature does not include, so the spike stays small.>

## References

<Official docs pages only. Verify the page exists before adding it.>
