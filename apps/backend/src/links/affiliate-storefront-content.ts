import AffiliateModule from "../modules/affiliate"
import StorefrontContentModule from "../modules/storefront-content"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  AffiliateModule.linkable.affiliate,
  StorefrontContentModule.linkable.storefrontContent,
)
