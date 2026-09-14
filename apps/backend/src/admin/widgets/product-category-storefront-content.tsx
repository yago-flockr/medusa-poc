import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type {
  AdminProductCategory,
  DetailWidgetProps,
} from "@medusajs/framework/types"
import { useState } from "react"
import { StorefrontContentWidget } from "../components/storefront-content-widget"
import { useAdminProductCategoryStorefrontContentUpdate } from "../hooks/mutations/product-categories"
import { useAdminProductCategoryRetrieve } from "../hooks/queries/product-categories"

const ProductCategoryStorefrontContentWidget = ({
  data: category,
}: DetailWidgetProps<AdminProductCategory>) => {
  const [open, setOpen] = useState(false)
  const findOneCategory = useAdminProductCategoryRetrieve(category.id, {
    fields: "+storefront_content.*",
  })
  const updateStorefrontContent =
    useAdminProductCategoryStorefrontContentUpdate()

  return (
    <StorefrontContentWidget
      storefrontContent={findOneCategory.data?.storefront_content}
      isSubmitting={updateStorefrontContent.isPending}
      open={open}
      onOpenChange={setOpen}
      onSubmit={(values) =>
        updateStorefrontContent.mutate(
          { id: category.id, body: values },
          { onSuccess: () => setOpen(false) },
        )
      }
    />
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.details",
})

export default ProductCategoryStorefrontContentWidget
