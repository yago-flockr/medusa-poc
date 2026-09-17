import { model } from "@medusajs/framework/utils"
import { Referral } from "./referral"

export const Affiliate = model.define("affiliate", {
  id: model.id().primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  email: model.text().unique(),
  commission_rate: model.bigNumber(),
  is_active: model.boolean().default(true),
  referrals: model.hasMany(() => Referral, {
    mappedBy: "affiliate",
  }),
})
