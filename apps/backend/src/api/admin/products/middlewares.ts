import type { MiddlewareRoute } from "@medusajs/framework/http"
import { productAdditionalDataValidators } from "./additional-data"

export const adminProductRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/products",
    additionalDataValidator: productAdditionalDataValidators,
  },
  {
    method: ["POST"],
    matcher: "/admin/products/:id",
    additionalDataValidator: productAdditionalDataValidators,
  },
]
