# Shopify Dev Dashboard app configuration

How to configure a vendor's Shopify app in the Dev Dashboard
(`dev.shopify.com`) so its OAuth connection actually works with our backend.
This is the "staff configures Shopify" half of onboarding a vendor — for
the full per-vendor runbook (including the admin-UI side), see
`docs/vendor-shopify-connection-guide.md`.

One app per vendor, always — Shopify's Custom Distribution caps a single
app at one live production store, so this whole page gets repeated once
per new vendor, not configured once and reused.

## Step 1 — Create the app

1. Open `https://dev.shopify.com/dashboard/228592484/apps/new`
2. App name: anything unique, but **it can't contain the word "shopify"**
   — Shopify rejects that. Use something like `<vendor>-poc` or
   `<vendor>-sync`.
3. Click **Create app**

## Step 2 — Scopes and redirect URLs

On the **Versions → Create a version** screen:

1. **Scopes**: `read_products,read_inventory`
2. **Allowed redirection URL(s)** — comma-separated, add both:
   - the local test placeholder: `https://localhost.invalid/hooks/shopify/oauth/callback`
   - the real prod callback: `https://medusa-poc.medusajs.app/hooks/shopify/oauth/callback`

   Setting both now means this app's config never needs touching again
   once it moves from local testing to the real vendor.

## Step 3 — Turn off embedding

Under **URLs**, **uncheck "Embed app in Shopify admin."** This defaults
to checked, and it's not optional to skip:

- With it checked, Shopify sends the merchant's browser to the app's
  **App URL** first, expecting _our own server_ to then redirect them on
  to Shopify's real consent screen. We don't have that redirector built,
  so the merchant lands on a dead page (`hmac`/`shop`/`timestamp` in the
  URL, but no `code`) and the connection silently never happens.
- With it unchecked, we can send the merchant straight to Shopify's real
  `/admin/oauth/authorize` consent screen ourselves (Step 5 below), and
  App URL is never loaded at all.

**App URL** itself can stay as the default `https://example.com` — once
embedding is off, Shopify never requests it, so its value doesn't matter.

Click **Release**.

## Step 4 — Configure distribution

Even though we won't use the link this screen generates (see Step 5),
this step is still required — it's what actually authorizes a specific
external store to complete OAuth with this app at all:

1. Click **Distribution** in the left sidebar
2. **Choose distribution** → **Custom distribution**
3. Enter the vendor's store domain (`<their-store>.myshopify.com`)

## Step 5 — Build the install link ourselves

Don't send the vendor the link this dashboard generates — in testing, it
routes through the App URL launch described in Step 3 and doesn't work
without a redirector we don't have. Instead, our backend builds the real
authorization URL for you — in Admin → Vendors, use the **Copy Shopify
install link** row action (see `docs/vendor-shopify-connection-guide.md`
Step 3). It already handles the local-testing redirect quirk below
automatically, so you don't need to build the URL by hand; the shape is
shown here for reference:

```
https://<their-store>.myshopify.com/admin/oauth/authorize?client_id=<client id from Settings>&scope=read_products,read_inventory&redirect_uri=<url-encoded redirect uri>&state=<any random string>
```

Example (URL-encoded redirect_uri):

```
https://sensus-en0h00hi.myshopify.com/admin/oauth/authorize?client_id=a0fc51ec861a2347b0decc49bb8310f7&scope=read_products,read_inventory&redirect_uri=https%3A%2F%2Flocalhost.invalid%2Fhooks%2Fshopify%2Foauth%2Fcallback&state=test-state-1
```

Opening this directly takes the merchant to Shopify's real approval
screen. Approving it redirects to whichever redirect URL was passed —
with `code=` this time — which our `complete-vendor-shopify-connection`
workflow (behind `/hooks/shopify/oauth/callback`) exchanges for an access
token automatically.

## Prerequisite before sending the link

Our callback matches Shopify's redirect back to a vendor by store domain,
so the vendor's `shopify_store_domain` / `shopify_client_id` /
`shopify_client_secret` must already be saved on their Vendor record
(Admin UI → Vendors → edit vendor) **before** anyone opens the Step 5
link — otherwise the callback has nothing to match against and fails.

## Local-testing-only note

Shopify rejects any `http://` redirect_uri outright — it's not just a
whitelist-exact-match issue, `https://` is required unconditionally, so
`http://localhost:...` can never be whitelisted or used directly during
local development. `https://localhost.invalid` is the safe placeholder —
that TLD is reserved to never resolve, so the browser fails to load it but
still shows the full URL (including `code=`) in the address bar, and
nothing is ever sent to a real third-party server.

Both install-link routes (`buildShopifyInstallLink` in
`apps/backend/src/integrations/shopify/oauth.ts`) detect a `localhost`/`127.0.0.1`
request and substitute this placeholder automatically, so the **Copy
Shopify install link** button already generates a working link locally —
no manual URL edits needed. What still can't be automated (no public
tunnel for local dev, by design — see `docs/plan.md`): after approving,
copy the query string from the dead `localhost.invalid` page and replay
it against the real local callback
(`http://localhost:9000/hooks/shopify/oauth/callback?...`) to finish the
connection. This replay step is unnecessary once testing against a real
deployed `https://` backend — the install link then points straight at
that URL and Shopify's redirect lands on it directly.
