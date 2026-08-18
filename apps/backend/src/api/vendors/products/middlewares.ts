import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  createVendorProductSchema,
  updateVendorProductSchema,
} from "./contract"

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
]
