import AffiliateModule from "../modules/affiliate"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  AffiliateModule.linkable.referral,
  OrderModule.linkable.order,
)
