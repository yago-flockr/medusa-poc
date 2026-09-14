import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { postAdminCollectionsByIdStorefrontContentInputSchema } from "@dtc/api-contracts/admin/collection-storefront-content"

export const adminCollectionRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/collections/:id/storefront-content",
    middlewares: [
      validateAndTransformBody(
        postAdminCollectionsByIdStorefrontContentInputSchema,
      ),
    ],
  },
]
