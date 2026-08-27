# Security hardening backlog

> Known gaps, mapped on purpose rather than fixed. Nothing here blocks local
> testing — this file exists so nothing gets forgotten before real vendor or
> customer data, or real payments, touch this chassis. Update it in the same
> session whenever new work surfaces something that belongs here (same rule
> as `agents/overview.md` "Maintaining project documentation").

Each item: what it is, why it matters, what "fixed" looks like. Ordered by
area, roughly worst-first within each area. None of these are theoretical —
each was found while building or adversarially testing the marketplace spine
(`docs/plan.md`), not invented for this list.

## Vendor identity and tokens

- **RESOLVED locally: `JWT_SECRET`/`COOKIE_SECRET` were literal placeholders
  (`supersecret`) in `apps/backend/.env`.** Anyone who had read this repo
  could forge a valid token for any actor type, vendor included — the single
  highest-impact item on this list. Replaced with two real random 256-bit
  secrets in the local (gitignored) `.env`; `.env.template` intentionally
  keeps the placeholder so it stays an example, not a real value to copy.
  Still open: this only fixes the one developer machine it was run on —
  **every other environment (staging, any teammate's machine, a future
  deploy) needs its own freshly generated secrets**, never the same value
  copied across environments, and never committed.
- **RESOLVED: public self-registration is fully closed.** The
  `POST /vendors` public create route and its backing workflow were deleted
  outright, not just gated — every vendor and vendor user is now created
  from Admin (`/admin/vendors`, `/admin/vendor-users`), with a
  server-generated random password (never staff- or vendor-typed) returned
  once for staff to share manually. Still open: a real invite model (email
  + token, vendor chooses their own password), mirroring Medusa's own
  `createInvitesWorkflow`/`acceptInviteWorkflow` pattern for the User
  module — this replaces "staff shares a generated password manually," which
  is accepted as v1 UX debt, not a security gap, since the password itself
  is never weak or staff-chosen.
- **The vendor JWT lives in browser `localStorage`, not an `httpOnly`
  cookie.** A deliberate tradeoff (`docs/plan.md` Decisions) for portability
  to a future standalone deploy, but the real cost: any JS running on the
  page — including anything an XSS bug injects — can read it directly, unlike
  the customer flow's `httpOnly` cookie. Acceptable while the vendor portal
  is pre-invite-flow test scaffolding; revisit (shorter-lived tokens, a
  refresh flow, or accepting the cookie-based pattern if the portability bet
  never gets used) before it carries real vendor data.
