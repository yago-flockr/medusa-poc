import { z } from "zod"
import { vendorIntegrationConnectionSchema } from "./integration-connection"

export const vendorMeResponseSchema = z.object({
  vendor_user: z.object({
    id: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email: z.string(),
  }),
  vendor: z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    integration_connections: z.array(vendorIntegrationConnectionSchema),
  }),
})

export type VendorMeResponse = z.infer<typeof vendorMeResponseSchema>
