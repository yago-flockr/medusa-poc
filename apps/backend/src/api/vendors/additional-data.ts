import { z } from "@medusajs/framework/zod"

export const vendorAdditionalData = {
  vendor_id: z.string().nullish(),
}

const vendorAdditionalDataSchema = z.object(vendorAdditionalData)

export type VendorAdditionalData = z.infer<typeof vendorAdditionalDataSchema>
