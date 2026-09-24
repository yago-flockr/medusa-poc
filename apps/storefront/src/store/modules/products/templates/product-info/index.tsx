import { StoreProductWithVendor } from "@/store/lib/data/products"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: StoreProductWithVendor
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-4">
      {product.vendor && (
        <LocalizedClientLink
          className="text-xs uppercase tracking-widest text-primary"
          href={`/vendors/${product.vendor.handle}`}
        >
          {product.vendor.name}
        </LocalizedClientLink>
      )}
      <h1
        className="font-heading text-3xl leading-tight sm:text-4xl"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {product.description && (
        <p
          className="whitespace-pre-line text-sm text-muted-foreground"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
