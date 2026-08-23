import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button } from "@medusajs/ui"
import { useState } from "react"
import { Card } from "../components/card"
import { TextField } from "../forms/fields/text-field"
import { usePullVendorShopifyProducts } from "../hooks/mutations/vendors"

const VendorShopifyProductsLogWidget = () => {
  const [vendorId, setVendorId] = useState("")
  const pullShopifyProducts = usePullVendorShopifyProducts()

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Log a vendor's Shopify products" />
      </Card.Header>
      <Card.Content className="flex items-end gap-x-2">
        <div className="flex-1">
          <TextField
            id="vendor-shopify-products-log-vendor-id"
            label="Vendor ID"
            placeholder="vend_..."
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          />
        </div>
        <Button
          size="small"
          type="button"
          disabled={!vendorId}
          isLoading={pullShopifyProducts.isPending}
          onClick={() =>
            pullShopifyProducts.mutate(vendorId, {
              onSuccess: (data) => {
                // eslint-disable-next-line no-console
                console.log("Shopify products for vendor", vendorId, data)
              },
              onError: (error) => {
                // eslint-disable-next-line no-console
                console.error("Failed to pull Shopify products", error)
              },
            })
          }
        >
          Log products
        </Button>
      </Card.Content>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default VendorShopifyProductsLogWidget
