import { z } from "@medusajs/framework/zod"

export const brandAdditionalData = {
  brand_id: z.string().nullish(),
}

const brandAdditionalDataSchema = z.object(brandAdditionalData)

export type BrandAdditionalData = z.infer<typeof brandAdditionalDataSchema>
