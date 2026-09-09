import type { GetVendorsShopifyProductsResponse } from "@dtc/api-contracts/vendor/shopify-products"
import type { ShopifyProductsPullResult } from "../../../integrations/shopify/products"

export function buildShopifyProductsList(
  pulled: ShopifyProductsPullResult,
  existingIdsByShopifyId: Record<string, string>,
): GetVendorsShopifyProductsResponse {
  return {
    ...pulled,
    products: pulled.products.map((product) => ({
      ...product,
      already_imported: product.shopify_id in existingIdsByShopifyId,
    })),
  }
}
