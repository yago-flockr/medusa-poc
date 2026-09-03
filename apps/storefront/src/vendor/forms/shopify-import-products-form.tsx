"use client"

import { ListItem } from "@/components/display/list-item"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type {
  PostVendorsMeShopifyProductsImportInput,
  PulledShopifyProductWithStatus,
} from "@dtc/api-contracts/vendor/shopify-products"
import { useState, type FormEvent } from "react"
import z from "zod"
import type { CommonFormProps } from "./form-type"
import { Badge } from "@/components/ui/badge"

export const shopifyImportProductsSchema = z.object({
  shopify_product_ids: z
    .array(z.string())
    .min(1, "Select at least one product"),
})

export type ShopifyImportProductsSchema = z.infer<
  typeof shopifyImportProductsSchema
>

type ShopifyImportProductsFormProps =
  CommonFormProps<ShopifyImportProductsSchema> & {
    products: PulledShopifyProductWithStatus[]
  }

export function shopifyImportProductsFormToInput(
  values: ShopifyImportProductsSchema,
): PostVendorsMeShopifyProductsImportInput {
  return {
    shopify_product_ids: values.shopify_product_ids,
  }
}

export function ShopifyImportProductsForm({
  products,
  isLoading,
  onSubmit,
  className,
  ...props
}: ShopifyImportProductsFormProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>()

  function toggle(shopifyId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(shopifyId)
      } else {
        next.delete(shopifyId)
      }
      return next
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const result = shopifyImportProductsSchema.safeParse({
      shopify_product_ids: Array.from(selectedIds),
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message)
      return
    }

    setError(undefined)
    onSubmit?.(result.data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <ul className="flex flex-col gap-2">
        {products.map((product) => (
          <ListItem.Root key={product.shopify_id}>
            <Checkbox
              id={`shopify-product-${product.shopify_id}`}
              checked={selectedIds.has(product.shopify_id)}
              onCheckedChange={(checked) =>
                toggle(product.shopify_id, checked === true)
              }
            />
            <ListItem.Group className="flex-1">
              <ListItem.Title>{product.title}</ListItem.Title>
              <ListItem.Description>
                {product.variants.length} variants
              </ListItem.Description>
            </ListItem.Group>
            {product.already_imported && (
              <ListItem.Group>
                <Badge variant="muted">Imported</Badge>
              </ListItem.Group>
            )}
          </ListItem.Root>
        ))}
      </ul>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading || selectedIds.size === 0}>
        {isLoading ? "Importing…" : `Import selected (${selectedIds.size})`}
      </Button>
    </form>
  )
}
