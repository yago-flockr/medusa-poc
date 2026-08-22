# Connecting a new vendor's Shopify store

Every new vendor needs their **own** Shopify app — Shopify's Custom
Distribution only allows one live production store per app, so one shared
app can't cover multiple independent vendors. This is annoying but free
(no Shopify subscription, no review) and takes about 10 minutes.

**Step 1 — Configure the Shopify app.** Follow `shopify-app-config.md` at
the repo root, start to finish — it covers app creation, scopes, the
redirect URLs, and a couple of non-obvious Shopify dashboard gotchas
(an app-naming restriction, an "embed" toggle that has to be off). Come
back here once you've built the authorization URL described in that
doc's Step 5, but don't open it yet.

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

Send the vendor the authorization URL you built in `shopify-app-config.md`
Step 5 (not the link Shopify's Distribution tab generates — that one
doesn't work for us, see that doc for why). They open it, click
**Install**/**Approve** on Shopify's real consent screen, and land on a
page confirming they're connected — nothing else for them to do. That
approval automatically saves their access token on our side
(`complete-vendor-shopify-connection` workflow).

**Step 4 (optional) — Verify the connection**

In our Admin, go to **Products** — there's a small "Log a vendor's
Shopify products" box at the top. Paste the vendor's ID, click **Log
products**, then open your browser's console (F12) to see their Shopify
catalogue pulled live. Nothing is created in Medusa; it's a read-only
sanity check.
