import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewareRoute,
} from "@medusajs/framework/http"
import { storeProductVendorFields } from "./query-config"

// Appends fields only. Re-running validateAndTransformQuery here would run
// after Medusa's pricing middleware and re-add region_id as a product filter.
function addVendorFields(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction,
) {
  const fields = req.queryConfig?.fields

  if (fields) {
    req.queryConfig.fields = [
      ...new Set([...fields, ...storeProductVendorFields]),
    ]
  }

  next()
}

export const storeProductRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/products",
    middlewares: [addVendorFields],
  },
  {
    method: ["GET"],
    matcher: "/store/products/:id",
    middlewares: [addVendorFields],
  },
]
