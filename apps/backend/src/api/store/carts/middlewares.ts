import type { MiddlewareRoute } from "@medusajs/framework/http"
import { cartAdditionalDataValidators } from "./additional-data"

export const storeCartRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/carts",
    additionalDataValidator: cartAdditionalDataValidators,
  },
  {
    method: ["POST"],
    matcher: "/store/carts/:id",
    additionalDataValidator: cartAdditionalDataValidators,
  },
]
