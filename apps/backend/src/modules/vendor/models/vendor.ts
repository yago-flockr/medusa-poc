import { model } from "@medusajs/framework/utils"
import { VendorUser } from "./vendor-user"
import { VendorIntegrationConnection } from "./vendor-integration-connection"

export const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  is_active: model.boolean().default(true),
  users: model.hasMany(() => VendorUser, {
    mappedBy: "vendor",
  }),
  integration_connections: model.hasMany(() => VendorIntegrationConnection, {
    mappedBy: "vendor",
  }),
})
