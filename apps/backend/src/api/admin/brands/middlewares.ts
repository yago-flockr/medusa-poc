import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import * as QueryConfig from "./query-config"
import {
  AdminCreateBrand,
  AdminGetBrandParams,
  AdminGetBrandsParams,
  AdminUpdateBrand,
} from "./validators"

export const adminBrandRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/brands",
    middlewares: [
      validateAndTransformQuery(
        AdminGetBrandsParams,
        QueryConfig.listTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/brands",
    middlewares: [
      validateAndTransformBody(AdminCreateBrand),
      validateAndTransformQuery(
        AdminGetBrandParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/brands/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetBrandParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/brands/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateBrand),
      validateAndTransformQuery(
        AdminGetBrandParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
]
