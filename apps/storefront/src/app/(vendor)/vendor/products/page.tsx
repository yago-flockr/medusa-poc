"use client"

import { DataState } from "@/components/display/data-state"
import { VendorSection } from "@/vendor/components/section"
import { useGetProducts } from "@/vendor/hooks/queries/products"
import type { VendorProduct } from "@dtc/api-contracts/vendor/products"
import { RiLinksLine } from "@remixicon/react"

export default function VendorProductsPage() {
  const getProducts = useGetProducts()

  return (
    <VendorSection
      title="Products"
      description="View your catalogue, publish products yourself, or remove them. Anything synced from Shopify keeps its details in sync from there — this page only controls whether it's visible to customers."
      className="flex flex-col gap-3"
    >
      <DataState
        isLoading={getProducts.isLoading}
        isEmpty={getProducts.data?.products.length === 0}
      >
        <DataState.Loading />
        <DataState.Empty>
          <p className="text-sm text-muted-foreground">No products yet.</p>
        </DataState.Empty>
        <DataState.Content>
          <ul className="flex flex-col gap-2">
            {getProducts.data?.products.map((product: VendorProduct) => (
              <li
                key={product.id}
                className="flex items-center gap-3 rounded-md border px-4 py-3 text-sm"
              >
                {product.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail}
                    alt=""
                    className="size-10 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{product.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {product.variant_count} variant
                      {product.variant_count === 1 ? "" : "s"}
                    </span>
                    {product.external_id && (
                      <div className="flex items-center text-muted-foreground font-medium gap-1">
                        <RiLinksLine size={16} />
                        <span>Imported</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground uppercase">
                  {product.status}
                </span>
              </li>
            ))}
          </ul>
        </DataState.Content>
      </DataState>
    </VendorSection>
  )
}
