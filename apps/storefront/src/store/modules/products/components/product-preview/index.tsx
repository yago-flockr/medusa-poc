import { getProductPrice } from "@/store/lib/util/get-product-price"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="mt-3 flex flex-col gap-0.5 text-sm">
          <span
            className="truncate font-medium text-foreground"
            data-testid="product-title"
          >
            {product.title}
          </span>
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
