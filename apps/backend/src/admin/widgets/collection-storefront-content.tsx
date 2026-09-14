import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type {
  AdminCollection,
  DetailWidgetProps,
} from "@medusajs/framework/types"
import { useState } from "react"
import { StorefrontContentWidget } from "../components/storefront-content-widget"
import { useAdminCollectionStorefrontContentUpdate } from "../hooks/mutations/collections"
import { useAdminCollectionRetrieve } from "../hooks/queries/collections"

const CollectionStorefrontContentWidget = ({
  data: collection,
}: DetailWidgetProps<AdminCollection>) => {
  const [open, setOpen] = useState(false)
  const findOneCollection = useAdminCollectionRetrieve(collection.id, {
    fields: "+storefront_content.*",
  })
  const updateStorefrontContent = useAdminCollectionStorefrontContentUpdate()

  return (
    <StorefrontContentWidget
      storefrontContent={findOneCollection.data?.storefront_content}
      isSubmitting={updateStorefrontContent.isPending}
      open={open}
      onOpenChange={setOpen}
      onSubmit={(values) =>
        updateStorefrontContent.mutate(
          { id: collection.id, body: values },
          { onSuccess: () => setOpen(false) },
        )
      }
    />
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details",
})

export default CollectionStorefrontContentWidget
