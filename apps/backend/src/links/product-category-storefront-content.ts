import ProductModule from "@medusajs/medusa/product"
import StorefrontContentModule from "../modules/storefront-content"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  ProductModule.linkable.productCategory,
  StorefrontContentModule.linkable.storefrontContent,
)
