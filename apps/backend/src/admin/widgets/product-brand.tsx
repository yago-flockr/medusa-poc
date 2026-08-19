import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { PencilSquare } from "@medusajs/icons"
import { Button, Drawer, Text } from "@medusajs/ui"
import { useState } from "react"
import { ActionMenu } from "../components/action-menu"
import { Card } from "../components/card"
import { TitleSubtitle } from "../components/title-subtitle"
import {
  PRODUCT_BRAND_FORM_ID,
  ProductBrandForm,
} from "../forms/products/product-brand"
import { useAdminProductUpdate } from "../hooks/mutations/products"
import { useFindManyBrands } from "../hooks/queries/brands"
import { useAdminProductRetrieve } from "../hooks/queries/products"
import { optionalField } from "../lib/optional-field"

const ProductBrandWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const [open, setOpen] = useState(false)
  const findOneProduct = useAdminProductRetrieve(product.id, {
    fields: "+brand.*",
  })
  const findManyBrands = useFindManyBrands({ limit: 1000 })
  const updateProduct = useAdminProductUpdate()

  const brand = findOneProduct.data?.brand

  const rows = [
    { label: "Name", value: brand?.name },
    { label: "Handle", value: brand?.handle },
  ] as const satisfies { label: string; value: string | undefined }[]

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Brand" />
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  onClick: () => setOpen(true),
                },
              ],
            },
          ]}
        />
      </Card.Header>
      {rows.map((row, index) => (
        <Card.Content key={index} className="text-ui-fg-subtle grid-cols-2">
          <Text size="small" weight="plus" leading="compact">
            {row.label}
          </Text>
          <Text
            size="small"
            leading="compact"
            className="whitespace-pre-line text-pretty"
          >
            {optionalField(row.value)}
          </Text>
        </Card.Content>
      ))}
      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <TitleSubtitle title="Edit Brand" />
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-8 overflow-y-auto">
            <ProductBrandForm
              defaultValues={{ brand_id: brand?.id ?? null }}
              brands={findManyBrands.data?.brands ?? []}
              isLoading={updateProduct.isPending}
              onSubmit={(values) => {
                updateProduct.mutate(
                  {
                    id: product.id,
                    body: {
                      additional_data: { brand_id: values.brand_id },
                    },
                  },
                  { onSuccess: () => setOpen(false) },
                )
              }}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                size="small"
                variant="secondary"
                type="button"
                onClick={() => setOpen(false)}
                disabled={updateProduct.isPending}
              >
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                form={PRODUCT_BRAND_FORM_ID}
                isLoading={updateProduct.isPending}
              >
                Save
              </Button>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default ProductBrandWidget
