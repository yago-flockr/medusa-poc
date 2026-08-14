# Feature: editorial and pages that sell without owning the truth

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`.

**Status:** idea
**Scope:** every clone

## What we want

Editors — not engineers — build the pages that are not a single product: a
homepage, a landing page for a season or a theme, an article that tells a
story and happens to mention things a customer can buy. Those pages are
composed from reusable blocks, and any block that mentions a real product has
to show that product's real price and real availability at the moment someone
reads it, not whatever was true when the page was written.

## Why

Discovery for a curated or editorial-led store rarely starts on a product
page. It starts on a story, a season, a homepage a merchandiser rearranged
this morning. If editors cannot ship that without an engineer, the store's
main way of being discovered is bottlenecked on the wrong team. And if a
product mentioned in an article can go out of stock or change price without
the article knowing, the store lies to the customer by omission.

## How it must work

**An editor composes a page from blocks** — text, imagery, a product
reference, a collection, a call to action — arranging and rearranging them
without writing code. Some pages are one-off (a homepage, a seasonal
landing); others are a running series (an article feed, ordered by
publication date).

**A block can reference a real product**, and when that block renders, it
shows that product's actual current price and actual current availability,
resolved at the moment of rendering rather than copied in at authoring time.
A customer reading an article about a product must be able to add it to their
basket from inside that article, not just read about it and go find it
elsewhere.

**Content never becomes the source of truth for anything commercial.** An
editor can decide what to say about a product and where to feature it; an
editor cannot make it cheaper, make it in stock, or change what it actually
is. If the commerce engine and the content system ever disagree about a
price or an availability, the commerce engine is right.

**Editors need to preview before publishing** — a draft that renders as it
will look live, reachable only by the people meant to see it, so a mistake
never reaches a customer.

**Some pages are structural rather than editorial** — the pages that carry a
whole way of cutting the catalogue (by season, by category, by whatever
taxonomy this clone uses) rather than one written piece. Those still need
editors to control what leads and what is featured, without needing an
engineer for every reshuffle.

## Rules we already know

- **Content references products; it never owns price, stock, or product
  truth.** The commerce engine wins every disagreement.
- **A product mentioned in an article must be addable to basket from within
  that article.**
- **Editors publish without engineering involvement** for routine changes —
  new article, reordered homepage, updated seasonal landing.
- **Draft and preview happen before a customer can see the result.**
- **Pages are composed from a small set of reusable blocks**, not
  one-off custom pages built per campaign.
- Unknown: whether product copy itself (title, description) lives in the
  commerce engine or in the content system — this needs a single stated home
  so it is never edited in two places that can disagree.

## What each audience sees

**Customer** — pages that read as one coherent, current store: nothing they
read about is out of stock or wrongly priced by the time they try to buy it.

**Editors** — a block library they can arrange freely, a preview of what a
customer will see before it goes live, and a clear line between what they
control (the story, the layout, the featuring) and what they cannot touch
(the price, the stock, the fact of the product).

**Our staff** — visibility into what is currently live, what is scheduled,
and the ability to pull something down quickly if it turns out to be wrong.

## When it goes wrong

- **A featured product sells out or is discontinued.** The page keeps
  working — it reflects the real state (out of stock, or the reference quietly
  removed) rather than showing something that can no longer be bought as if
  it still could.
- **An editor publishes a mistake.** It can be corrected or unpublished
  immediately, without an engineer, and without needing to redeploy anything.
- **The content system and the commerce engine disagree** about a price or a
  description. The commerce engine's answer is what the customer sees;
  the disagreement itself should be visible to whoever can fix it.
- **A preview link leaks.** It is scoped and access-limited, not a public URL
  indistinguishable from the live page.

## Open questions

- Where does product copy (title, description, imagery) live: the commerce
  engine, a separate product-information system, or the content system?
- Which pages are fully free-form for editors, and which are structural
  templates editors can only feature into (a homepage vs. a category landing,
  for example)?
- How much editorial history and rollback does a clone need — is "who changed
  this and when" a requirement, or is undo enough?

## How we know it works

Checked by hand: an editor builds a page entirely from blocks, publishes it
without engineering help, and a product referenced inside an article can be
added to basket from that article and shows its real, current price and
stock. Taking that product out of stock is reflected on the page without
anyone touching the page itself. A draft is visible in preview and invisible
to a customer until published.

## Out of scope

Which content management system a clone uses — that stays a `docs/plan.md`
"Not decided." Translation and localization workflow. Editorial approval
workflow beyond draft/preview/publish. Search and merchandising surfaces that
consume this content: `docs/features/search-and-discovery.md`.

## Related

- `docs/features/search-and-discovery.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
