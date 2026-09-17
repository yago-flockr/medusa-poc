"use client"

import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Eyebrow } from "@/components/ui/eyebrow"
import { StoreProductCategoryWithStorefrontContent } from "@/store/lib/data/categories"
import ThumbnailCard from "@/store/modules/common/components/thumbnail-card"

export default function FeaturedCategories({
  categories,
  className,
  ...props
}: ComponentProps<"section"> & {
  categories: StoreProductCategoryWithStorefrontContent[]
}) {
  if (!categories.length) {
    return null
  }

  return (
    <section className={cn("container", className)} {...props}>
      <Carousel
        opts={{ align: "start", loop: true }}
        className="flex flex-col gap-8"
      >
        <div className="flex items-end justify-between gap-6 border-b pb-8">
          <div className="flex flex-col gap-4">
            <Eyebrow variant="accent">Sartorial suites</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl">
              Shop by category
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem key={category.id} className="basis-1/2 sm:basis-1/4">
              <ThumbnailCard
                href={`/categories/${category.handle}`}
                title={category.storefront_content?.name ?? category.name}
                image={category.storefront_content?.hero_image_url}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
