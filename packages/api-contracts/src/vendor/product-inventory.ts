import { z } from "zod"

export const vendorInventoryLevelSchema = z.object({
  location_id: z.string(),
  quantity: z.number(),
})

export type VendorInventoryLevel = z.infer<typeof vendorInventoryLevelSchema>

export const vendorVariantInventorySchema = z.object({
  variant_id: z.string(),
  variant_title: z.string(),
  levels: z.array(vendorInventoryLevelSchema),
})

export type VendorVariantInventory = z.infer<typeof vendorVariantInventorySchema>

export const vendorProductInventoryResponseSchema = z.object({
  variants: z.array(vendorVariantInventorySchema),
  locations: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type VendorProductInventoryResponse = z.infer<
  typeof vendorProductInventoryResponseSchema
>

export const setVendorInventoryLevelSchema = z
  .object({
    variant_id: z.string(),
    location_id: z.string(),
    quantity: z.number().int().min(0),
  })
  .strict()

export type SetVendorInventoryLevel = z.infer<typeof setVendorInventoryLevelSchema>
