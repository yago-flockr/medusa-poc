import { defineMiddlewares } from "@medusajs/framework/http"
import { affiliateRoutesMiddlewares } from "./affiliates/middlewares"
import { adminAffiliateRoutesMiddlewares } from "./admin/affiliates/middlewares"
import { adminBrandRoutesMiddlewares } from "./admin/brands/middlewares"
import { adminCollectionRoutesMiddlewares } from "./admin/collections/middlewares"
import { adminProductRoutesMiddlewares } from "./admin/products/middlewares"
import { adminProductCategoryRoutesMiddlewares } from "./admin/product-categories/middlewares"
import { adminVendorRoutesMiddlewares } from "./admin/vendors/middlewares"
import { adminVendorUserRoutesMiddlewares } from "./admin/vendor-users/middlewares"
import { storeCartRoutesMiddlewares } from "./store/carts/middlewares"
import { storeProductRoutesMiddlewares } from "./store/products/middlewares"
import { storeVendorRoutesMiddlewares } from "./store/vendors/middlewares"
import { vendorRoutesMiddlewares } from "./vendors/middlewares"

export default defineMiddlewares({
  routes: [
    ...adminAffiliateRoutesMiddlewares,
    ...adminBrandRoutesMiddlewares,
    ...adminCollectionRoutesMiddlewares,
    ...adminProductRoutesMiddlewares,
    ...adminProductCategoryRoutesMiddlewares,
    ...adminVendorRoutesMiddlewares,
    ...adminVendorUserRoutesMiddlewares,
    ...storeCartRoutesMiddlewares,
    ...storeProductRoutesMiddlewares,
    ...storeVendorRoutesMiddlewares,
    ...affiliateRoutesMiddlewares,
    ...vendorRoutesMiddlewares,
  ],
})
