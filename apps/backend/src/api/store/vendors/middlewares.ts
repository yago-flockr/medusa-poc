import {
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { listStoreVendorQueryConfig } from "./query-config"
import { StoreGetVendorsParams } from "./validators"

export const storeVendorRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/vendors",
    middlewares: [
      validateAndTransformQuery(
        StoreGetVendorsParams,
        listStoreVendorQueryConfig,
      ),
    ],
  },
]
