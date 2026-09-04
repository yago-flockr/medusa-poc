# Bootstrapping a fresh Medusa Cloud deploy

Migrations run automatically on deploy. The rest is manual, done once.

1. **Deploy (Cloud panel).** Project root `apps/backend`, Storefront root `apps/storefront`. Set `JWT_SECRET`, `COOKIE_SECRET`.
2. **Store currencies (Admin → Settings → Store).** Add GBP + USD, set default.
3. **Regions (Admin → Settings → Regions).** UK: GBP, GB. US: USD, US.
4. **Tax regions (Admin → Settings → Tax Regions).** One for GB, one for US. Rate can stay 0 for now.
5. **Publishable API key (Admin → Settings → Publishable API Keys).** Add the Default Sales Channel to the storefront's key.
6. **Admin user.** Normal Admin invite, or `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars.
7. **Onboard the vendor (Admin → Vendors + Vendor Users).** Staff-only, once per vendor. Share the login.
8. **Vendor creates a product (vendor panel).** Published.
9. **Vendor creates a location (vendor panel).** Shipping is automatic here — free shipping is provisioned the moment the location is created, no extra step.
10. **Vendor adds stock** for the product at that location.
11. **Check: product.** Sales Channels shows 1/1, prices include GBP + USD.
12. **Check: storefront.** Product appears on the storefront.
