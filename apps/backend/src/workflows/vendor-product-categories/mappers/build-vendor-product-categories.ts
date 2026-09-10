import type { VendorProductCategory } from "@dtc/api-contracts/vendor/product-categories"

type RawProductCategory = {
  id: string
  name: string
  handle: string
}

export function buildVendorProductCategories(
  productCategories: RawProductCategory[],
): VendorProductCategory[] {
  return productCategories.map((category) => ({
    id: category.id,
    name: category.name,
    handle: category.handle,
  }))
}
