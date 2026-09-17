"use client"

import { ComponentProps } from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Eyebrow } from "@/components/ui/eyebrow"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { StoreVendor } from "@/store/lib/data/vendors"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

export default function FeaturedVendors({
  vendors,
  className,
  ...props
}: ComponentProps<"section"> & { vendors: StoreVendor[] }) {
  if (!vendors.length) {
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
            <Eyebrow variant="accent">Archival registry</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl">
              The guarded maisons
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent>
          {vendors.map((vendor, index) => (
            <CarouselItem
              key={vendor.id}
              className="basis-full sm:basis-1/2 lg:basis-1/4"
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <span className="font-heading text-xl text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-xl">
                    {vendor.storefront_content?.name ?? vendor.name}
                  </h3>
                  {vendor.storefront_content?.description && (
                    <p className="text-sm text-muted-foreground">
                      {vendor.storefront_content.description}
                    </p>
                  )}
                  <Separator className="mt-auto" />
                  <Eyebrow
                    variant="foreground"
                    render={
                      <LocalizedClientLink href={`/vendors/${vendor.handle}`} />
                    }
                    className="inline-flex items-center gap-2 hover:text-primary"
                  >
                    View collection
                    <RiArrowRightLine className="size-3" />
                  </Eyebrow>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
