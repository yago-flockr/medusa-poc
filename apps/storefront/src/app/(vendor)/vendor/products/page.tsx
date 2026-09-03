"use client"

import { DataState } from "@/components/display/data-state"
import { ErrorAlert } from "@/components/display/error-alert"
import { FormDialog } from "@/components/display/form-dialog"
import { ListItem } from "@/components/display/list-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VendorSection } from "@/vendor/components/section"
import {
  ProductInventoryForm,
  productInventoryFormToInput,
} from "@/vendor/forms/product-inventory-form"
import { usePostVendorsProductsByIdInventory } from "@/vendor/hooks/mutations/product-inventory"
import { useGetVendorsProductsByIdInventory } from "@/vendor/hooks/queries/product-inventory"
import { useGetVendorsProducts } from "@/vendor/hooks/queries/products"
import type { VendorProduct } from "@dtc/api-contracts/vendor/products"
import { RiLinksLine, RiStackLine } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"

export default function VendorProductsPage() {
  const getVendorsProducts = useGetVendorsProducts()
  const [inventoryProductId, setInventoryProductId] = useState<string | null>(
    null,
  )

  const getVendorsProductsByIdInventory = useGetVendorsProductsByIdInventory(
    inventoryProductId ?? "",
    { enabled: inventoryProductId !== null },
  )
  const postVendorsProductsByIdInventory = usePostVendorsProductsByIdInventory()

  const inventory = getVendorsProductsByIdInventory.data

  return (
    <VendorSection
      title="Products"
      description="View your catalogue, publish products yourself, or remove them. Anything synced from Shopify keeps its details in sync from there — this page only controls whether it's visible to customers."
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getVendorsProducts.isLoading}
        isEmpty={getVendorsProducts.data?.products.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No products yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ul className="flex flex-col gap-2">
            {getVendorsProducts.data?.products.map((product: VendorProduct) => (
              <ListItem.Root key={product.id}>
                {product.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                )}
                <ListItem.Group className="flex-1">
                  <ListItem.Title>{product.title}</ListItem.Title>
                  <ListItem.Description className="flex items-center gap-2">
                    <span>{product.variant_count} variants</span>
                    {product.external_id && (
                      <span className="flex items-center gap-1">
                        <RiLinksLine size={14} />
                        Imported
                      </span>
                    )}
                  </ListItem.Description>
                </ListItem.Group>
                <ListItem.Group className="flex-row items-center gap-2">
                  <Badge variant="muted">{product.status}</Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setInventoryProductId(product.id)}
                  >
                    <RiStackLine />
                  </Button>
                </ListItem.Group>
              </ListItem.Root>
            ))}
          </ul>
        </DataState.Content>
      </DataState>

      <FormDialog
        title="Manage inventory"
        description="Set how many units of each variant are stocked at each location."
        open={inventoryProductId !== null}
        onOpenChange={(open) => {
          if (!open) setInventoryProductId(null)
        }}
      >
        {getVendorsProductsByIdInventory.error && (
          <ErrorAlert
            description={getVendorsProductsByIdInventory.error.message}
          />
        )}
        <DataState isLoading={getVendorsProductsByIdInventory.isLoading}>
          <DataState.Loading />
          <DataState.Content>
            {inventory && (
              <ProductInventoryForm
                variants={inventory.variants}
                locations={inventory.locations}
                isLoading={postVendorsProductsByIdInventory.isPending}
                onSubmit={(values) => {
                  if (!inventoryProductId) return

                  Promise.all(
                    productInventoryFormToInput(values).map((level) =>
                      postVendorsProductsByIdInventory.mutateAsync({
                        productId: inventoryProductId,
                        ...level,
                      }),
                    ),
                  )
                    .then(() => {
                      toast.success("Inventory updated")
                      getVendorsProductsByIdInventory.refetch()
                    })
                    .catch(() => {
                      // surfaced via postVendorsProductsByIdInventory.error below
                    })
                }}
              />
            )}
          </DataState.Content>
        </DataState>
        {postVendorsProductsByIdInventory.error && (
          <ErrorAlert
            description={postVendorsProductsByIdInventory.error.message}
          />
        )}
      </FormDialog>
    </VendorSection>
  )
}
