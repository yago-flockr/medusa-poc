"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Item, ItemGroup } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import type {
  PostVendorsProductsByIdInventoryInput,
  VendorVariantInventory,
} from "@dtc/api-contracts/vendor/product-inventory"
import { useState, type FormEvent } from "react"
import z from "zod"
import { NumberControlField } from "./fields/number-field-control"
import type { CommonFormProps } from "./form-type"

export const productInventorySchema = z.object({
  levels: z.array(
    z.object({
      variant_id: z.string(),
      location_id: z.string(),
      quantity: z.number().int().min(0),
    }),
  ),
})

export type ProductInventorySchema = z.infer<typeof productInventorySchema>

type ProductInventoryFormProps = CommonFormProps<ProductInventorySchema> & {
  variants: VendorVariantInventory[]
  locations: { id: string; name: string }[]
}

export function productInventoryFormToInput(
  values: ProductInventorySchema,
): PostVendorsProductsByIdInventoryInput[] {
  return values.levels
}

function cellKey(variantId: string, locationId: string) {
  return `${variantId}::${locationId}`
}

export function ProductInventoryForm({
  variants,
  locations,
  isLoading,
  onSubmit,
  className,
  ...props
}: ProductInventoryFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const variant of variants) {
      for (const level of variant.levels) {
        initial[cellKey(variant.variant_id, level.location_id)] = level.quantity
      }
    }
    return initial
  })
  const [error, setError] = useState<string>()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const levels = variants.flatMap((variant) =>
      locations.map((location) => ({
        variant_id: variant.variant_id,
        location_id: location.id,
        quantity: quantities[cellKey(variant.variant_id, location.id)] ?? 0,
      })),
    )

    const result = productInventorySchema.safeParse({ levels })

    if (!result.success) {
      console.error("Form validation failed:", result.error.issues)
      setError(result.error.issues[0]?.message)
      return
    }

    setError(undefined)
    onSubmit?.(result.data)
  }

  if (locations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create a stock location first before setting inventory.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <ItemGroup>
        {variants.map((variant) => (
          <Item
            key={variant.variant_id}
            variant="outline"
            className="flex-col items-stretch gap-2"
          >
            <Badge className="w-fit">{variant.variant_title}</Badge>
            {locations.map((location) => {
              const reserved =
                variant.levels.find((level) => level.location_id === location.id)
                  ?.reserved_quantity ?? 0
              const stocked = quantities[cellKey(variant.variant_id, location.id)] ?? 0

              return (
                <div key={location.id} className="flex flex-col gap-1">
                  <NumberControlField
                    id={`inventory-${variant.variant_id}-${location.id}`}
                    label={location.name}
                    min={0}
                    value={stocked}
                    onValueChange={(value) =>
                      setQuantities((current) => ({
                        ...current,
                        [cellKey(variant.variant_id, location.id)]: value ?? 0,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {reserved} reserved · {stocked - reserved} available
                  </p>
                </div>
              )
            })}
          </Item>
        ))}
      </ItemGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  )
}
