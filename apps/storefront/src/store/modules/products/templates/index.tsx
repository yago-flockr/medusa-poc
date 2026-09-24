import React, { Suspense } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import ImageGallery from "@/store/modules/products/components/image-gallery"
import ProductActions from "@/store/modules/products/components/product-actions"
import ProductTabs from "@/store/modules/products/components/product-tabs"
import RelatedProducts from "@/store/modules/products/components/related-products"
import ProductInfo from "@/store/modules/products/templates/product-info"
import SkeletonRelatedProducts from "@/store/modules/skeletons/templates/skeleton-related-products"
import { StoreProductWithVendor } from "@/store/lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: StoreProductWithVendor
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

  const category = product.categories?.[0]

  return (
    <div className="container flex flex-col gap-16">
      <Breadcrumb>
        <BreadcrumbList className="text-xs uppercase tracking-widest text-muted-foreground">
          <BreadcrumbItem>
            <BreadcrumbLink render={<LocalizedClientLink href="/store" />}>
              Store
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                    />
                  }
                >
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div
        className="grid grid-cols-1 gap-12 lg:grid-cols-[3fr_2fr] lg:gap-20"
        data-testid="product-container"
      >
        <ImageGallery images={images} />
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <ProductInfo product={product} />
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
          <ProductTabs product={product} />
        </div>
      </div>

      <div data-testid="related-products-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} country={country} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
