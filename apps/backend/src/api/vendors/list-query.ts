import { z } from "@medusajs/framework/zod"
import { MedusaError } from "@medusajs/framework/utils"

const vendorListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type VendorListQuery = z.infer<typeof vendorListQuerySchema>

export function parseVendorListQuery(query: unknown): VendorListQuery {
  const result = vendorListQuerySchema.safeParse(query)

  if (!result.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "limit must be an integer between 1 and 100, offset must be 0 or greater.",
    )
  }

  return result.data
}
