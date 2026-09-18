import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import * as QueryConfig from "./query-config"
import {
  AdminCreateAffiliate,
  AdminGetAffiliateParams,
  AdminGetAffiliatesParams,
  AdminUpdateAffiliate,
} from "./validators"

export const adminAffiliateRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/affiliates",
    middlewares: [
      validateAndTransformQuery(
        AdminGetAffiliatesParams,
        QueryConfig.listTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/affiliates",
    middlewares: [
      validateAndTransformBody(AdminCreateAffiliate),
      validateAndTransformQuery(
        AdminGetAffiliateParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/affiliates/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetAffiliateParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/affiliates/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateAffiliate),
      validateAndTransformQuery(
        AdminGetAffiliateParams,
        QueryConfig.retrieveTransformQueryConfig,
      ),
    ],
  },
]
