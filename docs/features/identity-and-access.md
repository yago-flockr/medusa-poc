# Feature: knowing who someone is, and what they may touch

> Intent brief. **What must happen, not how we will build it.**
> Shape: `docs/features/_template.md`. Vendor onboarding itself:
> `docs/features/multi-vendor-marketplace.md`.

**Status:** agreed in principle, unproven
**Scope:** every clone

## What we want

Three different kinds of person use the platform — a customer, a vendor's
staff, and our own staff — and each needs a different proof of who they are
and a different, non-negotiable boundary on what they can see. A customer's
identity is theirs to create freely. A vendor's identity is granted, not
requested, and carries other people's private data, so it is held to a higher
standard. Our own staff's identity carries the ability to act on behalf of the
whole business, across every vendor at once.

## Why

Get this wrong and the rest of the platform's promises — that a vendor never
sees another vendor's orders, that a customer's address is only visible to
whoever is shipping to it, that a refund can be traced to the person who
approved it — are just intentions. Identity and access are what make those
promises actually hold, structurally, rather than by everyone remembering to
check.

## How it must work

**A customer** creates their own account, or checks out without one. Either
way, the same session has to carry them from browsing, through a basket, into
a payment step that may live on a different technical surface entirely,
without them noticing a seam or having to re-prove who they are partway
through.

**A vendor user** is invited, never self-registered — onboarding decides who
gets in, identity only decides that the person who arrives is who was
invited. Because a vendor account can see customer names and delivery
addresses, it proves itself more strongly than a shopper does before it is
trusted with that view.

**A staff user** is given a role by us, and that role decides what they can
see and do — reading orders is not the same permission as issuing a refund or
approving a payout run. Someone who only needs to look something up should
never be handed the same access as someone who can move money.

**Isolation between vendors is structural, not habitual.** A vendor's
identity carries which vendor it belongs to, and every place that answers "get
me this vendor's data" has to derive its answer from that identity rather than
trust a value the request itself supplied. A vendor should not be able to see
another vendor's anything by changing a number in a request — the boundary
has to hold even against someone actively trying to cross it, and that has to
be something we can demonstrate, not just assert.

## Rules we already know

- **Three identity domains, kept separate**: customer, vendor, staff. None of
  them is a variation on another.
- **A vendor account is invited, never self-registered.**
- **A vendor user proves itself more strongly than a customer does**, because
  of what it can see.
- **Staff access is role-based**, and a role can be narrower than "everything."
- **A customer's session survives the handoff** between the storefront and
  wherever payment is actually captured, with no visible seam and no
  repeated login.
- **Isolation is enforced at the point data is fetched**, keyed off who is
  asking, not off a value the caller can set.
- Unknown: whether passwordless entry is offered to customers.
- Unknown: exactly which staff roles exist and what each may do — the
  boundary between "can see" and "can act" is decided per clone.

## What each audience sees

**Customer** — their own account, their own orders and addresses, nothing
belonging to anyone else, and a checkout that never asks them to log in twice.

**Vendor** — its own dashboard and nothing else, reached through a stronger
login than a customer needs, granted by invitation rather than opened by
signing up.

**Our staff** — access shaped by their role: some see everything read-only,
some can act on orders or payouts, and the system remembers which role did
which action.

## When it goes wrong

- **A vendor user tries to reach another vendor's data**, by guessing an
  identifier, replaying a request, or any other means. The request is
  refused at the point of fetching data, not filtered out afterwards, and the
  attempt is something we can see happened.
- **An invited vendor user's access needs to be revoked** — because they left
  the vendor, or the vendor itself is offboarded. Access ends immediately;
  nothing about their prior actions disappears with them.
- **A staff member's role changes.** What they can do changes with it,
  immediately, without a new login being required to make it take effect.
- **A customer's session breaks partway through checkout.** They are told
  clearly and returned to a safe state, not left unsure whether they paid.

## Open questions

- Does a customer get passwordless entry, or only a traditional login?
- What are the actual staff roles for a given clone, and what does each one
  allow?
- Does a vendor need more than one internal role (for example, someone who
  fulfils versus someone who sees the statement), or is "vendor user" one
  undifferentiated level of access at launch?

## How we know it works

Checked by hand: a vendor user can be created only by invitation, logs in
with a stronger check than a customer's login, and every attempt to reach
another vendor's orders, customers, or figures is refused — including a
deliberate attempt to do so by manipulating a request rather than using the
interface. A customer can move from browsing to a paid order without a second
login, even where payment happens on a separate technical surface. A staff
action (a refund, a payout approval) can be traced afterwards to the specific
person and role that performed it.

## Out of scope

Which specific staff roles exist for a given clone. Whether social login or
passwordless entry is offered to customers. Vendor onboarding itself — who
gets invited and why — belongs to `docs/features/multi-vendor-marketplace.md`.

## Related

- `docs/features/multi-vendor-marketplace.md`
- `docs/features/consent-and-privacy.md`
- `docs/plan.md` — what we need overall, and what is deliberately still open
