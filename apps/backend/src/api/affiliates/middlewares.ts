import {
  authenticate,
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { panelCors } from "../lib/panel-cors"
import { AffiliatePostProducts } from "./validators"

// Affiliates are created by staff from Admin (api/admin/affiliates) — there is
// no public self-registration path, same as vendors.
export const affiliateRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/affiliates/*",
    middlewares: [panelCors, authenticate("affiliate", ["session", "bearer"])],
  },
  {
    method: ["POST"],
    matcher: "/affiliates/products",
    middlewares: [validateAndTransformBody(AffiliatePostProducts)],
  },
]
