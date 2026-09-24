import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { z } from "@medusajs/framework/zod"

export const StoreGetAffiliatesParams = createFindParams({
  limit: 20,
  offset: 0,
}).merge(
  z.object({
    handle: z.union([z.string(), z.array(z.string())]).optional(),
  }),
)
