import { model } from "@medusajs/framework/utils"
import { VendorUser } from "./vendor-user"

/**
 * shopify_client_id/secret are per-vendor, not a shared app config: Shopify's
 * Custom Distribution caps a single app at one live production store, so
 * each vendor gets its own app in the Dev Dashboard. shopify_access_token is
 * filled in once the vendor approves the install (see
 * complete-vendor-shopify-connection workflow).
 */
export const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  is_active: model.boolean().default(true),
  shopify_store_domain: model.text().unique().nullable(),
  shopify_client_id: model.text().nullable(),
  shopify_client_secret: model.text().nullable(),
  shopify_access_token: model.text().nullable(),
  shopify_scope: model.text().nullable(),
  shopify_connected_at: model.dateTime().nullable(),
  users: model.hasMany(() => VendorUser, {
    mappedBy: "vendor",
  }),
})
