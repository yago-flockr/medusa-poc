import { z } from "zod"
import { vendorUserSchema } from "@dtc/api-contracts/vendor/vendor"

export const patchVendorsMeInputSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
})

export type PatchVendorsMeInput = z.infer<typeof patchVendorsMeInputSchema>

export const patchVendorsMeResponseSchema = z.object({
  vendor_user: vendorUserSchema.pick({
    id: true,
    first_name: true,
    last_name: true,
  }),
})

export type PatchVendorsMeResponse = z.infer<
  typeof patchVendorsMeResponseSchema
>