- **No token refresh, rotation, or server-side revocation.** A vendor token
  is valid for its full lifetime (Medusa's default, 24h) with no way to
  invalidate it early — if one leaks, waiting it out is the only mitigation.
  Fix: shorter-lived tokens plus a refresh flow, or a revocation list keyed
  off `auth_identity_id` for "log out everywhere" / offboarding a vendor.
- **Password policy, MFA, and login rate-limiting for the `vendor` actor
  type haven't been reviewed.** Medusa's `emailpass` provider and MFA
  support are core code we're relying on as-is, not auditing ourselves — this
  is a note to actually check Medusa's defaults (minimum password strength,
  brute-force protection on `/auth/vendor/emailpass`) rather than assume
  they're adequate, and to decide whether the `vendor` actor type should
  offer MFA the way `identity-and-access.md` implies it should ("proves
  itself more strongly than a shopper does").

## Shopify vendor connection (OAuth)

- **`shopify_client_secret` and `shopify_access_token` are stored as plain
  text in Postgres, no encryption at rest.** Found while building the vendor
  Shopify OAuth connection (`docs/vendor-shopify-connection-guide.md`,
  `shopify-app-config.md`) — a database dump, backup leak, or any other
  read access to the `vendor` table hands over a live, directly-usable
  credential against a real vendor's real Shopify store. Not fixed yet:
  this POC uses no real payments (no Stripe or similar) and every store
  connected so far is a test store, so the actual blast radius today is
  low — but this is explicitly **not acceptable for the v1 release** and
  must be fixed before then, no exceptions. Hashing is the wrong tool here
  (it's one-way; we need the plaintext back to call Shopify's API on the
  vendor's behalf) — the fix is real encryption at rest: AES-256-GCM via
  Node's built-in `crypto`, keyed by a secret env var, applied to just
  those two columns (`shopify_client_id`/`shopify_store_domain` aren't
  secret and can stay plain). Whoever implements this must also decide how
  the encryption key is provisioned and backed up — losing it makes every
  already-stored token permanently undecryptable, forcing every connected
  vendor to reconnect from scratch.
- **RESOLVED: the OAuth callback now validates the `state` parameter.**
  `shopify_oauth_state` is generated and saved on the Vendor row when the
  install link is built, checked against the callback's `state` before the
  code is exchanged, and cleared after a successful connection
  (`verify-shopify-oauth-state` step). Previously generated but never
  checked — a real gap, not just theoretical, since it looked like CSRF
  protection existed when it didn't.
- **The install-link route (`.../shopify/connection/install-link`) builds
  the callback's `redirect_uri` from `X-Forwarded-Proto`/`X-Forwarded-Host`
  request headers, with no Express `trust proxy` configured anywhere in the
  repo (confirmed via grep).** Those headers are ordinary client-supplied
  input unless the framework is told which proxy to actually trust, so in
  principle a caller could send a fake `X-Forwarded-Host` and get an install
  link whose `redirect_uri` points somewhere else. Real exploitability is
  low today — this route requires admin auth already, and Shopify
  independently checks `redirect_uri` against that vendor's app's own
  allowlist, so a spoofed host would also need to already be a registered
  redirect URL on that specific Shopify app. Proper fix: configure Express's
  `trust proxy` setting (scoped to Cloud's actual proxy, not "trust
  anything") so `req.protocol`/`req.hostname` become the safe,
  framework-verified source instead of reading forwarded headers by hand.
- **`exchangeShopifyOAuthCodeStep`'s compensation (uninstall the app via
  Shopify's `appUninstall` mutation if a later step in the same workflow
  fails) is unverified in practice.** It's a genuine, non-fabricated attempt
  at real compensation (the codebase's own rule: every side-effecting step
  needs one) using a real, documented Shopify mutation — but exercising it
  needs a failure injected *between* a successful token exchange and the
  following DB write, which hasn't been tested live. If it's ever needed for
  real, confirm it actually revokes access rather than silently failing.

## Authorization structure

- **Ownership checks are correct today but enforced by hand, per route, not
  structurally.** Every `/vendors/*` route we've written re-derives the
  vendor from `req.auth_context.actor_id` and never trusts a client-supplied
  id — verified repeatedly (cross-vendor 404s, strict-schema tampering
  rejected). But nothing stops a future route from forgetting that check;
  there's no shared policy layer enforcing it. Fix: at minimum, a checklist
  or lint rule for "every new `/vendors/*` route must derive its scope from
  `actor_id`, never from `req.params`/`req.body`" — a real policy middleware
  if the number of routes grows enough to justify one.
- **No audit trail for the manual staff "publish" step.** A vendor's product
  sits at `status: "proposed"` until a staff member flips it to `published`
  by hand in Admin (there's no approval workflow yet, `agents/backend.md`).
  Once more than one staff member does this, there's no record of who
  approved what, or when. Not a live vulnerability, but a real gap once
  "who approved this" needs to be answerable.

## File uploads (`POST /vendors/uploads`)

- **Content-type is validated against the client-declared MIME type only,
  not the file's actual bytes.** `src/api/vendors/uploads/route.ts` checks
  `file.mimetype` (a multipart form field the _client_ sets) against an
  allow-list. That correctly rejected an obviously-mislabeled shell script in
  testing (`Content-Type: text/x-sh`) — but a file whose real content is
  malicious with `Content-Type: image/png` declared honestly by an attacker
  would sail through unchallenged, since nothing inspects the actual bytes
  (a magic-number/content-sniffing check). Fix: verify actual file content
  matches the claimed type (e.g. a magic-byte check or an image-decoding
  library that fails on non-image data) before trusting it.
- **No re-encoding of uploaded images.** Files are stored and served exactly
  as uploaded. Re-processing through a real image library (e.g. resizing via
  Sharp) is a common second line of defense — it strips embedded scripts or
  unexpected metadata from a file that passed the type check but is still
  hostile. Not implemented.
- **No malware/virus scanning.** Fine for local dev (Local File provider);
  a real deployment behind S3 or similar should decide whether to scan
  uploads before they're servable.
- **No per-vendor upload quota over time.** Each _request_ is capped (5MB,
  5 files), but nothing stops a vendor from calling the endpoint repeatedly
  to exhaust storage. A storage-exhaustion angle, not a single-request one.
- **Filename sanitization is trusted, not independently verified.** Medusa's
  own File module handles the on-disk filename; we haven't audited that it's
  safe against path traversal or collision attacks ourselves — reasonable to
  trust core framework code, but noted as "trusted, not verified" rather than
  silently assumed.

## Abuse and rate-limiting

- **No rate limiting on vendor registration, login, product creation, or
  uploads.** A scripted attacker could hammer any of these today. Likely an
  infrastructure-level concern (reverse proxy / API gateway) rather than
  application code, but it's not in place at either layer right now.
- **No cap on how many products a vendor can create.**
  `docs/features/multi-vendor-marketplace.md` explicitly calls for a vendor
  product limit ("may be capped on how many products it can have live at
  once, enforced"); this is both a business-rule gap and a low-effort abuse
  vector (unbounded catalog spam) until it exists.
- **No validation on price bounds beyond "positive."** A vendor can set
  £0.01 or £999,999 with nothing stopping either. Business-integrity risk
  more than a security one, but adjacent enough to note here.

## Cross-origin and transport

- **`VENDOR_CORS` is a single manually-set origin per environment.**
  Correctly scoped today (verified: an unlisted origin gets no CORS headers,
  a valid one does), but it's a manual value that has to be kept in sync
  per environment and could be misconfigured overly broad later. Worth a
  deliberate check whenever a new environment is stood up.
- **CORS is not an authorization boundary — it only restricts which browser
  origins can make the call.** A stolen token still works fine from curl or
  any non-browser client regardless of `VENDOR_CORS`. Worth remembering so
  CORS is never mistaken for the actual access control (the JWT check and
  per-route ownership derivation are).

## Frontend rendering

- **No Content-Security-Policy configured**, on the vendor pages
  specifically or the storefront generally. Would meaningfully reduce the
  impact of an XSS bug, which matters more here than elsewhere given the
  `localStorage` token above.
- **XSS-safety of vendor-supplied text (title/description) relies entirely
  on React's default escaping.** Verified once (a `<script>` title round-trips
  as inert text, not executed) but not audited across every place a product's
  title/description is rendered in the storefront — if any existing or future
  component uses `dangerouslySetInnerHTML` for product content, that
  protection breaks silently.

## Order/payment integrity (cross-reference)

- **The order-splitting model is explicitly not settled**
  (`docs/spikes/multi-vendor-order.md`) — child orders vs. consignment
  records. Not a security bug, but a correctness-under-retry concern
  adjacent to it: anything built on refunds/payouts before that's decided
  inherits whatever gaps the eventual answer closes. Don't build payment-
  moving logic against the current shape yet.
