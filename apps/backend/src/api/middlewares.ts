import { defineMiddlewares } from "@medusajs/framework/http"
import { adminBrandRoutesMiddlewares } from "./admin/brands/middlewares"
import { adminCollectionRoutesMiddlewares } from "./admin/collections/middlewares"
import { adminProductRoutesMiddlewares } from "./admin/products/middlewares"
import { adminProductCategoryRoutesMiddlewares } from "./admin/product-categories/middlewares"
import { adminVendorRoutesMiddlewares } from "./admin/vendors/middlewares"
import { adminVendorUserRoutesMiddlewares } from "./admin/vendor-users/middlewares"
import { storeVendorRoutesMiddlewares } from "./store/vendors/middlewares"
import { vendorRoutesMiddlewares } from "./vendors/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminBrandRoutesMiddlewares,
    ...adminCollectionRoutesMiddlewares,
    ...adminProductRoutesMiddlewares,
    ...adminProductCategoryRoutesMiddlewares,
    ...adminVendorRoutesMiddlewares,
    ...adminVendorUserRoutesMiddlewares,
    ...storeVendorRoutesMiddlewares,
    ...vendorRoutesMiddlewares,
  ],
})
