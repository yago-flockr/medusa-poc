import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { updateVendorProfileSchema } from "@dtc/api-contracts/vendor/profile"
import { setVendorShopifyConnectionSchema } from "@dtc/api-contracts/vendor/shopify-connection"
import { importVendorShopifyProductsSchema } from "@dtc/api-contracts/vendor/shopify-products"

export const vendorMeRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["PATCH"],
    matcher: "/vendors/me",
    middlewares: [validateAndTransformBody(updateVendorProfileSchema)],
  },
  {
    method: ["PATCH"],
    matcher: "/vendors/me/shopify/connection",
    middlewares: [validateAndTransformBody(setVendorShopifyConnectionSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/me/shopify/products/import",
    middlewares: [validateAndTransformBody(importVendorShopifyProductsSchema)],
  },
]
