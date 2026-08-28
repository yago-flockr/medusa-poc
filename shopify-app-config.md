# Connect your store to Shopify

How to create your own Shopify app and connect your store here. This is
one-time setup, and you do it yourself from your vendor panel — no staff
involved once you have a login.

Shopify requires **one app per store** (its Custom Distribution only
allows one live production store per app), so this is specific to your
store — you can't reuse an app from anywhere else.

## Checklist

1. **Create the app** — `https://dev.shopify.com/dashboard/<your-org-id>/apps/new`
   (your own Shopify Partner/Dev Dashboard). Any name works except one
   containing "shopify" (Shopify rejects it) — e.g. `<your-store>-sync`.
2. **Versions → Create a version:**
   - Scopes: `read_products,read_inventory`
   - Allowed redirection URL(s) — add both, so you never need to touch
     this again:
     - `https://localhost.invalid/hooks/shopify/oauth/callback`
     - `https://medusa-poc.medusajs.app/hooks/shopify/oauth/callback`
   - Under **URLs**, uncheck **"Embed app in Shopify admin"** (checked by
     default) — leave **App URL** as the default `https://example.com`,
     it's never loaded once unchecked
   - Click **Release**
3. **Distribution → Custom distribution** → enter your store's domain
   (`<your-store>.myshopify.com`) — required even though you won't use the
   link this screen generates (your vendor panel builds the real one).
4. **Settings** → copy **Client ID** and **Client secret**.
5. On your vendor panel's **Shopify** page: paste your store domain,
   Client ID, and Client secret, and save.
6. Click **Connect to Shopify** on that same page — it opens Shopify's
   real approval screen. Approve it, and you're back on your panel,
   connected.

That's it — nothing else to do, and no one else needs to be involved.

## Troubleshooting / why

- **Why uncheck "Embed app in Shopify admin"?** Checked (the default)
  sends you to the app's **App URL** first, expecting it to redirect you
  on to Shopify's consent screen — that redirector doesn't exist, so
  you'd land on a dead page (no `code` in the URL) and the connection
  would silently never happen. Unchecked, your panel sends you straight
  to the real consent screen itself (step 6 above).
- **Why not the Distribution tab's own link?** It routes through the same
  App URL launch described above and fails the same way. Your vendor
  panel's **Connect to Shopify** button builds the real
  `/admin/oauth/authorize` URL directly instead. Shape, for reference:
  `https://<store>.myshopify.com/admin/oauth/authorize?client_id=<id>&scope=read_products,read_inventory&redirect_uri=<url-encoded>&state=<random>`
- **Local dev only — `https://localhost.invalid`:** Shopify rejects any
  `http://` redirect outright, so plain `localhost` can never be
  whitelisted. `.invalid` is a TLD reserved to never resolve — the browser
  shows the full URL (including `code=`) without loading anything or
  contacting a real server. The install link already substitutes this
  automatically for local requests. The one step that can't be automated
  (no public tunnel for local dev, by design — see `docs/plan.md`): after
  approving, copy the query string from the dead `localhost.invalid` page
  and replay it against
  `http://localhost:9000/hooks/shopify/oauth/callback?...` to finish the
  connection. Not needed once testing against a real deployed `https://`
  backend — Shopify's redirect lands on it directly.
