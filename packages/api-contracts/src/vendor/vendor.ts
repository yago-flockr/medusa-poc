import { z } from "zod"
import { vendorIntegrationConnectionSchema } from "@dtc/api-contracts/vendor/integration-connection"

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
  integration_connections: z.array(vendorIntegrationConnectionSchema),
})

export type Vendor = z.infer<typeof vendorSchema>
