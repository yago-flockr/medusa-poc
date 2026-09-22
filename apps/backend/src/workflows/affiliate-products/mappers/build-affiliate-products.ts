import type { AffiliateProduct } from "@dtc/api-contracts/affiliate/products"

type RawProduct = {
  id?: string | null
  title?: string | null
  handle?: string | null
  thumbnail?: string | null
}

export function buildAffiliateProducts(
  products: (RawProduct | null)[],
): AffiliateProduct[] {
  return products
    .filter(
      (product): product is RawProduct =>
        product != null && !!product.id && !!product.title && !!product.handle,
    )
    .map((product) => ({
      id: product.id as string,
      title: product.title as string,
      handle: product.handle as string,
      thumbnail: product.thumbnail ?? null,
    }))
}
