import { z } from "zod"

export const updateVendorProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
})

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>

export const updateVendorProfileResponseSchema = z.object({
  vendor_user: z.object({
    id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
  }),
})

export type UpdateVendorProfileResponse = z.infer<
  typeof updateVendorProfileResponseSchema
>
