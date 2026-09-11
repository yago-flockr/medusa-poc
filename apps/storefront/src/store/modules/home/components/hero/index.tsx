import Link from "next/link"

import { Button } from "@/components/ui/button"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative flex h-[75vh] w-full items-end bg-linear-to-br from-foreground to-foreground/80">
      <div className="container py-16">
        <div className="max-w-lg">
          <h1 className="font-heading text-4xl leading-tight text-background sm:text-5xl">
            Anyone can buy here. Almost no one gets to sell.
          </h1>
          <p className="mt-4 text-sm text-background/80 sm:text-base">
            Every house in the catalog is reviewed before a single product
            goes live. One basket can cross houses, one payment, one standard
            held against all of them.
          </p>
          <div className="mt-6 flex gap-3">
            <LocalizedClientLink href="/store">
              <Button className="bg-background text-foreground hover:bg-background/90">
                Shop the catalog
              </Button>
            </LocalizedClientLink>
            <Link href="/vendor">
              <Button
                variant="outline"
                className="border-background bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                Apply to sell
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
