import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { StoreVendor } from "@/store/lib/data/vendors"
import ThumbnailCard from "@/store/modules/common/components/thumbnail-card"
import { RiArrowDownSLine, RiCollapseVerticalLine } from "@remixicon/react"

const VISIBLE_VENDOR_COUNT = 4

export default function FeaturedVendors({
  vendors,
}: {
  vendors: StoreVendor[]
}) {
  if (!vendors.length) {
    return null
  }

  const visibleVendors = vendors.slice(0, VISIBLE_VENDOR_COUNT)
  const remainingVendors = vendors.slice(VISIBLE_VENDOR_COUNT)

  return (
    <div className="container py-12 sm:py-24">
      <p className="mb-6 font-heading text-2xl">Shop by vendor</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {visibleVendors.map((vendor) => (
          <li key={vendor.id}>
            <ThumbnailCard
              href={`/vendors/${vendor.handle}`}
              title={vendor.storefront_content?.name ?? vendor.name}
              image={vendor.storefront_content?.hero_image_url}
            />
          </li>
        ))}
      </ul>
      {remainingVendors.length > 0 && (
        <Collapsible className="mt-4">
          <CollapsibleTrigger
            render={
              <Button variant="ghost" className="w-full">
                <RiCollapseVerticalLine />
              </Button>
            }
          />
          <CollapsibleContent>
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {remainingVendors.map((vendor) => (
                <li key={vendor.id}>
                  <ThumbnailCard
                    href={`/vendors/${vendor.handle}`}
                    title={vendor.storefront_content?.name ?? vendor.name}
                    image={vendor.storefront_content?.hero_image_url}
                  />
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
