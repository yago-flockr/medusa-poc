import { z } from "zod"
import { affiliateSchema } from "@dtc/api-contracts/admin/affiliates"

export const orderLinksSchema = z.object({
  referral: z
    .object({
      commission_rate: z.number(),
      commission_total: z.number(),
      affiliate: affiliateSchema.pick({ name: true, handle: true }),
    })
    .nullish(),
})

export type OrderLinks = z.infer<typeof orderLinksSchema>

export type OrderQuery = {
  fields?: string
}
