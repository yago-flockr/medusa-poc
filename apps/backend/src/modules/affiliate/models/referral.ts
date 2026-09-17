import { model } from "@medusajs/framework/utils"
import { Affiliate } from "./affiliate"

export const Referral = model.define("referral", {
  id: model.id().primaryKey(),
  code: model.text(),
  commission_rate: model.bigNumber(),
  affiliate: model.belongsTo(() => Affiliate, {
    mappedBy: "referrals",
  }),
})
