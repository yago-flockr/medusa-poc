import {
  authenticate,
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { createVendorSchema } from "./contract"
import { vendorCors } from "./cors"
import { vendorProductRoutesMiddlewares } from "./products/middlewares"
import { vendorUploadRoutesMiddlewares } from "./uploads/middlewares"

export const vendorRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST", "OPTIONS"],
    matcher: "/vendors",
    middlewares: [
      vendorCors,
      authenticate("vendor", ["session", "bearer"], {
        allowUnregistered: true,
      }),
      validateAndTransformBody(createVendorSchema),
    ],
  },
  {
    matcher: "/vendors/*",
    middlewares: [vendorCors, authenticate("vendor", ["session", "bearer"])],
  },
  ...vendorProductRoutesMiddlewares,
  ...vendorUploadRoutesMiddlewares,
]
