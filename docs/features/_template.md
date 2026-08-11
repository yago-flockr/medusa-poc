# Feature: <name>

> Intent brief. **What must happen, not how we will build it.**
>
> Copy this file to `docs/features/<slug>.md`. Delete the guidance in angle
> brackets as you fill it in.

**Status:** idea | agreed | building | shipped
**Scope:** every clone | optional per clone | this clone only

## Rules for writing one of these

Keep. A brief survives a change of technology; it should read the same after we
swap a provider or restructure the code.

- Business language. A non-technical stakeholder must be able to disagree with it.
- **Specific about behaviour.** "The customer sees one order and separate tracking
  per parcel" — not "orders are handled well".
- Name the edge cases. What happens when it fails is usually the real requirement.

Leave out. These belong in `agents/` or in the code, and they date fast.

- Technology, libraries, providers, hosting, service names.
- File paths, folder layout, function or table names, code snippets.
- Which framework primitive implements it.
- Architecture decisions. If a decision is genuinely needed now, record it in
  `docs/plan.md`; otherwise let the build make it.

## What we want

<Two or three sentences in plain language. No technology.>

## Why

<Who benefits, and what is broken or expensive without it.>

## How it must work

<The flow, step by step, in the order it happens. Say who does each step: the
customer, the vendor, our staff, or the system. This is the heart of the brief and
should be the longest section.>

## Rules we already know

<Decided behaviour: percentages, who pays, who ships, what happens on refund, what
is allowed and what is refused. Write "unknown" where it is unknown — that is
useful too, and better than a guess that gets built.>

## What each audience sees

<Only if more than one audience touches this. Customer, vendor, staff. What is
visible, what is hidden, what they can change.>

## When it goes wrong

<Failure and edge cases: unavailable, cancelled, partially shipped, returned,
retried, disputed. What the system does and what each audience is told.>

## Open questions

<Business decisions that change what gets built. One line each. Mark the blocking
ones. Do not put technical questions here.>

## How we know it works

<Observable outcomes someone could check by using the product, not tests or
technical criteria. Link to `docs/spikes/<slug>.md` if an experiment is needed to
find out whether it is even feasible.>

## Out of scope

<Explicitly what this does not include, so it stays finishable.>

## Related

<Other briefs this depends on or overlaps with.>
