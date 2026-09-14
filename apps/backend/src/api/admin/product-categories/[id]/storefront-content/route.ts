import { Modules } from "@medusajs/framework/utils"
import { createStorefrontContentPostHandler } from "../../../shared/storefront-content-route"

export const POST = createStorefrontContentPostHandler({
  linkModuleKey: Modules.PRODUCT,
  linkIdField: "product_category_id",
  queryEntity: "product_category",
})
