"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useImportShopifyProducts } from "@/vendor/hooks/mutations/shopify"
import type { PulledShopifyProductWithStatus } from "@dtc/api-contracts/vendor/shopify-products"
import { RiCheckLine } from "@remixicon/react"
import { useEffect, useState } from "react"

export function ShopifyProductsChecklist({
  products,
  onImported,
}: {
  products: PulledShopifyProductWithStatus[]
  onImported?: () => void
}) {
  const importShopifyProducts = useImportShopifyProducts()
  const [checkedIds, setCheckedIds] = useState<string[]>(() =>
    products
      .filter((product) => product.already_imported)
      .map((product) => product.shopify_id),
  )

  useEffect(() => {
    setCheckedIds((prev) =>
      prev.filter((id) =>
        products.some((product) => product.shopify_id === id),
      ),
    )
  }, [products])

  const submit = () => {
    importShopifyProducts.mutate(
      { shopify_product_ids: checkedIds },
      {
        onSuccess: () => {
          setCheckedIds([])
          onImported?.()
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {products.map((product) => (
          <li
            key={product.shopify_id}
            className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
          >
            <Checkbox
              checked={checkedIds.includes(product.shopify_id)}
              onCheckedChange={(checked) =>
                setCheckedIds((prev) =>
                  checked
                    ? [...prev, product.shopify_id]
                    : prev.filter((id) => id !== product.shopify_id),
                )
              }
            />
            <div className="flex-1">
              <p className="font-medium">{product.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{product.variants.length} variant(s)</span>
                {product.already_imported && (
                  <div className="flex items-center text-success font-medium gap-1">
                    <RiCheckLine size={16} />
                    <span>Already Imported</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        disabled={checkedIds.length === 0 || importShopifyProducts.isPending}
        onClick={submit}
      >
        {importShopifyProducts.isPending
          ? "Importing…"
          : `Import ${checkedIds.length} selected`}
      </Button>
      {importShopifyProducts.isError && (
        <p className="text-sm text-destructive">
          {importShopifyProducts.error.message}
        </p>
      )}
      {importShopifyProducts.isSuccess && (
        <div className="flex items-center gap-2 text-sm justify-between text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>created {importShopifyProducts.data.created_count}</span>
            {" • "}
            <span>updated {importShopifyProducts.data.updated_count}</span>
          </div>
          <span>waiting for staff approval</span>
        </div>
      )}
    </div>
  )
}
