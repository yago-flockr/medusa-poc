import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import {
  GetBrandSchema,
  GetBrandsSchema,
  PostAdminCreateBrand,
} from "./validators"

const brandQueryDefaults = [
  "id",
  "name",
  "created_at",
  "updated_at",
  "products.*",
]

export const brandMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/brands",
    method: "POST",
    middlewares: [validateAndTransformBody(PostAdminCreateBrand)],
  },
  {
    matcher: "/admin/brands",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(GetBrandsSchema, {
        defaults: brandQueryDefaults,
        isList: true,
      }),
    ],
  },
  {
    matcher: "/admin/brands/:id",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(GetBrandSchema, {
        defaults: brandQueryDefaults,
        isList: false,
      }),
    ],
  },
]
