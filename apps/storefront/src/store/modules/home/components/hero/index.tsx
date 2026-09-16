import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Eyebrow } from "@/components/ui/eyebrow"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowDownLine, RiArrowRightLine } from "@remixicon/react"

const CITIES = ["Paris", "Lyon", "Kyoto", "Florence"]

const Hero = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "dark relative flex min-h-[85vh] w-full items-end overflow-hidden bg-background",
        className,
      )}
      {...props}
    >
      <Image
        src="/editorial/hero-banner.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/40" />
      <div className="container relative flex w-full flex-col gap-6">
        <Eyebrow variant="accent" className="flex items-center gap-3">
          <span className="h-px w-8 bg-ring" />
          The Vernissage Edition
        </Eyebrow>
        <h1 className="max-w-3xl font-heading text-4xl leading-tight text-foreground sm:text-6xl">
          Anyone can buy here. <em>Almost no one</em> gets to sell.
        </h1>
        <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
          Every house in the catalog is reviewed before a single product goes
          live. One basket can cross houses, one payment, one standard held
          against all of them.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            size="xl"
            nativeButton={false}
            render={<LocalizedClientLink href="/store" />}
          >
            Shop the catalog
            <RiArrowRightLine data-icon="inline-end" />
          </Button>
          <Button
            size="xl"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/vendor" />}
          >
            Apply to sell
          </Button>
        </div>
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Eyebrow className="flex items-center gap-3">
            <RiArrowDownLine className="size-4" />
            Scroll to browse collection
          </Eyebrow>
          <Eyebrow className="flex flex-wrap items-center gap-3">
            {CITIES.map((city) => (
              <span key={city}>{city}</span>
            ))}
          </Eyebrow>
        </div>
      </div>
    </div>
  )
}

export default Hero
