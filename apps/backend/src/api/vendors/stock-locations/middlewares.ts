import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { createVendorStockLocationSchema } from "@dtc/api-contracts/vendor/stock-locations"

export const vendorStockLocationRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/stock-locations",
    middlewares: [validateAndTransformBody(createVendorStockLocationSchema)],
  },
]
