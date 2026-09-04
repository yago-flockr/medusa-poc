import { z } from "zod"
import { vendorSchema, vendorUserSchema } from "@dtc/api-contracts/vendor/vendor"

export const getVendorsMeResponseSchema = z.object({
  vendor_user: vendorUserSchema,
  vendor: vendorSchema,
})

export type GetVendorsMeResponse = z.infer<typeof getVendorsMeResponseSchema>
