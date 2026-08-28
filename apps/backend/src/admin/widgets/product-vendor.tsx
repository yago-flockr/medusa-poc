import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Text } from "@medusajs/ui"
import { Card } from "../components/card"
import { useAdminProductRetrieve } from "../hooks/queries/products"
import { optionalField } from "../lib/optional-field"

const ProductVendorWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const findOneProduct = useAdminProductRetrieve(product.id, {
    fields: "+vendor.*",
  })

  const vendor = findOneProduct.data?.vendor

  const rows = [
    { label: "Name", value: vendor?.name },
    { label: "Handle", value: vendor?.handle },
  ] as const satisfies { label: string; value: string | undefined }[]

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Vendor" />
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
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default ProductVendorWidget
