import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Card } from "../components/card"
import { useAdminProductRetrieve } from "../hooks/queries/products"

const ProductVendorWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const findOneProduct = useAdminProductRetrieve(product.id, {
    fields: "+vendor.*",
  })

  const vendor = findOneProduct.data?.vendor

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Vendor" />
      </Card.Header>
      <Card.InfoRow>
        <Card.InfoLabel>Name</Card.InfoLabel>
        <Card.InfoText>{vendor?.name}</Card.InfoText>
      </Card.InfoRow>
      <Card.InfoRow>
        <Card.InfoLabel>Handle</Card.InfoLabel>
        <Card.InfoText>{vendor?.handle}</Card.InfoText>
      </Card.InfoRow>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default ProductVendorWidget
