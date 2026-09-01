import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  createVendorProductSchema,
  updateVendorProductSchema,
} from "@dtc/api-contracts/vendor/products"
import { setVendorInventoryLevelSchema } from "@dtc/api-contracts/vendor/product-inventory"

export const vendorProductRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/products",
    middlewares: [validateAndTransformBody(createVendorProductSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/products/:id",
    middlewares: [validateAndTransformBody(updateVendorProductSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/products/:id/inventory",
    middlewares: [validateAndTransformBody(setVendorInventoryLevelSchema)],
  },
]
