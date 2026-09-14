import VendorModule from "../modules/vendor"
import StorefrontContentModule from "../modules/storefront-content"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  VendorModule.linkable.vendor,
  StorefrontContentModule.linkable.storefrontContent,
)
