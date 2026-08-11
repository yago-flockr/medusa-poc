import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import {
  GetBrandSchema,
  GetBrandsSchema,
  PostAdminCreateBrand,
} from "./admin/brands/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/admin/brands",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetBrandsSchema, {
          defaults: [
            "id",
            "name",
            "created_at",
            "updated_at",
            "products.*",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/admin/brands/:id",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetBrandSchema, {
          defaults: [
            "id",
            "name",
            "created_at",
            "updated_at",
            "products.*",
          ],
          isList: false,
        }),
      ],
    },
  ],
})
