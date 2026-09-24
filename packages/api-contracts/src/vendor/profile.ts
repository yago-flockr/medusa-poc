import { z } from "zod"
import { vendorUserSchema } from "@dtc/api-contracts/vendor/vendor"

export const patchVendorsMeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

export type PatchVendorsMeInput = z.infer<typeof patchVendorsMeInputSchema>

export const patchVendorsMeResponseSchema = z.object({
  vendor_user: vendorUserSchema.pick({
    id: true,
    name: true,
  }),
})

export type PatchVendorsMeResponse = z.infer<
  typeof patchVendorsMeResponseSchema
>
