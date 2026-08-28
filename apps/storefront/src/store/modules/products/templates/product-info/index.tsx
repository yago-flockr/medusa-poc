import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="mx-auto flex flex-col gap-y-4 lg:max-w-[500px]">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <h2
          className="text-3xl leading-10 text-foreground"
          data-testid="product-title"
        >
          {product.title}
        </h2>

        <p
          className="whitespace-pre-line text-muted-foreground"
          data-testid="product-description"
        >
          {product.description}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo
