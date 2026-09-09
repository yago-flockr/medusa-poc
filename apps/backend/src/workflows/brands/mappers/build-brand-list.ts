import type { BrandListResponse } from "@dtc/api-contracts/admin/brands"
import { buildBrand } from "./build-brand"

type RawBrand = Parameters<typeof buildBrand>[0]

export function buildBrandList(result: {
  brands: RawBrand[]
  count: number
  limit: number
  offset: number
}): BrandListResponse {
  return {
    brands: result.brands.map(buildBrand),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
  }
}
