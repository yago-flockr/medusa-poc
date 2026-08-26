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
  vendorShopifyInstallLinkResponseSchema,
} from "./shopify-connection"
import { pullVendorShopifyProductsResponseSchema } from "./shopify-products"

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
    path: "/vendors/me/shopify-connection",
    body: setVendorShopifyConnectionSchema,
    responses: {
      200: setVendorShopifyConnectionResponseSchema,
    },
  },
  getShopifyInstallLink: {
    method: "GET",
    path: "/vendors/me/shopify-connection/install-link",
    responses: {
      200: vendorShopifyInstallLinkResponseSchema,
    },
  },
  pullShopifyProducts: {
    method: "GET",
    path: "/vendors/me/shopify-products",
    responses: {
      200: pullVendorShopifyProductsResponseSchema,
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
})
