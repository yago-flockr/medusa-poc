import { model } from "@medusajs/framework/utils"
import { VendorUser } from "./vendor-user"

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
