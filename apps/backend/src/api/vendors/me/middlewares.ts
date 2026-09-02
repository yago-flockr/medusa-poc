import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { patchVendorsMeInputSchema } from "@dtc/api-contracts/vendor/profile"
import { patchVendorsMeShopifyConnectionInputSchema } from "@dtc/api-contracts/vendor/shopify-connection"
import { postVendorsMeShopifyProductsImportInputSchema } from "@dtc/api-contracts/vendor/shopify-products"

export const vendorMeRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["PATCH"],
    matcher: "/vendors/me",
    middlewares: [validateAndTransformBody(patchVendorsMeInputSchema)],
  },
  {
    method: ["PATCH"],
    matcher: "/vendors/me/shopify/connection",
    middlewares: [
      validateAndTransformBody(patchVendorsMeShopifyConnectionInputSchema),
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendors/me/shopify/products/import",
    middlewares: [
      validateAndTransformBody(postVendorsMeShopifyProductsImportInputSchema),
    ],
  },
]
