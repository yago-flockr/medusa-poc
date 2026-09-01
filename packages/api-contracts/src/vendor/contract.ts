import { initContract } from "@ts-rest/core"
import { vendorMeResponseSchema } from "./me"
import {
  vendorOrdersListResponseSchema,
  vendorOrdersQuerySchema,
} from "./orders"
import {
  updateVendorProfileResponseSchema,
  updateVendorProfileSchema,
} from "./profile"
import {
  setVendorShopifyConnectionResponseSchema,
  setVendorShopifyConnectionSchema,
  getVendorShopifyInstallLinkResponseSchema,
} from "./shopify-connection"
import {
  importVendorShopifyProductsResponseSchema,
  importVendorShopifyProductsSchema,
  pullVendorShopifyProductsResponseSchema,
} from "./shopify-products"
import {
  createVendorProductResponseSchema,
  createVendorProductSchema,
  deleteVendorProductResponseSchema,
  updateVendorProductStatusResponseSchema,
  updateVendorProductStatusSchema,
  vendorProductsListResponseSchema,
  vendorProductsQuerySchema,
} from "./products"
import {
  createVendorStockLocationResponseSchema,
  createVendorStockLocationSchema,
  vendorStockLocationsListResponseSchema,
  vendorStockLocationsQuerySchema,
} from "./stock-locations"

const c = initContract()

export const vendorContract = c.router({
  getMe: {
    method: "GET",
    path: "/vendors/me",
    responses: {
      200: vendorMeResponseSchema,
    },
  },
  updateProfile: {
    method: "PATCH",
    path: "/vendors/me",
    body: updateVendorProfileSchema,
    responses: {
      200: updateVendorProfileResponseSchema,
    },
  },
  setShopifyConnection: {
    method: "PATCH",
    path: "/vendors/me/shopify/connection",
    body: setVendorShopifyConnectionSchema,
    responses: {
      200: setVendorShopifyConnectionResponseSchema,
    },
  },
  getShopifyInstallLink: {
    method: "GET",
    path: "/vendors/me/shopify/connection/install-link",
    responses: {
      200: getVendorShopifyInstallLinkResponseSchema,
    },
  },
  pullShopifyProducts: {
    method: "GET",
    path: "/vendors/me/shopify/products",
    responses: {
      200: pullVendorShopifyProductsResponseSchema,
    },
  },
  importShopifyProducts: {
    method: "POST",
    path: "/vendors/me/shopify/products/import",
    body: importVendorShopifyProductsSchema,
    responses: {
      200: importVendorShopifyProductsResponseSchema,
    },
  },
  getOrders: {
    method: "GET",
    path: "/vendors/orders",
    query: vendorOrdersQuerySchema,
    responses: {
      200: vendorOrdersListResponseSchema,
    },
  },
  getProducts: {
    method: "GET",
    path: "/vendors/products",
    query: vendorProductsQuerySchema,
    responses: {
      200: vendorProductsListResponseSchema,
    },
  },
  createProduct: {
    method: "POST",
    path: "/vendors/products",
    body: createVendorProductSchema,
    responses: {
      200: createVendorProductResponseSchema,
    },
  },
  updateProductStatus: {
    method: "POST",
    path: "/vendors/products/:id",
    body: updateVendorProductStatusSchema,
    responses: {
      200: updateVendorProductStatusResponseSchema,
    },
  },
  deleteProduct: {
    method: "DELETE",
    path: "/vendors/products/:id",
    responses: {
      200: deleteVendorProductResponseSchema,
    },
  },
  getStockLocations: {
    method: "GET",
    path: "/vendors/stock-locations",
    query: vendorStockLocationsQuerySchema,
    responses: {
      200: vendorStockLocationsListResponseSchema,
    },
  },
  createStockLocation: {
    method: "POST",
    path: "/vendors/stock-locations",
    body: createVendorStockLocationSchema,
    responses: {
      200: createVendorStockLocationResponseSchema,
    },
  },
})
