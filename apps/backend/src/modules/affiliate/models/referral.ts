import { model } from "@medusajs/framework/utils"
import { Affiliate } from "./affiliate"

export const Referral = model.define("referral", {
  id: model.id().primaryKey(),
  affiliate_handle: model.text(),
  commission_rate: model.bigNumber(),
  currency_code: model.text(),
  subtotal: model.bigNumber(),
  commission_total: model.bigNumber(),
  affiliate: model.belongsTo(() => Affiliate, {
    mappedBy: "referrals",
  }),
})
