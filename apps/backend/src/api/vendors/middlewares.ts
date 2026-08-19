import {
  authenticate,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { vendorCors } from "./cors"
import { vendorProductRoutesMiddlewares } from "./products/middlewares"
import { vendorUploadRoutesMiddlewares } from "./uploads/middlewares"

// Vendors are created by staff from the Admin panel (see api/admin/vendors
// and api/admin/vendor-users) — there is no public self-registration path.
// Every /vendors/* route below requires an already-linked vendor user.
export const vendorRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/vendors/*",
    middlewares: [vendorCors, authenticate("vendor", ["session", "bearer"])],
  },
  ...vendorProductRoutesMiddlewares,
  ...vendorUploadRoutesMiddlewares,
]
