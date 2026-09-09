import type { VendorProduct } from "@dtc/api-contracts/vendor/products"

type RawVendorProduct = {
  id: string
  title: string
  handle: string | null
  status: VendorProduct["status"]
  thumbnail: string | null
  external_id: string | null
  variants?: { id: string }[] | null
}

export function buildVendorProduct(product: RawVendorProduct): VendorProduct {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    status: product.status,
    thumbnail: product.thumbnail,
    external_id: product.external_id,
    variant_count: product.variants?.length ?? 0,
  }
}
