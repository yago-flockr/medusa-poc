import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  postVendorsProductsInputSchema,
  postVendorsProductsByIdInputSchema,
} from "@dtc/api-contracts/vendor/products"
import { postVendorsProductsByIdInventoryInputSchema } from "@dtc/api-contracts/vendor/product-inventory"

export const vendorProductRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/products",
    middlewares: [validateAndTransformBody(postVendorsProductsInputSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/products/:id",
    middlewares: [validateAndTransformBody(postVendorsProductsByIdInputSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/products/:id/inventory",
    middlewares: [
      validateAndTransformBody(postVendorsProductsByIdInventoryInputSchema),
    ],
  },
]
