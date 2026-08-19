import { model } from "@medusajs/framework/utils"
import { Vendor } from "./vendor"

export const VendorUser = model.define("vendor_user", {
  id: model.id().primaryKey(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  email: model.text().unique(),
  is_active: model.boolean().default(true),
  vendor: model.belongsTo(() => Vendor, {
    mappedBy: "users",
  }),
})
