"use client"

import { DataState } from "@/components/display/data-state"
import { ListItem } from "@/components/display/list-item"
import { Badge } from "@/components/ui/badge"
import { VendorSection } from "@/vendor/components/section"
import { useGetVendorsProducts } from "@/vendor/hooks/queries/products"
import type { VendorProduct } from "@dtc/api-contracts/vendor/products"
import { RiLinksLine } from "@remixicon/react"

export default function VendorProductsPage() {
  const getVendorsProducts = useGetVendorsProducts()

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
                <ListItem.Group>
                  <Badge variant="muted">{product.status}</Badge>
                </ListItem.Group>
              </ListItem.Root>
            ))}
          </ul>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
