import { defineMiddlewares } from "@medusajs/framework/http"
import { adminBrandRoutesMiddlewares } from "./admin/brands/middlewares"
import { adminProductRoutesMiddlewares } from "./admin/products/middlewares"
import { vendorRoutesMiddlewares } from "./vendors/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminBrandRoutesMiddlewares,
    ...adminProductRoutesMiddlewares,
    ...vendorRoutesMiddlewares,
  ],
})
