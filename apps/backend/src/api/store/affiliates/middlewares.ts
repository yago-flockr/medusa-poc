import {
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { listStoreAffiliateQueryConfig } from "./query-config"
import { StoreGetAffiliatesParams } from "./validators"

export const storeAffiliateRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/affiliates",
    middlewares: [
      validateAndTransformQuery(
        StoreGetAffiliatesParams,
        listStoreAffiliateQueryConfig,
      ),
    ],
  },
]
