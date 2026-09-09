import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { patchVendorsShopifyConnectionInputSchema } from "@dtc/api-contracts/vendor/shopify-connection"
import { postVendorsShopifyProductsImportInputSchema } from "@dtc/api-contracts/vendor/shopify-products"

export const vendorShopifyRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["PATCH"],
    matcher: "/vendors/shopify/connection",
    middlewares: [
      validateAndTransformBody(patchVendorsShopifyConnectionInputSchema),
    ],
  },
  {
    method: ["POST"],
    matcher: "/vendors/shopify/products/import",
    middlewares: [
      validateAndTransformBody(postVendorsShopifyProductsImportInputSchema),
    ],
  },
]
