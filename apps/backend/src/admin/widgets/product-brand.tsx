import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Text } from "@medusajs/ui"
import { Card } from "../components/card"
import { useAdminProductRetrieve } from "../hooks/queries/products"

const ProductBrandWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const adminProductRetrieve = useAdminProductRetrieve(product.id, ["brand"])

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title title="Brand" />
      </Card.Header>
      <Card.Content
        className="text-ui-fg-subtle grid-cols-2"
      >
        <Text size="small" weight="plus" leading="compact">
          Name
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {adminProductRetrieve.data?.brand?.name || "-"}
        </Text>
      </Card.Content>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default ProductBrandWidget