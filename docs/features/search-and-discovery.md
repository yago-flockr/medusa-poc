# Feature: helping a customer find what they didn't know to ask for

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`.

**Status:** idea
**Scope:** every clone

## What we want

A customer can find what they want whether they know its name, only its
category, or only a mood or occasion, and the pages that answer them are
built so the same query can be shared, linked, and found again — by a
person, a search engine, or increasingly an AI assistant shopping on someone
else's behalf.

## Why

A curated or editorial-led store rarely gets browsed the way a big-box
catalogue does; customers narrow down by feel as much as by category, and
they often start outside the store entirely, from a search engine or now an
AI answer engine. If the way we let customers cut the catalogue does not
actually match how they think about it, they route around our organization
of it instead of using it, and if what we publish is not legible outside the
store, we are invisible to a growing share of discovery.

## How it must work

**A customer arrives already knowing roughly what they want, or nothing at
all.** Typeahead gets them somewhere fast; a considered empty state and
suggestions handle the times a search finds nothing. Both need to feel like
part of the same product, not a separate tool bolted onto the store.

**A customer narrows a listing with filters that reflect how this catalogue
is actually cut** — by category, and by whatever other ways this clone's
catalogue is organized. Filters can be combined, each combination has counts
so a customer is not filtering into an empty result blind, and the page that
results is a real, linkable, shareable page — not a client-side state a
customer cannot bookmark or send to a friend. The browser's back button and
scroll position both have to behave the way a customer expects.

**Merchandising is a first-class part of discovery, not an afterthought.**
Staff can feature a collection, pin specific products above the algorithm's
own ordering, and connect editorial content into product rails, without
needing an engineer for every change.

**What we publish must be legible to machines as well as people.** Enough
structured information travels with every product and every editorial page
that a search engine, and increasingly a shopping assistant acting on a
customer's behalf, can understand what it is, what it costs, whether it is in
stock, and what happens if it needs to be returned — without having to guess
or scrape.

## Rules we already know

- **Filtered and searched pages are real, addressable pages** — the URL is
  the source of truth for what is currently filtered, not memory internal to
  the page.
- **Search and discovery are never trusted for a final price or
  availability** — they help a customer find a product; the commerce engine
  is still the only source of truth once they act on it.
- **Zero results is a designed state**, not a dead end.
- **Merchandising (featuring, pinning) is something staff can do directly**,
  without shipping code.
- **What a customer can filter by has to match how the catalogue is actually
  organized** — adding a way to filter is a catalogue decision as much as a
  technical one.
- Unknown: which external search service, if any, powers this — a
  `docs/plan.md` "Not decided."

## What each audience sees

**Customer** — a search and browse experience that behaves consistently
whether they arrive by typing, by filtering, or by a shared link, and gets
them to a real answer even when the first query fails.

**Our staff** — control over what gets featured or pinned, and visibility
into what customers are searching for that the catalogue does not currently
answer — which is itself a signal for what to curate next.

**Search engines and shopping assistants** — a version of the catalogue and
the editorial content that is structured and complete enough to be
understood, compared, and cited without needing to interpret a page visually.

## When it goes wrong

- **A search returns nothing.** The customer is offered a plausible
  next step (a suggestion, a related category), not a blank page.
- **A filter combination has no matches.** The customer is told that plainly
  and can back out of one filter at a time, rather than losing their whole
  search.
- **A product is reachable through more than one path** (by category, by
  theme, by search) and would otherwise look like several different pages to
  a search engine. It is treated as one thing with one canonical answer.
- **Stock or price changes between when a page was indexed and when a
  customer or an assistant reads it.** What is shown never overstates
  certainty the commerce engine cannot back up.

## Open questions

- Which external search or discovery service, if any, this clone uses.
- How much of merchandising (featuring, pinning, rails) needs to be
  self-service for staff versus configured by an engineer at launch.
- How aggressively to invest in AI-answer-engine visibility at launch versus
  treating it as an iteration once the store is live.

## How we know it works

Checked by hand: a customer can reach the same product by search, by
category, and by a themed landing page, and all three are stable, shareable
URLs. A filter combination with no matches shows a clear empty state rather
than nothing. A staff member features a product on a landing page without
engineering help. A product's structured data can be read and correctly
understood by an outside tool without opening the page in a browser.

## Out of scope

Which search technology or provider is chosen. Personalized or
recommendation-driven ranking. The editorial authoring experience itself:
`docs/features/content-and-editorial.md`.

## Related

- `docs/features/content-and-editorial.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
