import { z } from "zod"
import { vendorUserSchema } from "./vendor"

export const updateVendorProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
})

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>

export const updateVendorProfileResponseSchema = z.object({
  vendor_user: vendorUserSchema.pick({
    id: true,
    first_name: true,
    last_name: true,
  }),
})

export type UpdateVendorProfileResponse = z.infer<
  typeof updateVendorProfileResponseSchema
>
