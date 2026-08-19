import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import * as QueryConfig from "./query-config"
import {
  AdminCreateVendorUser,
  AdminGetVendorUserParams,
  AdminGetVendorUsersParams,
  AdminUpdateVendorUser,
} from "./validators"

export const adminVendorUserRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/vendor-users",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorUsersParams,
        QueryConfig.listTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendor-users",
    middlewares: [
      validateAndTransformBody(AdminCreateVendorUser),
      validateAndTransformQuery(
        AdminGetVendorUserParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/vendor-users/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetVendorUserParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendor-users/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateVendorUser),
      validateAndTransformQuery(
        AdminGetVendorUserParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/vendor-users/:id/regenerate-password",
    middlewares: [],
  },
]
