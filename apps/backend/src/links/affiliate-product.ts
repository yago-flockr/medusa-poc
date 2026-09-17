import AffiliateModule from "../modules/affiliate"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  {
    linkable: AffiliateModule.linkable.affiliate,
    isList: true,
  },
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
)
