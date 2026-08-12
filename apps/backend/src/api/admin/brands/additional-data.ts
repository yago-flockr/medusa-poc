import { z } from "@medusajs/framework/zod"

export const brandAdditionalData = {
  brand_id: z.string().nullish(),
}
