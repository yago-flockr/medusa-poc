import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button } from "@medusajs/ui"
import { useState } from "react"
import { Card } from "../components/card"
import { SelectField } from "../forms/fields/select-field"
import { usePullVendorShopifyProducts } from "../hooks/mutations/vendors"
import { useFindManyVendors } from "../hooks/queries/vendors"

const VendorShopifyProductsLogWidget = () => {
  const [vendorId, setVendorId] = useState("")

  const findManyVendors = useFindManyVendors({})
  const pullShopifyProducts = usePullVendorShopifyProducts()

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title level="h2" title="Log Vendor Shopify Products" />
      </Card.Header>
      <Card.Content className="flex items-end gap-x-2">
        <div className="flex-1">
          <SelectField
            placeholder="Select a Vendor"
            label="Vendor"
            options={
              findManyVendors.data?.vendors.map((vendor) => ({
                label: vendor.name ?? "",
                value: vendor.id,
              })) ?? []
            }
            value={vendorId}
            onValueChange={(value) => setVendorId(value)}
          />
        </div>
        <Button
          type="button"
          disabled={!vendorId}
          isLoading={pullShopifyProducts.isPending}
          onClick={() =>
            pullShopifyProducts.mutate(vendorId, {
              onSuccess: (data) => {
                console.log("Shopify products for vendor", vendorId, data)
              },
              onError: (error) => {
                console.error("Failed to pull Shopify products", error)
              },
            })
          }
        >
          Log Products
        </Button>
      </Card.Content>
    </Card.Root>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default VendorShopifyProductsLogWidget
