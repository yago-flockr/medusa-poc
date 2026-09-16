import { Badge } from "@/components/ui/badge"
import { Eyebrow } from "@/components/ui/eyebrow"
import { getProductPrice } from "@/store/lib/util/get-product-price"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { StoreProductWithVendor } from "@/store/lib/data/products"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
}: {
  product: StoreProductWithVendor
  isFeatured?: boolean
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div className="flex flex-col gap-4" data-testid="product-wrapper">
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          {cheapestPrice?.price_type === "sale" && (
            <Badge className="absolute top-3 left-3">
              -{cheapestPrice.percentage_diff}%
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {product.vendor && (
            <Eyebrow variant="accent">{product.vendor.name}</Eyebrow>
          )}
          <span
            className="font-heading text-base leading-snug"
            data-testid="product-title"
          >
            {product.title}
          </span>
          {cheapestPrice && (
            <div className="flex items-baseline gap-2 text-sm">
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
