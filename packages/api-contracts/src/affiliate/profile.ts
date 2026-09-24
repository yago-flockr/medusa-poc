import { z } from "zod"
import { affiliateMeSchema } from "@dtc/api-contracts/affiliate/me"

export const patchAffiliatesMeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
})

export type PatchAffiliatesMeInput = z.infer<
  typeof patchAffiliatesMeInputSchema
>

export const patchAffiliatesMeResponseSchema = z.object({
  affiliate: affiliateMeSchema,
})

export type PatchAffiliatesMeResponse = z.infer<
  typeof patchAffiliatesMeResponseSchema
>
