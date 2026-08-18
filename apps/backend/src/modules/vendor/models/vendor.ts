import { model } from "@medusajs/framework/utils"
import { VendorUser } from "./vendor-user"

export const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  users: model.hasMany(() => VendorUser, {
    mappedBy: "vendor",
  }),
})
