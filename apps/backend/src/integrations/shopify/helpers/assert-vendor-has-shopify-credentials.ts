import { MedusaError } from "@medusajs/framework/utils"

export function assertVendorHasShopifyCredentials<
  T extends {
    shopify_store_domain: string | null
    shopify_access_token: string | null
  },
>(
  vendor: T,
): asserts vendor is T & {
  shopify_store_domain: string
  shopify_access_token: string
} {
  if (!vendor.shopify_store_domain || !vendor.shopify_access_token) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This vendor isn't connected to Shopify yet.",
    )
  }
}
