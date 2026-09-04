# Bootstrapping a fresh Medusa Cloud deploy

Migrations run automatically on deploy. Everything below is manual, done once, entirely through the Cloud dashboard and the Admin panel — no scripts, no local exec.

1. **Deploy (Cloud panel).** Project root `apps/backend`, Storefront root `apps/storefront`. Set `JWT_SECRET` and `COOKIE_SECRET`. Don't set `DATABASE_URL`/`REDIS_URL` — Cloud injects them.
2. **Store currencies (Admin → Settings → Store).** Currencies section → Add → check GBP + USD → Save. Then edit the Store to set the default currency.
3. **Regions (Admin → Settings → Regions).** Create "United Kingdom": currency GBP, countries GB, default payment provider. Create "United States": currency USD, countries US, default payment provider.
4. **Tax regions (Admin → Settings → Tax Regions).** Create one for GB, one for US. Leave the default tax rate blank/0 if you're not charging tax yet.
5. **Publishable API key (Admin → Settings → Publishable API Keys).** Open the key the storefront actually uses → add the Default Sales Channel to it.
6. **Shipping (Admin → Settings → Locations & Shipping).** Open your stock location → enable Shipping mode → create a service zone (e.g. "UK & US", countries GB + US) → create a shipping option in it: Fixed price, name "Standard Shipping", Shipping Profile **default** (already exists, created by Medusa core — nothing to set up), any available fulfillment provider → set a price for both GBP and USD.
7. **Admin user.** Create it the normal way through Admin's own user invite, or set `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars if your deploy process already provisions one.
8. **Real data.** Vendor → vendor user → product (published) → location → stock — via the vendor panel, same as any other day.
9. **Check:** product's Sales Channels shows 1/1 → prices include GBP + USD → storefront shows the product → Shopify import works.
