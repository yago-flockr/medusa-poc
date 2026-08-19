import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import * as QueryConfig from "./query-config"
import {
  AdminCreateVendor,
  AdminGetVendorParams,
  AdminGetVendorsParams,
  AdminUpdateVendor,
} from "./validators"

export const adminVendorRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/vendors",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorsParams,
        QueryConfig.listTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendors",
    middlewares: [
      validateAndTransformBody(AdminCreateVendor),
      validateAndTransformQuery(
        AdminGetVendorParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/vendors/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendors/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateVendor),
      validateAndTransformQuery(
        AdminGetVendorParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
]
