import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { patchVendorsMeInputSchema } from "@dtc/api-contracts/vendor/profile"

export const vendorMeRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["PATCH"],
    matcher: "/vendors/me",
    middlewares: [validateAndTransformBody(patchVendorsMeInputSchema)],
  },
]
