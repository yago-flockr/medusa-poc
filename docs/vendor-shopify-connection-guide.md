# Connecting a new vendor's Shopify store

Every new vendor needs their **own** Shopify app — Shopify's Custom
Distribution only allows one live production store per app, so one shared
app can't cover multiple independent vendors. This is annoying but free
(no Shopify subscription, no review) and takes about 10 minutes.

**Step 1 — Configure the Shopify app.** Follow `shopify-app-config.md` at
the repo root, start to finish — it covers app creation, scopes, the
redirect URLs, and a couple of non-obvious Shopify dashboard gotchas
(an app-naming restriction, an "embed" toggle that has to be off).

**Step 2 — Save the vendor's app credentials in our system**

1. In the Shopify app's **Settings** page, copy the **Client ID** and
   **Client secret**
2. In our Admin (`/app/vendors`), open the vendor and click **Edit**
3. Fill in **Shopify store domain**, **Shopify client ID**, and
   **Shopify client secret**, then save

This has to happen **before** anyone opens the authorization URL — our
callback matches Shopify's redirect back to a vendor by store domain, and
can't do that if it isn't saved yet.

**Step 3 — Send the vendor the link**

In our Admin (`/app/vendors`), click the vendor's row action **Copy
Shopify install link** — this calls our backend, which builds the real
authorization URL for you (not the link Shopify's Distribution tab
generates — that one doesn't work for us, see `shopify-app-config.md`
for why). Send that link to the vendor. They open it, click
**Install**/**Approve** on Shopify's real consent screen, and land back
on their own vendor panel (`/vendor/shopify`), which now shows "You're
connected!" — nothing else for them to do. That title/description come
straight from the vendor record (`shopify_connected`, derived from
`shopify_access_token`), not from anything in the redirect URL, so it's
accurate even if they land there in an already-open tab or a fresh one.
That approval automatically saves the access token on our side
(`complete-vendor-shopify-connection` workflow). A vendor can also start
this themselves from their panel's **Connect to Shopify** button instead
of waiting for staff to send a link — same flow, opened in a new tab.

**Step 4 (optional) — Verify the connection**

In our Admin, go to **Products** — there's a small "Log a vendor's
Shopify products" box at the top. Paste the vendor's ID, click **Log
products**, then open your browser's console (F12) to see their Shopify
catalogue pulled live. Nothing is created in Medusa; it's a read-only
sanity check.
