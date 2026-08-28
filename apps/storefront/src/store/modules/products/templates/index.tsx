import React, { Suspense } from "react"

import ImageGallery from "@/store/modules/products/components/image-gallery"
import ProductActions from "@/store/modules/products/components/product-actions"
import ProductTabs from "@/store/modules/products/components/product-tabs"
import RelatedProducts from "@/store/modules/products/components/related-products"
import ProductInfo from "@/store/modules/products/templates/product-info"
import SkeletonRelatedProducts from "@/store/modules/skeletons/templates/skeleton-related-products"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  country: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  country,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="container relative flex flex-col py-6 sm:flex-row sm:items-start"
        data-testid="product-container"
      >
        <div className="flex w-full flex-col gap-y-6 py-8 sm:sticky sm:top-48 sm:max-w-[300px] sm:py-0">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="relative block w-full">
          <ImageGallery images={images} />
        </div>
        <div className="flex w-full flex-col gap-y-12 py-8 sm:sticky sm:top-48 sm:max-w-[300px] sm:py-0">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>
      </div>
      <div
        className="container my-16 sm:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} country={country} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
