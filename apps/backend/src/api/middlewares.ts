import { defineMiddlewares } from "@medusajs/framework/http"
import { adminBrandRoutesMiddlewares } from "./admin/brands/middlewares"
import { adminProductRoutesMiddlewares } from "./admin/products/middlewares"
import { adminVendorRoutesMiddlewares } from "./admin/vendors/middlewares"
import { adminVendorUserRoutesMiddlewares } from "./admin/vendor-users/middlewares"
import { vendorRoutesMiddlewares } from "./vendors/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminBrandRoutesMiddlewares,
    ...adminProductRoutesMiddlewares,
    ...adminVendorRoutesMiddlewares,
    ...adminVendorUserRoutesMiddlewares,
    ...vendorRoutesMiddlewares,
  ],
})
