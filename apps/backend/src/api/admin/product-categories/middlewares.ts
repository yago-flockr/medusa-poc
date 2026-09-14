import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { postAdminProductCategoriesByIdStorefrontContentInputSchema } from "@dtc/api-contracts/admin/product-category-storefront-content"

export const adminProductCategoryRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/product-categories/:id/storefront-content",
    middlewares: [
      validateAndTransformBody(
        postAdminProductCategoriesByIdStorefrontContentInputSchema,
      ),
    ],
  },
]
