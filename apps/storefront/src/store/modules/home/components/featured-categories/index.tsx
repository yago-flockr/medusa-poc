"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { StoreProductCategoryWithStorefrontContent } from "@/store/lib/data/categories"
import ThumbnailCard from "@/store/modules/common/components/thumbnail-card"

export default function FeaturedCategories({
  categories,
}: {
  categories: StoreProductCategoryWithStorefrontContent[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <div className="container py-12 sm:py-24">
      <p className="mb-6 font-heading text-2xl">Shop by category</p>
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem
              key={category.id}
              className="basis-1/2 sm:basis-1/4"
            >
              <ThumbnailCard
                href={`/categories/${category.handle}`}
                title={category.storefront_content?.name ?? category.name}
                image={category.storefront_content?.hero_image_url}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
