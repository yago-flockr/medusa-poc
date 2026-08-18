import { z } from "@medusajs/framework/zod"

export const vendorUserSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
})

export type VendorUser = z.infer<typeof vendorUserSchema>

export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  users: z.array(vendorUserSchema),
})

export type Vendor = z.infer<typeof vendorSchema>

export const createVendorSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    handle: z.string().trim().min(1).optional(),
    user: z
      .object({
        email: z.string().email(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      })
      .strict(),
  })
  .strict()

export type CreateVendor = z.infer<typeof createVendorSchema>

export type VendorResponse = {
  vendor: Vendor
}
