import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import { StoreProductWithVendor, listProducts } from "@/store/lib/data/products"
import { getVendorByHandle } from "@/store/lib/data/vendors"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

import Product from "../product-preview"

const RELATED_PRODUCT_COUNT = 4

type RelatedProductsProps = {
  product: StoreProductWithVendor
  country: string
}

export default async function RelatedProducts({
  product,
  country,
}: RelatedProductsProps) {
  if (!product.vendor) {
    return null
  }

  const vendor = await getVendorByHandle(product.vendor.handle)

  const productIds = (vendor?.products ?? [])
    .map((vendorProduct) => vendorProduct.id)
    .filter((id) => id !== product.id)
    .slice(0, RELATED_PRODUCT_COUNT)

  if (!productIds.length) {
    return null
  }

  const { response } = await listProducts({
    countryCode: country,
    queryParams: { id: productIds, limit: RELATED_PRODUCT_COUNT },
  })

  if (!response.products.length) {
    return null
  }

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-3">
          <Eyebrow variant="accent">More from this maison</Eyebrow>
          <h2 className="font-heading text-2xl sm:text-3xl">
            {product.vendor.name}
          </h2>
        </div>
        <Button
          variant="link"
          nativeButton={false}
          render={
            <LocalizedClientLink href={`/vendors/${product.vendor.handle}`} />
          }
        >
          View maison archive
          <RiArrowRightLine data-icon="inline-end" />
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {response.products.map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <Product product={relatedProduct} />
          </li>
        ))}
      </ul>
    </section>
  )
}
