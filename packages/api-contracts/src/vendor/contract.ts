import { initContract } from "@ts-rest/core"
import { getVendorsMeResponseSchema } from "@dtc/api-contracts/vendor/me"
import {
  getVendorsOrdersByIdResponseSchema,
  getVendorsOrdersInputSchema,
  getVendorsOrdersResponseSchema,
  postVendorsOrdersByIdAcceptInputSchema,
  postVendorsOrdersByIdDispatchInputSchema,
} from "@dtc/api-contracts/vendor/orders"
import {
  patchVendorsMeInputSchema,
  patchVendorsMeResponseSchema,
} from "@dtc/api-contracts/vendor/profile"
import {
  patchVendorsMeShopifyConnectionInputSchema,
  patchVendorsMeShopifyConnectionResponseSchema,
  getVendorsMeShopifyConnectionInstallLinkResponseSchema,
} from "@dtc/api-contracts/vendor/shopify-connection"
import {
  postVendorsMeShopifyProductsImportInputSchema,
  postVendorsMeShopifyProductsImportResponseSchema,
  getVendorsMeShopifyProductsResponseSchema,
} from "@dtc/api-contracts/vendor/shopify-products"
import {
  deleteVendorsProductsByIdResponseSchema,
  getVendorsProductsByIdResponseSchema,
  getVendorsProductsInputSchema,
  getVendorsProductsResponseSchema,
  postVendorsProductsByIdInputSchema,
  postVendorsProductsInputSchema,
  postVendorsProductsResponseSchema,
} from "@dtc/api-contracts/vendor/products"
import { getVendorsRegionsResponseSchema } from "@dtc/api-contracts/vendor/regions"
import {
  deleteVendorsStockLocationsByIdResponseSchema,
  getVendorsStockLocationsInputSchema,
  getVendorsStockLocationsResponseSchema,
  postVendorsStockLocationsByIdInputSchema,
  postVendorsStockLocationsInputSchema,
  postVendorsStockLocationsResponseSchema,
} from "@dtc/api-contracts/vendor/stock-locations"
import {
  getVendorsProductsByIdInventoryResponseSchema,
  postVendorsProductsByIdInventoryInputSchema,
} from "@dtc/api-contracts/vendor/product-inventory"

const c = initContract()

export const vendorContract = c.router({
  getVendorsMe: {
    method: "GET",
    path: "/vendors/me",
    responses: {
      200: getVendorsMeResponseSchema,
    },
  },
  patchVendorsMe: {
    method: "PATCH",
    path: "/vendors/me",
    body: patchVendorsMeInputSchema,
    responses: {
      200: patchVendorsMeResponseSchema,
    },
  },
  patchVendorsMeShopifyConnection: {
    method: "PATCH",
    path: "/vendors/me/shopify/connection",
    body: patchVendorsMeShopifyConnectionInputSchema,
    responses: {
      200: patchVendorsMeShopifyConnectionResponseSchema,
    },
  },
  getVendorsMeShopifyConnectionInstallLink: {
    method: "GET",
    path: "/vendors/me/shopify/connection/install-link",
    responses: {
      200: getVendorsMeShopifyConnectionInstallLinkResponseSchema,
    },
  },
  getVendorsMeShopifyProducts: {
    method: "GET",
    path: "/vendors/me/shopify/products",
    responses: {
      200: getVendorsMeShopifyProductsResponseSchema,
    },
  },
  postVendorsMeShopifyProductsImport: {
    method: "POST",
    path: "/vendors/me/shopify/products/import",
    body: postVendorsMeShopifyProductsImportInputSchema,
    responses: {
      200: postVendorsMeShopifyProductsImportResponseSchema,
    },
  },
  getVendorsOrders: {
    method: "GET",
    path: "/vendors/orders",
    query: getVendorsOrdersInputSchema,
    responses: {
      200: getVendorsOrdersResponseSchema,
    },
  },
  getVendorsOrdersById: {
    method: "GET",
    path: "/vendors/orders/:id",
    responses: {
      200: getVendorsOrdersByIdResponseSchema,
    },
  },
  postVendorsOrdersByIdAccept: {
    method: "POST",
    path: "/vendors/orders/:id/accept",
    body: postVendorsOrdersByIdAcceptInputSchema,
    responses: {
      200: getVendorsOrdersByIdResponseSchema,
    },
  },
  postVendorsOrdersByIdDispatch: {
    method: "POST",
    path: "/vendors/orders/:id/dispatch",
    body: postVendorsOrdersByIdDispatchInputSchema,
    responses: {
      200: getVendorsOrdersByIdResponseSchema,
    },
  },
  getVendorsProducts: {
    method: "GET",
    path: "/vendors/products",
    query: getVendorsProductsInputSchema,
    responses: {
      200: getVendorsProductsResponseSchema,
    },
  },
  postVendorsProducts: {
    method: "POST",
    path: "/vendors/products",
    body: postVendorsProductsInputSchema,
    responses: {
      200: postVendorsProductsResponseSchema,
    },
  },
  getVendorsProductsById: {
    method: "GET",
    path: "/vendors/products/:id",
    responses: {
      200: getVendorsProductsByIdResponseSchema,
    },
  },
  postVendorsProductsById: {
    method: "POST",
    path: "/vendors/products/:id",
    body: postVendorsProductsByIdInputSchema,
    responses: {
      200: getVendorsProductsByIdResponseSchema,
    },
  },
  deleteVendorsProductsById: {
    method: "DELETE",
    path: "/vendors/products/:id",
    responses: {
      200: deleteVendorsProductsByIdResponseSchema,
    },
  },
  getVendorsRegions: {
    method: "GET",
    path: "/vendors/regions",
    responses: {
      200: getVendorsRegionsResponseSchema,
    },
  },
  getVendorsStockLocations: {
    method: "GET",
    path: "/vendors/stock-locations",
    query: getVendorsStockLocationsInputSchema,
    responses: {
      200: getVendorsStockLocationsResponseSchema,
    },
  },
  postVendorsStockLocations: {
    method: "POST",
    path: "/vendors/stock-locations",
    body: postVendorsStockLocationsInputSchema,
    responses: {
      200: postVendorsStockLocationsResponseSchema,
    },
  },
  postVendorsStockLocationsById: {
    method: "POST",
    path: "/vendors/stock-locations/:id",
    body: postVendorsStockLocationsByIdInputSchema,
    responses: {
      200: postVendorsStockLocationsResponseSchema,
    },
  },
  deleteVendorsStockLocationsById: {
    method: "DELETE",
    path: "/vendors/stock-locations/:id",
    responses: {
      200: deleteVendorsStockLocationsByIdResponseSchema,
    },
  },
  getVendorsProductsByIdInventory: {
    method: "GET",
    path: "/vendors/products/:id/inventory",
    responses: {
      200: getVendorsProductsByIdInventoryResponseSchema,
    },
  },
  postVendorsProductsByIdInventory: {
    method: "POST",
    path: "/vendors/products/:id/inventory",
    body: postVendorsProductsByIdInventoryInputSchema,
    responses: {
      200: getVendorsProductsByIdInventoryResponseSchema,
    },
  },
})
