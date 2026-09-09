import type { GetVendorsProductsResponse } from "@dtc/api-contracts/vendor/products"
import { buildVendorProduct } from "./build-vendor-product"

type RawVendorProduct = Parameters<typeof buildVendorProduct>[0]

export function buildVendorProductList(result: {
  products: RawVendorProduct[]
  count: number
  limit: number
  offset: number
}): GetVendorsProductsResponse {
  return {
    products: result.products.map(buildVendorProduct),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
  }
}
