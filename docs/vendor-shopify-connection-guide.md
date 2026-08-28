# Connecting a new vendor's Shopify store

Vendors connect themselves — staff's only job is creating the vendor's
account.

**Staff: create the vendor.** In Admin (`/app/vendors`), create the
vendor and a vendor user for them, and share those login credentials.
Nothing Shopify-specific to do — no app to configure, no credentials to
save, no link to send.

**Vendor: everything else.** They log into their own panel
(`/vendor/shopify`) and follow `shopify-app-config.md` at the repo root,
start to finish: create their own Shopify app (one app per store — Custom
Distribution only allows one live production store per app, so this can't
be shared across vendors), paste their store domain/Client ID/Client
secret into the panel, and click **Connect to Shopify**. They approve on
Shopify's own consent screen and land back on their panel showing
"Connected" — nothing else for them to do, and no staff involvement once
they have a login.

**Staff fallback, if a vendor gets stuck:** Admin (`/app/vendors`) can
still edit a vendor's Shopify store domain/Client ID/Client secret
directly, and its **Copy Shopify install link** row action builds the
same link the vendor's own panel would. Use this to unblock someone, not
as the default path — see `shopify-app-config.md` for why the link has to
be built this way rather than using Shopify's own Distribution tab link.

**Verify the connection (optional):** In Admin, go to **Products** —
there's a small "Log a vendor's Shopify products" box at the top. Paste
the vendor's ID, click **Log products**, then open your browser's console
(F12) to see their Shopify catalogue pulled live. Nothing is created in
Medusa; it's a read-only sanity check.
