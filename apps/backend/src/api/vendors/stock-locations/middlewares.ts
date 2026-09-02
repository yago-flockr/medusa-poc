import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  postVendorsStockLocationsByIdInputSchema,
  postVendorsStockLocationsInputSchema,
} from "@dtc/api-contracts/vendor/stock-locations"

export const vendorStockLocationRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/vendors/stock-locations",
    middlewares: [validateAndTransformBody(postVendorsStockLocationsInputSchema)],
  },
  {
    method: ["POST"],
    matcher: "/vendors/stock-locations/:id",
    middlewares: [
      validateAndTransformBody(postVendorsStockLocationsByIdInputSchema),
    ],
  },
]
