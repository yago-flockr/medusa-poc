import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eyebrow } from "@/components/ui/eyebrow"
import { StoreVendor } from "@/store/lib/data/vendors"
import LocalizedClientLink from "@/store/modules/common/components/localized-client-link"
import { RiArrowRightLine } from "@remixicon/react"

const VISIBLE_VENDOR_COUNT = 4

export default function FeaturedVendors({
  vendors,
}: {
  vendors: StoreVendor[]
}) {
  if (!vendors.length) {
    return null
  }

  return (
    <section className="container flex flex-col gap-10">
      <div className="flex flex-col gap-4 border-b pb-8">
        <Eyebrow variant="accent">Archival registry</Eyebrow>
        <h2 className="font-heading text-3xl sm:text-4xl">
          The guarded maisons
        </h2>
      </div>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {vendors.slice(0, VISIBLE_VENDOR_COUNT).map((vendor, index) => (
          <li key={vendor.id}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-4">
                <span className="font-heading text-xl text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Separator />
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
                  className="inline-flex items-center gap-2 hover:text-ring"
                >
                  View collection
                  <RiArrowRightLine className="size-3" />
                </Eyebrow>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
