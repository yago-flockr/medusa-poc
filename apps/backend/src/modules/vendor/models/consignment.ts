import { model } from "@medusajs/framework/utils"
import { Vendor } from "./vendor"

// A consignment is a vendor's scoped slice of a single, real order — the
// order it belongs to still holds the one payment, the customer's applied
// promotions, and tax, all computed once and correctly. A consignment never
// duplicates that: it only tracks which of the order's own line items are
// this vendor's to fulfill, and that vendor's own status for them.
export const Consignment = model.define("consignment", {
  id: model.id().primaryKey(),
  status: model.enum(["placed", "accepted", "dispatched"]).default("placed"),
  currency_code: model.text(),
  subtotal: model.bigNumber(),
  commission_rate: model.bigNumber(),
  commission_total: model.bigNumber(),
  earning_total: model.bigNumber(),
  vendor: model.belongsTo(() => Vendor, {
    mappedBy: "consignments",
  }),
})
