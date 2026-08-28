import { model } from "@medusajs/framework/utils"
import { Vendor } from "./vendor"

export const VendorIntegrationConnection = model.define("vendor_integration_connection", {
  id: model.id().primaryKey(),
  provider: model.text(),
  external_account_identifier: model.text().nullable(),
  client_id: model.text().nullable(),
  client_secret: model.text().nullable(),
  access_token: model.text().nullable(),
  scope: model.text().nullable(),
  connected_at: model.dateTime().nullable(),
  oauth_state: model.text().nullable(),
  vendor: model.belongsTo(() => Vendor, {
    mappedBy: "integration_connections",
  }),
})
