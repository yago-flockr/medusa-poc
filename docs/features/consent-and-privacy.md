# Feature: asking before we track, and proving that we asked

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. The fixed constraint this expands on:
> **Nothing non-essential runs before the customer consents** in
> `docs/plan.md`.

**Status:** agreed in principle, unproven
**Scope:** every clone

## What we want

Nothing that is not strictly necessary to operate the store runs, loads, or
records anything about a customer until that customer has actively said yes,
and that choice follows them through the whole journey — including the
handoff into a payment step that may live on a different technical surface —
rather than resetting or being ignored partway through. What a customer
consented to, and when, has to be something we can still show months later.

## Why

This is a legal requirement in every market we operate in, not a feature we
are choosing to build. It is also one of the easiest things to get quietly
wrong: a script that fires before the banner is answered, a preference that
does not survive a redirect, a server-side event that ignores what the
client-side already respected. Any of those turns a compliant-looking banner
into a false promise.

## How it must work

**Before any choice is made**, only what is strictly necessary to operate
the site is allowed to run. Nothing else — no analytics, no marketing pixel,
no third-party embed — fires speculatively while we wait for an answer.

**A customer is asked in a way that matches where they are.** The UK and EU
expect an opt-in choice before anything non-essential runs; several US
jurisdictions instead expect an opt-out with a signal that data is being
sold, and refusal has to be exactly as easy as acceptance everywhere. The
platform has to know which regime applies to the person in front of it and
present the right one.

**Consent is granular and can be withdrawn as easily as it was given.** A
customer can say yes to some categories and no to others, revisit that
choice at any time from a persistent preference control, and have a
withdrawal take effect immediately, not at the next page load by
coincidence.

**The choice survives the entire journey**, including the seam between a
headless storefront and a checkout that may be hosted somewhere else
entirely. A customer who declines tracking on the storefront must not be
tracked once they reach checkout because the two surfaces did not share the
answer.

**Consent is respected on the server as much as the client.** Anything
recorded server-side about a customer's behaviour has to check the same
recorded choice a client-side script would have checked, so a technically
sophisticated integration cannot quietly bypass a customer's stated refusal
just because it runs out of view.

**Every consent decision is recorded and stays reviewable** — what was
asked, what was chosen, and when — because "we did ask" has to be something
we can actually demonstrate, not just believe.

**Beyond consent to be tracked, a customer can ask what we hold about them
and ask for it to be corrected or erased.** The platform needs a real,
working path for both, not just a promise in a policy document.

## Rules we already know

- **Nothing non-essential runs before an active choice is made.** This is
  fixed, not a preference (`docs/plan.md`).
- **Refusal is exactly as easy as acceptance.** A banner that makes "accept
  all" one click and "reject" three does not satisfy this.
- **Consent is granular, by category, and withdrawable at any time** through
  a persistent control, not a one-time banner that never reappears.
- **The choice is geo-aware**: opt-in where the market requires it, opt-out
  with a sale signal where the market instead expects that.
- **The choice must hold across the storefront-to-checkout seam**, even when
  checkout is hosted on a different technical surface.
- **Server-side recording respects the same choice as client-side.**
- **Consent records are auditable** — reconstructable after the fact, not
  just enforced in the moment.
- **A customer can request their data, its correction, or its erasure**, and
  get a real answer.
- Unknown: what we retain, for how long, once a customer's relationship with
  us ends — a per-clone data retention decision this brief assumes exists but
  does not itself set.

## What each audience sees

**Customer** — a clear, accessible choice up front, an always-available way
to change their mind, and a straightforward way to ask what we hold about
them or have it erased.

**Our staff** — a record of what was consented to and when, for any customer,
without needing an engineer to reconstruct it from logs.

## When it goes wrong

- **A customer withdraws consent mid-session.** Whatever they opted out of
  stops immediately — it does not wait for a new page load, a new session,
  or a batch job to catch up.
- **A customer moves from the storefront into checkout.** Their choice moves
  with them; checkout does not start from a blank, unasked state.
- **A customer requests erasure.** We can actually locate and remove what we
  are able to, and tell them plainly about anything we are legally required
  to keep and for how long.
- **Someone later asks "did we have consent for this."** The answer is
  reconstructable from a record, not a guess about what the banner probably
  said at the time.

## Open questions

- Which specific jurisdictions beyond the baseline (UK, EU) a given clone
  needs geo-aware handling for, and what each one actually requires.
- How data-subject requests are actually fulfilled operationally — self-serve
  tooling, or a staff-run process with a committed turnaround.
- Retention periods per data category, per clone.

## How we know it works

Checked by hand: loading the storefront before answering the consent banner
triggers nothing non-essential — no analytics call, no third-party script.
Declining a category and reloading still has it declined. Withdrawing
consent stops the relevant behaviour immediately. Moving from storefront to
checkout carries the same consent state across, verifiable on both sides.
A data-subject erasure request produces a real, traceable outcome.

## Out of scope

Legal advice on which disclosures a policy document itself must contain.
Which analytics or marketing tools are used — those are always subject to
whatever consent state applies, not the other way round. Identity and
account security: `docs/features/identity-and-access.md`.

## Related

- `docs/features/identity-and-access.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
