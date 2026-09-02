import { z } from "zod"
import { vendorSchema, vendorUserSchema } from "./vendor"

export const vendorMeResponseSchema = z.object({
  vendor_user: vendorUserSchema,
  vendor: vendorSchema,
})

export type VendorMeResponse = z.infer<typeof vendorMeResponseSchema>
