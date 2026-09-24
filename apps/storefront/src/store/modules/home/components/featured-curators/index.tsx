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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { StoreAffiliate } from "@/store/lib/data/affiliates"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

export default function FeaturedCurators({
  affiliates,
  className,
  ...props
}: ComponentProps<"section"> & { affiliates: StoreAffiliate[] }) {
  if (!affiliates.length) {
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
            <span className="text-xs uppercase tracking-widest text-primary">
              Curated by hand
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl">
              The people who choose
            </h2>
          </div>
          <div className="flex shrink-0 gap-2">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </div>
        <CarouselContent>
          {affiliates.map((affiliate, index) => (
            <CarouselItem
              key={affiliate.id}
              className="basis-full sm:basis-1/2 lg:basis-1/4"
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <span className="font-heading text-xl text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-xl">
                    {affiliate.storefront_content?.name ?? affiliate.name}
                  </h3>
                  {affiliate.storefront_content?.description && (
                    <p className="text-sm text-muted-foreground">
                      {affiliate.storefront_content.description}
                    </p>
                  )}
                  <Separator className="mt-auto" />
                  <LocalizedClientLink
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground hover:text-primary"
                    href={`/affiliates/${affiliate.handle}`}
                  >
                    View their picks
                    <RiArrowRightLine className="size-3" />
                  </LocalizedClientLink>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
