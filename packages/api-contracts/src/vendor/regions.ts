import { z } from "zod"

export const vendorCountrySchema = z.object({
  iso_2: z.string(),
  display_name: z.string(),
})

export type VendorCountry = z.infer<typeof vendorCountrySchema>

export const getVendorsRegionsResponseSchema = z.object({
  countries: z.array(vendorCountrySchema),
})

export type GetVendorsRegionsResponse = z.infer<
  typeof getVendorsRegionsResponseSchema
>
