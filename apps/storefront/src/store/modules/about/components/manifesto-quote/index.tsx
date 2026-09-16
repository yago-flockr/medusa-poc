import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/eyebrow"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

export default function ManifestoQuote() {
  return (
    <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[2fr_3fr] lg:gap-20">
      <figure className="flex flex-col gap-3">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-card">
          <Image
            src="/editorial/artisan-portrait.png"
            alt=""
            fill
            className="object-cover object-center"
          />
        </div>
        <figcaption>
          <Eyebrow>A house under review</Eyebrow>
        </figcaption>
      </figure>
      <div className="flex flex-col gap-8">
        <blockquote className="font-heading text-2xl italic leading-snug sm:text-3xl">
          &ldquo;A marketplace is only worth as much as the last thing it let
          through.&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground">
          Houses apply, and most are turned away. The ones that stay keep their
          own inventory, their own shipping and their own name on the product —
          we simply refuse to list anything we have not read first.
        </p>
        <Button
          variant="link"
          className="w-fit px-0"
          nativeButton={false}
          render={<LocalizedClientLink href="/store" />}
        >
          Browse the catalog
          <RiArrowRightLine data-icon="inline-end" />
        </Button>
      </div>
    </section>
  )
}
