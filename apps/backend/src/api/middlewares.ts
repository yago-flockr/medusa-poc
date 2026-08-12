import { defineMiddlewares } from "@medusajs/framework/http"
import { brandMiddlewares } from "./admin/brands/middlewares"
import { productMiddlewares } from "./admin/products/middlewares"

export default defineMiddlewares({
  routes: [...brandMiddlewares, ...productMiddlewares],
})
