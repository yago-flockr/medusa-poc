import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { postVendorsOrdersByIdDispatchInputSchema } from "@dtc/api-contracts/vendor/orders"

export const vendorOrderRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/orders/:id/dispatch",
    middlewares: [
      validateAndTransformBody(postVendorsOrdersByIdDispatchInputSchema),
    ],
  },
]
